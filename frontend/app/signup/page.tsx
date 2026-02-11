'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeartPulse } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    if (!fullName || !email || !password) return false
    if (password.length < 6) return false
    return true
  }, [fullName, email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!canSubmit) {
      setError('Please fill all required fields correctly.')
      return
    }

    setLoading(true)
    try {
      // ✅ Admin signup only
      const signupRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: 'admin',
        }),
      })

      const signupData = await signupRes.json()
      if (!signupRes.ok) {
        throw new Error(signupData.message || 'Signup failed')
      }

      // ✅ Auto-login after signup
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginRes.json()
      if (!loginRes.ok) {
        throw new Error(loginData.message || 'Login failed after signup')
      }

      localStorage.setItem('token', loginData.token)

      // ✅ Go to admin dashboard
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white shadow">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-center text-xl font-semibold text-slate-800">
          Create Admin Account
        </h1>
        <p className="text-center text-sm text-slate-500 mt-1">
          Sign up as an administrator
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Full Name</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 6 characters
            </p>
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button
            className="text-teal-700 hover:underline"
            onClick={() => router.push('/login')}
            type="button"
          >
            Log In
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => router.push('/homepage')}
            className="text-xs text-teal-700 hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
