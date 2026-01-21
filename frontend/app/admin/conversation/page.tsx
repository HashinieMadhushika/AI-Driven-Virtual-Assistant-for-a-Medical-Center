'use client'

import React from 'react'

export default function AdminActiveConversationPage() {
  return (
    <main className="flex-1 overflow-y-auto p-8">
      {/* Page title area (optional) */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Active Conversation</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage live conversations here.
        </p>
      </div>

      {/* Empty state like your screenshot */}
      <div className="min-h-[70vh] rounded-2xl bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] border border-slate-100 shadow-sm" />
    </main>
  )
}
