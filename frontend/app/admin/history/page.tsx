'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatRelativeTime } from '@/app/admin/formatRelativeTime'
import ChatPopup, { ChatBadge, fetchChat, shortId, type ChatSession } from './popup'

type Filter = 'all' | 'active' | 'human'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'human', label: 'Human Takeovers' },
]

// How often the table refreshes
const LIST_REFRESH_MS = 15_000

export default function AdminChatHistoryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sessions, setSessions] = useState<ChatSession[] | null>(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<ChatSession | null>(null)

  // Load all chats from the database, and refresh so new chats and status changes appear
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchChat<{ sessions: ChatSession[] }>('sessions')
        setSessions(data.sessions)
        setError('')
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Failed to load chats')
      }
    }

    loadSessions()
    const timer = setInterval(loadSessions, LIST_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  const filteredRows = useMemo(() => {
    const rows = sessions ?? []
    if (filter === 'all') return rows
    if (filter === 'active') return rows.filter((r) => r.status === 'Active')
    return rows.filter((r) => r.type === 'Human')
  }, [sessions, filter])

  const closePopup = useCallback(() => setSelected(null), [])

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* Title + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Live &amp; Recent Chats
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                  ${
                    filter === value
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">❌ {error}</p>}

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[780px] bg-white rounded-xl border border-slate-100 shadow-sm">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 bg-slate-50 rounded-t-xl">
              <div>Chat ID</div>
              <div>Patient</div>
              <div>Type</div>
              <div>Status</div>
              <div>Time</div>
              <div className="text-center">Action</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-slate-100">
              {filteredRows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-6 gap-4 px-6 py-4 items-center text-sm text-slate-700"
                >
                  <div className="font-medium text-slate-800" title={r.id}>{shortId(r.id)}</div>
                  <div>
                    <div>{r.firstName || 'Guest'}</div>
                    {r.email && <div className="text-xs text-slate-400">{r.email}</div>}
                  </div>
                  <div><ChatBadge value={r.type} /></div>
                  <div><ChatBadge value={r.status} /></div>
                  <div className="text-slate-500" title={new Date(r.lastActivityAt).toLocaleString()}>
                    {formatRelativeTime(r.lastActivityAt)}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="inline-flex items-center  px-6 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition"
                    >
                      View Chat
                    </button>
                  </div>
                </div>
              ))}

              {sessions === null && !error && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading chats...
                </div>
              )}

              {sessions !== null && filteredRows.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No chats found for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-16" />

      {selected && <ChatPopup session={selected} onClose={closePopup} />}
    </main>
  )
}
