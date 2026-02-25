"use client";

import React, { useEffect, useState } from "react";

type ChatSession = {
  id: string;
  source: string;
  createdAt: string;
  lastMessage: {
    role: string;
    content: string;
    createdAt: string;
  } | null;
};

type ChatMessage = {
  id: number;
  role: "assistant" | "user" | "system";
  content: string;
  createdAt: string;
};

export default function AdminActiveConversationPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/api/chat/sessions`);
        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }
        const data = (await response.json()) as { sessions: ChatSession[] };
        setSessions(data.sessions);
        setSelectedSession(data.sessions[0] ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load sessions");
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [backendBaseUrl]);

  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await fetch(`${backendBaseUrl}/api/chat/sessions/${selectedSession.id}`);
        if (!response.ok) {
          throw new Error("Failed to load messages");
        }
        const data = (await response.json()) as { messages: ChatMessage[] };
        setMessages(data.messages);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [backendBaseUrl, selectedSession]);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Conversation History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review chatbot sessions and patient requests.
        </p>
      </div>

      {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">Sessions</div>
          <div className="mt-4 space-y-3">
            {loadingSessions ? (
              <div className="text-sm text-slate-500">Loading sessions…</div>
            ) : sessions.length === 0 ? (
              <div className="text-sm text-slate-500">No chat sessions yet.</div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selectedSession?.id === session.id
                      ? "border-teal-200 bg-teal-50 text-teal-700"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-teal-100"
                  }`}
                >
                  <div className="font-semibold">Session {session.id.slice(0, 8)}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {new Date(session.createdAt).toLocaleString()}
                  </div>
                  {session.lastMessage ? (
                    <div className="mt-2 line-clamp-2 text-[11px] text-slate-500">
                      {session.lastMessage.content}
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">Conversation</div>
          <div className="mt-4 space-y-4">
            {loadingMessages ? (
              <div className="text-sm text-slate-500">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-slate-500">Select a session to view details.</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs shadow-sm border ${
                      message.role === "user"
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="whitespace-pre-line">{message.content}</div>
                    <div className="mt-2 text-[10px] text-slate-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
