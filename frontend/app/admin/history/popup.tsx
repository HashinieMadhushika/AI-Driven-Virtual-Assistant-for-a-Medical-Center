'use client'

import React, { useEffect, useRef, useState } from 'react'

export type ChatType = 'AI' | 'Human'
export type ChatStatus = 'Active' | 'Completed'

export type ChatSession = {
  id: string
  firstName: string | null
  email: string | null
  source: string
  createdAt: string
  lastActivityAt: string
  messageCount: number
  type: ChatType
  status: ChatStatus
}

type ChatMessage = {
  id: number
  role: string
  content: string
  createdAt: string
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000'

// How often an open active chat checks for new messages
const LIVE_CHAT_REFRESH_MS = 3_000

// GET a chat endpoint with the admin's login token
export async function fetchChat<T>(path: string): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API}/api/chat/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Failed to load chats')
  return data as T
}

// Short, readable chat ID from the session UUID, e.g. "71264295"
export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

const BADGE_COLORS: Record<ChatType | ChatStatus, string> = {
  AI: 'bg-emerald-100 text-emerald-700',
  Human: 'bg-sky-100 text-sky-700',
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-slate-100 text-slate-700',
}

// Type (AI/Human) or Status (Active/Completed) badge
export function ChatBadge({ value, compact = false }: { value: ChatType | ChatStatus; compact?: boolean }) {
  return (
    <span
      className={`inline-flex px-3 rounded-full text-xs font-medium ${compact ? 'py-0.5' : 'py-1'} ${BADGE_COLORS[value]}`}
    >
      {value}
    </span>
  )
}

function senderLabel(role: string) {
  if (role === 'user') return 'Patient'
  if (role === 'assistant') return 'AI Assistant'
  if (role === 'system') return 'System'
  return 'Staff'
}

export default function ChatPopup({ session, onClose }: { session: ChatSession; onClose: () => void }) {
  const [current, setCurrent] = useState(session)
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [error, setError] = useState('')
  const messagesBoxRef = useRef<HTMLDivElement>(null)

  // Load the messages; while the chat is active, keep checking for new ones (live chat)
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = async () => {
      try {
        const data = await fetchChat<{ session: ChatSession; messages: ChatMessage[] }>(
          `sessions/${session.id}`
        )
        if (cancelled) return
        setCurrent(data.session)
        setMessages(data.messages)
        setError('')
        if (data.session.status === 'Active') timer = setTimeout(load, LIVE_CHAT_REFRESH_MS)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load messages')
        timer = setTimeout(load, LIVE_CHAT_REFRESH_MS)
      }
    }

    load()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [session.id])

  // Keep the newest message in view (scrolls only the popup's message box, not the page)
  useEffect(() => {
    const box = messagesBoxRef.current
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  }, [messages?.length])

  // Close with the Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 text-white">
          <div>
            <div className="text-lg font-semibold">{current.firstName || 'Guest'}</div>
            <div className="text-xs text-teal-100">
              {current.email ? `${current.email} • ` : ''}Chat {shortId(current.id)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ChatBadge value={current.type} compact />
              <ChatBadge value={current.status} compact />
              {current.status === 'Active' && (
                <span className="inline-flex items-center gap-1 text-xs text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />
                  Live
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-xl leading-none text-white/80 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesBoxRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-6 py-5">
          {error && <div className="text-sm text-red-600">❌ {error}</div>}

          {messages === null && !error && (
            <div className="py-10 text-center text-sm text-slate-500">Loading messages...</div>
          )}

          {messages?.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">No messages in this chat yet.</div>
          )}

          {messages?.map((m) => {
            const fromPatient = m.role === 'user'
            return (
              <div key={m.id} className={`flex ${fromPatient ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                    fromPatient
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className={`mb-1 text-[11px] font-semibold ${fromPatient ? 'text-teal-100' : 'text-slate-500'}`}>
                    {senderLabel(m.role)}
                  </div>
                  <div className="whitespace-pre-line">{m.content}</div>
                  <div className={`mt-2 text-[10px] ${fromPatient ? 'text-teal-100' : 'text-slate-400'}`}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
