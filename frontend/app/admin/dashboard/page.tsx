'use client'

import React from 'react'
import SidebarAdmin from '@/components/SidebarAdmin'
import Header from '@/components/HeaderAdmin'

export default function AdminDashboard() {
  const stats = [
    { title: 'Active AI Conversations', value: 24 },
    { title: 'Total Appointments', value: 12 },
    { title: 'Patients Served Today', value: 48 },
    { title: 'Doctors Available', value: 23 },
  ]

  const patients = [
    { name: 'Robert Martinez', priority: 'High' },
    { name: 'Jennifer Lee', priority: 'Medium' },
    { name: 'David Thompson', priority: 'Low' },
  ]

  const chats = [
    { name: 'Sarah Johnson', time: '2 min ago', type: 'AI' },
    { name: 'Michael Chen', time: '15 min ago', type: 'Human' },
    { name: 'Emma Davis', time: '1 hour ago', type: 'AI' },
    { name: 'James Wilson', time: '2 hours ago', type: 'AI' },
    { name: 'Lisa Anderson', time: '3 hours ago', type: 'Human' },
  ]

  const appointments = [
    { name: 'Sarah Johnson', time: '09:00 AM', doctor: 'Dr. Emily Roberts', status: 'Confirmed' },
    { name: 'Michael Chen', time: '10:30 AM', doctor: 'Dr. Marcus Thompson', status: 'Confirmed' },
    { name: 'Emma Davis', time: '11:00 AM', doctor: 'Dr. Sarah Kim', status: 'Pending' },
    { name: 'James Wilson', time: '02:00 PM', doctor: 'Dr. David Martinez', status: 'Confirmed' },
    { name: 'Lisa Anderson', time: '03:30 PM', doctor: 'Dr. Jennifer Lee', status: 'Confirmed' },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe]">
      {/* === Sidebar === */}
      <SidebarAdmin />

      {/* === Main Content Area === */}
      <div
        className="flex flex-col flex-1"
        style={{
          marginLeft: '220px', // match SidebarAdmin width
        }}
      >
        {/* === Header === */}
        <div className="sticky top-0 z-50">
          <Header />
        </div>

        {/* === Dashboard Content === */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* === Patients Waiting for Assistance === */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 p-6 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-rose-700">
                  3 Patients Waiting for Human Assistance
                </h3>
                <p className="text-sm text-gray-600">
                  These conversations need immediate attention from a human operator.
                </p>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                View All
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {patients.map((p, i) => (
                <span
                  key={i}
                  className="bg-white border px-3 py-1 rounded-full text-sm shadow-sm"
                >
                  {p.name} <span className="text-gray-400">· {p.priority}</span>
                </span>
              ))}
            </div>
          </div>

          {/* === Stats Cards === */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl shadow text-center hover:shadow-md transition"
              >
                <p className="text-gray-600 text-sm">{s.title}</p>
                <h2 className="text-3xl font-semibold text-cyan-700 mt-2">{s.value}</h2>
              </div>
            ))}
          </div>

          {/* === Quick Appointment Booking === */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-2xl p-6 flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-semibold">Quick Appointment Booking</h3>
              <p className="text-sm text-teal-100">
                Schedule a new appointment for your patients quickly.
              </p>
            </div>
            <button className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100">
              + New Appointment
            </button>
          </div>

          {/* === Bottom Section: Chats + Appointments === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Chats */}
            <div className="p-6 bg-white rounded-2xl shadow">
              <div className="flex justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Recent Chats</h3>
                <button className="text-sm text-cyan-600 hover:underline">View All</button>
              </div>
              <ul className="space-y-3">
                {chats.map((chat, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{chat.name}</p>
                      <p className="text-gray-400">{chat.time}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        chat.type === 'AI'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {chat.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Today's Appointments */}
            <div className="p-6 bg-white rounded-2xl shadow">
              <div className="flex justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Today's Appointments</h3>
                <button className="text-sm text-cyan-600 hover:underline">View All</button>
              </div>
              <ul className="space-y-3">
                {appointments.map((a, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{a.name}</p>
                      <p className="text-gray-400">
                        {a.time} · {a.doctor}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        a.status === 'Confirmed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
