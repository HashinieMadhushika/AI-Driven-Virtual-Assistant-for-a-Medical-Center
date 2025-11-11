'use client'
import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  FileText,
  Users,
  UserCircle2,
} from 'lucide-react'

export default function SidebarAdmin() {
  const [active, setActive] = React.useState('Dashboard')

  const menus = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Appointments', icon: <CalendarDays size={20} />, path: '/admin/appointments' },
    { name: 'Active Conversation', icon: <MessageSquare size={20} />, path: '/admin/conversations' },
    { name: 'Chat History', icon: <FileText size={20} />, path: '/admin/chats' },
    { name: 'Patients', icon: <Users size={20} />, path: '/admin/patients' },
    { name: 'Doctors', icon: <UserCircle2 size={20} />, path: '/admin/doctors' },
  ]

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '220px',
        background: 'linear-gradient(to bottom, #f8fafc, #e0f2fe)',
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {/* Logo */}
      <div className="mb-8 w-full text-center">
        <h2 className="text-lg font-semibold text-cyan-700 tracking-wide">ADMIN</h2>
        <p className="text-xs text-gray-500">MediCare AI System</p>
      </div>

      {/* Navigation */}
      <nav
        style={{
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.path}
            onClick={() => setActive(menu.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: active === menu.name ? '#0891b2' : 'transparent',
              color: active === menu.name ? 'white' : '#334155',
              textDecoration: 'none',
              transition: '0.2s',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem',
            }}
          >
            {menu.icon}
            <span>{menu.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
