"use client";

import React, { useEffect, useRef, useState } from "react";

type ChatSession = {
  id: string;
  firstName: string | null;
  email: string | null;
  source: string;
  createdAt: string;
  lastActivityAt: string;
  type: "AI" | "Human";
  status: "Active" | "Completed";
  lastMessage: {
    role: string;
    content: string;
    createdAt: string;
  } | null;
};

type ChatMessage = {
  id: number;
  role: string;
  content: string;
  createdAt: string;
};

// How often the active-chat list refreshes, and how often the open conversation checks for new messages
const SESSIONS_REFRESH_MS = 15_000;
const MESSAGES_REFRESH_MS = 3_000;

// Chat data is admin-only, so send the admin's login token
const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminActiveConversationPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Messages are stored with the session they belong to, so switching chats never shows the old chat's messages
  const [loaded, setLoaded] = useState<{ sessionId: string; messages: ChatMessage[] } | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

  // Load only the active chats (last message within the last 30 minutes) and keep the list up to date
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/api/chat/sessions`, { headers: authHeaders() });
        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }
        const data = (await response.json()) as { sessions: ChatSession[] };
        const active = data.sessions.filter((s) => s.status === "Active");
        setSessions(active);
        // Keep the open chat while it is still active; otherwise open the most recent active chat
        setSelectedId((current) =>
          current && active.some((s) => s.id === current) ? current : active[0]?.id ?? null
        );
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load sessions");
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
    const timer = setInterval(loadSessions, SESSIONS_REFRESH_MS);
    return () => clearInterval(timer);
  }, [backendBaseUrl]);

  // Load the open chat's messages and keep checking for new ones (live chat)
  useEffect(() => {
    if (!selectedId) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/api/chat/sessions/${selectedId}`, {
          headers: authHeaders(),
        });
        if (!response.ok) {
          throw new Error("Failed to load messages");
        }
        const data = (await response.json()) as { messages: ChatMessage[] };
        setLoaded({ sessionId: selectedId, messages: data.messages });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load messages");
      }
    };

    loadMessages();
    const timer = setInterval(loadMessages, MESSAGES_REFRESH_MS);
    return () => clearInterval(timer);
  }, [backendBaseUrl, selectedId]);

  const messages = loaded && loaded.sessionId === selectedId ? loaded.messages : null;

  // Keep the newest message in view (scrolls only the conversation box, not the page)
  useEffect(() => {
    const box = messagesBoxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Active Conversations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Live chatbot sessions with a message in the last 30 minutes.
        </p>
      </div>

      {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">Active Sessions</div>
            {!loadingSessions && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                {sessions.length} active
              </span>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {loadingSessions ? (
              <div className="text-sm text-slate-500">Loading sessions…</div>
            ) : sessions.length === 0 ? (
              <div className="text-sm text-slate-500">No active chats right now.</div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedId(session.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selectedId === session.id
                      ? "border-teal-200 bg-teal-50 text-teal-700"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-teal-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">
                      {session.firstName || `Session ${session.id.slice(0, 8)}`}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        session.type === "Human" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {session.type}
                    </span>
                  </div>
                  {session.email ? (
                    <div className="mt-0.5 text-[11px] text-slate-500">{session.email}</div>
                  ) : null}
                  <div className="mt-1 text-[11px] text-slate-500">
                    {new Date(session.lastActivityAt).toLocaleString()}
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
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-800">Conversation</div>
            {selectedId && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>
          <div ref={messagesBoxRef} className="mt-4 max-h-[65vh] space-y-4 overflow-y-auto">
            {!selectedId ? (
              <div className="text-sm text-slate-500">
                {loadingSessions ? "Loading…" : "No active chat to show."}
              </div>
            ) : messages === null ? (
              <div className="text-sm text-slate-500">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-slate-500">No messages in this chat yet.</div>
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
