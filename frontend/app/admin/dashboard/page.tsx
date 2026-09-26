'use client'

import React, { useEffect, useState } from 'react'
import AppointmentForm from '@/app/admin/components/AppointmentformAdmin'
import { formatRelativeTime } from '@/app/admin/formatRelativeTime'

type ChatItem = {
  id: string
  firstName: string | null
  source: string
  lastActivityAt: string
  messageCount: number
}

type AppointmentItem = {
  id: number
  patientName: string
  doctorName: string
  appointmentTime: string
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
}

type DashboardStats = {
  activeAIConversationsToday: number
  totalAppointmentsToday: number
  patientsServedToday: number
  doctorsAvailableToday: number
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000'

// "14:30:00" → "02:30 PM"
function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

// "floating-chat" → "Floating Chat"
function formatSource(source: string) {
  return source
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

// GET an admin dashboard endpoint with the admin's login token
async function fetchDashboard<T>(path: string): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API}/api/dashboard/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Failed to load dashboard data')
  return data as T
}

function statusBadgeClasses(status: AppointmentItem['status']) {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-100 text-green-700'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
    case 'Completed':
      return 'bg-sky-100 text-sky-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center min-h-[110px]">
      <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 mb-2">
        {icon}
      </div>
      <div className="text-xs text-slate-500 text-center">{label}</div>
      <div className="text-2xl font-semibold text-slate-800 mt-1">{value}</div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [showForm, setShowForm] = useState(false)
  const [now, setNow] = useState(new Date())


  useEffect(() => {
    const everyMinute = setInterval(() => setNow(new Date()), 60_000)

    const msUntilMidnight = (() => {
      const d = new Date()
      const next = new Date(d)
      next.setHours(24, 0, 0, 0)
      return next.getTime() - d.getTime()
    })()

    const midnightTimer = setTimeout(() => setNow(new Date()), msUntilMidnight + 1000)

    return () => {
      clearInterval(everyMinute)
      clearTimeout(midnightTimer)
    }
  }, [])

  // Stat cards and both lists come from the database; refreshed every minute (when `now` ticks)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsError, setStatsError] = useState('')
  const [recentChats, setRecentChats] = useState<ChatItem[] | null>(null)
  const [chatsError, setChatsError] = useState('')
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentItem[] | null>(null)
  const [appointmentsError, setAppointmentsError] = useState('')

  useEffect(() => {
    const load = async <T,>(
      path: string,
      setData: (data: T) => void,
      setError: (message: string) => void
    ) => {
      try {
        setData(await fetchDashboard<T>(path))
        setError('')
      } catch (error) {
        console.error(error)
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      }
    }

    load<DashboardStats>('stats', setStats, setStatsError)
    load<ChatItem[]>('recent-chats', setRecentChats, setChatsError)
    load<AppointmentItem[]>('todays-appointments', setTodaysAppointments, setAppointmentsError)
  }, [now])

  const statValue = (value: number | undefined) => (value === undefined ? (statsError ? '—' : '...') : value)

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] min-h-screen">
      {/* Stats */}
      {statsError && (
        <p className="mb-4 text-sm text-red-600">❌ {statsError}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active AI Conversations Today" value={statValue(stats?.activeAIConversationsToday)} icon={<span>💬</span>} />
        <StatCard label="Total Appointments Today" value={statValue(stats?.totalAppointmentsToday)} icon={<span>📅</span>} />
        <StatCard label="Patients Served Today" value={statValue(stats?.patientsServedToday)} icon={<span>👥</span>} />
        <StatCard label="Doctors Available Today" value={statValue(stats?.doctorsAvailableToday)} icon={<span>🩺</span>} />
      </div>

      {/* Quick Booking */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-2xl p-6 flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-semibold">Quick Appointment Booking</h3>
          <p className="text-sm text-teal-100">Schedule a new appointment for your patients quickly.</p>
        </div>
        <button
          className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100"
          onClick={() => setShowForm(true)}
        >
          + New Appointment
        </button>
      </div>

      {showForm && <AppointmentForm />}

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-800">Recent Chats</h4>
            <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">View All</button>
          </div>

          <div className="space-y-3">
            {recentChats?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{c.firstName || 'Guest'}</div>
                    <div className="text-xs text-slate-500">
                      {formatRelativeTime(c.lastActivityAt)} • {c.messageCount} message{c.messageCount === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-700">
                  {formatSource(c.source)}
                </span>
              </div>
            ))}

            {chatsError ? (
              <div className="text-sm text-red-600 py-8 text-center">❌ {chatsError}</div>
            ) : recentChats === null ? (
              <div className="text-sm text-slate-500 py-8 text-center">Loading chats...</div>
            ) : recentChats.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No chats yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-800">Today&apos;s Appointments</h4>
            <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">View All</button>
          </div>

          <div className="space-y-3">
            {todaysAppointments?.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                <div>
                  <div className="text-sm font-medium text-slate-800">{a.patientName}</div>
                  <div className="text-xs text-slate-500">
                    {formatTime(a.appointmentTime)} • {a.doctorName}
                  </div>
                </div>

                <span className={'text-xs px-3 py-1 rounded-full font-medium ' + statusBadgeClasses(a.status)}>
                  {a.status}
                </span>
              </div>
            ))}

            {appointmentsError ? (
              <div className="text-sm text-red-600 py-8 text-center">❌ {appointmentsError}</div>
            ) : todaysAppointments === null ? (
              <div className="text-sm text-slate-500 py-8 text-center">Loading appointments...</div>
            ) : todaysAppointments.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No appointments for today.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
