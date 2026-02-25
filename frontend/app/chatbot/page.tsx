"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Send, Plus, Menu, X, FileText, Upload, Paperclip } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type BookingDraft = {
  step: "none" | "doctor" | "datetime" | "patient";
  doctorId?: number | string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
};

type RescheduleDraft = {
  step: "none" | "lookup" | "datetime";
  appointmentId?: string;
  patientEmail?: string;
};

type CancelDraft = {
  step: "none" | "lookup" | "reason";
  appointmentId?: string;
  patientEmail?: string;
  cancellationReason?: string;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;
type SpeechResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type ChatContext = {
  bookingDraft?: BookingDraft;
  rescheduleDraft?: RescheduleDraft;
  cancelDraft?: CancelDraft;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const quickActions = [
  { icon: "📅", label: "Book appointment", prompt: "I want to book an appointment" },
  { icon: "🏥", label: "Find doctors", prompt: "Show me available doctors" },
  { icon: "📋", label: "Check reports", prompt: "Show my medical reports" },
  { icon: "💊", label: "My prescriptions", prompt: "Show my prescriptions" },
];

const ChatbotPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>({
    bookingDraft: { step: "none" },
    rescheduleDraft: { step: "none" },
    cancelDraft: { step: "none" }
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const reportInputRef = useRef<HTMLInputElement>(null);
  const prescriptionInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

  const recognition = useMemo(() => {
    if (typeof window === "undefined") return null;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;
    const instance = new Recognition();
    instance.lang = "en-US";
    instance.interimResults = false;
    instance.maxAlternatives = 1;
    return instance;
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setVoiceSupported(Boolean(recognition));
  }, [recognition]);

  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedSessionId = window.localStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      return;
    }
    const newSessionId = crypto.randomUUID();
    window.localStorage.setItem("chatSessionId", newSessionId);
    setSessionId(newSessionId);
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const addAssistantMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text }]);
    speak(text);
  };

  const sendMessage = async (text: string) => {
    if (sending || !text.trim()) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text };
    const nextMessages = [...messagesRef.current, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
          context: chatContext,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to reach the AI assistant.");
      }

      const data = await response.json();
      const replyText = (data.reply as string) || "I am sorry, I did not get a response.";
      addAssistantMessage(replyText);
      if (data.nextContext) {
        setChatContext(data.nextContext as ChatContext);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const analyzeFile = async (kind: "report" | "prescription") => {
    const file = kind === "report" ? reportFile : prescriptionFile;
    if (!file) {
      setError(`Please choose a ${kind} file first.`);
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        kind === "report"
          ? `${backendBaseUrl}/api/ai/reports/analyze`
          : `${backendBaseUrl}/api/ai/prescriptions/analyze`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Analysis failed.");
      }

      const data = (await response.json()) as { analysis?: string };
      const header = kind === "report" ? "📋 Lab Report Analysis" : "💊 Prescription Analysis";
      addAssistantMessage(`${header}\n\n${data.analysis ?? "No analysis returned."}`);
      if (kind === "report") {
        setReportFile(null);
      } else {
        setPrescriptionFile(null);
      }
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    void sendMessage(trimmed);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    if (listening) return;
    setListening(true);
    setError(null);
    recognition.start();

    recognition.onresult = (event: SpeechResultEvent) => {
      const transcript = event.results[0][0]?.transcript ?? "";
      const trimmed = transcript.trim();
      if (trimmed) void sendMessage(trimmed);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Voice input failed. Please check microphone permissions.");
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-linear-to-b from-teal-50 to-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-teal-200 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 hover:bg-teal-100 rounded-lg transition"
          >
            {showSidebar ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">MediCare AI</div>
              <div className="text-xs text-green-600 font-medium">Online</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-1 rounded-lg hover:bg-gray-100/60"
        >
          Back
        </button>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isEmptyChat ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Logo */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🏥</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  Welcome to MediCare AI
                </h1>
                <p className="text-gray-600 text-lg">
                  Your intelligent medical assistant, ready to help 24/7
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(action.prompt)}
                    className="group relative px-6 py-4 rounded-xl bg-white/60 border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition duration-300 text-left overflow-hidden shadow-sm hover:shadow-md"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-teal-600/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <div className="relative flex items-center gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-teal-600 transition">
                          {action.label}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Document Upload Cards */}
              <div className="pt-4 space-y-3">
                <p className="text-gray-600 text-sm font-medium">Or upload documents</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="group relative px-4 py-3 rounded-lg bg-white/50 border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-center gap-2 text-gray-700 group-hover:text-teal-600">
                      <FileText size={18} />
                      <span className="text-sm font-medium">Upload Lab Report</span>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                  <label className="group relative px-4 py-3 rounded-lg bg-white/50 border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-center gap-2 text-gray-700 group-hover:text-teal-600">
                      <FileText size={18} />
                      <span className="text-sm font-medium">Upload Prescription</span>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  {reportFile && (
                    <button
                      onClick={() => analyzeFile("report")}
                      disabled={analyzing}
                      className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                      {analyzing ? "Analyzing..." : "Analyze Report"}
                    </button>
                  )}
                  {prescriptionFile && (
                    <button
                      onClick={() => analyzeFile("prescription")}
                      disabled={analyzing}
                      className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                      {analyzing ? "Analyzing..." : "Analyze Prescription"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth bg-white"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(13, 148, 136, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.03) 0%, transparent 50%)",
            }}
          >
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-linear-to-r from-teal-600 to-cyan-500 text-white shadow-md rounded-br-none"
                      : "bg-gray-100 border border-gray-200 text-gray-900 shadow-sm rounded-bl-none"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-line break-words">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}

            {(sending || analyzing) && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-gray-100 border border-gray-200 text-gray-900 shadow-sm rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "240ms" }} />
                    <span className="text-xs text-gray-600 ml-1">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-600 text-sm animate-in fade-in duration-300 font-medium">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-teal-200/50 bg-white/90 backdrop-blur-md px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* File Status */}
          {(reportFile || prescriptionFile) && (
            <div className="flex gap-2 text-xs">
              {reportFile && (
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-100 border border-teal-300 rounded-full text-teal-700">
                  <Upload size={14} />
                  <span>{reportFile.name}</span>
                </div>
              )}
              {prescriptionFile && (
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-100 border border-teal-300 rounded-full text-teal-700">
                  <Upload size={14} />
                  <span>{prescriptionFile.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-center gap-2 bg-white border border-teal-200 rounded-2xl px-4 py-3 focus-within:border-teal-400 focus-within:shadow-lg focus-within:shadow-teal-200/50 transition shadow-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything... 💬"
              className="flex-1 bg-transparent outline-none text-gray-900 text-sm placeholder-gray-400"
              disabled={sending}
            />
            <div className="flex items-center gap-2 relative">
              {/* Upload Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  className="p-2 hover:bg-teal-50 text-gray-600 hover:text-teal-600 rounded-lg transition disabled:opacity-50"
                  aria-label="Upload documents"
                  disabled={sending}
                >
                  <Paperclip size={18} />
                </button>
                {showUploadMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white border border-teal-200 rounded-lg shadow-lg p-2 min-w-48 z-50">
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-teal-50 rounded cursor-pointer transition">
                      <FileText size={16} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">Lab Report</span>
                      <input
                        ref={reportInputRef}
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) => {
                          setReportFile(e.target.files?.[0] ?? null);
                          setShowUploadMenu(false);
                        }}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-teal-50 rounded cursor-pointer transition">
                      <FileText size={16} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">Prescription</span>
                      <input
                        ref={prescriptionInputRef}
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) => {
                          setPrescriptionFile(e.target.files?.[0] ?? null);
                          setShowUploadMenu(false);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              {voiceSupported && (
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg transition ${
                    listening
                      ? "bg-teal-100 text-teal-600"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  } disabled:opacity-50`}
                  aria-label="Voice input"
                  disabled={sending}
                >
                  <Mic size={18} />
                </button>
              )}
              <button
                onClick={handleSend}
                className="p-2 bg-linear-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white rounded-lg transition disabled:opacity-50 shadow-md"
                aria-label="Send"
                disabled={sending || !input.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
