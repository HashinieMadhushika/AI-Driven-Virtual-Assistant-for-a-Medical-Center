'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Public pages under /doctor that should NOT require token
  const isPublicPage =
    pathname === '/doctor/login' || pathname.startsWith('/doctor/accept-invite')

  useEffect(() => {
    // ✅ Skip auth check for public pages
    if (isPublicPage) {
      setLoading(false)
      return
    }

    // ✅ Check authentication for other doctor pages
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    const userData = localStorage.getItem('user')

    if (!token || userRole !== 'doctor') {
      router.push('/login') // ✅ you already have /login, not /doctor/login
      return
    }

    if (userData) setDoctor(JSON.parse(userData))
    setLoading(false)
  }, [router, pathname, isPublicPage])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    router.push('/login') // ✅
  }

  const navItems = [
    { name: 'Dashboard', href: '/doctor/dashboard' },
    { name: 'Appointments', href: '/doctor/appointments' },
    { name: 'Profile', href: '/doctor/profile' },
  ]

  // ✅ Public page should render without doctor layout UI
  if (isPublicPage) return <>{children}</>

  // Loading while checking auth
  if (loading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">MediAssist Doctor</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-semibold text-sm">DR. {doctor?.name}</p>
              <p className="text-xs text-cyan-100">{doctor?.specialization}</p>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-73px)] p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full text-left px-4 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            )
          })}
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
