'use client'

import React, { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    if (!token) return false
    if (password.length < 6) return false
    if (password !== confirm) return false
    return true
  }, [token, password, confirm])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!canSubmit) {
      setError('Check token and password (min 6) + confirm password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/doctors/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to set password')

      router.push('/login') // ✅ go to your main login page
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow p-8">
        <h1 className="text-xl font-semibold text-slate-800">Set Doctor Password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a password to activate your doctor account.
        </p>

        {!token && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            Token missing. Please open the invite link from your email again.
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">New Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Confirm Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-xl py-3 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
