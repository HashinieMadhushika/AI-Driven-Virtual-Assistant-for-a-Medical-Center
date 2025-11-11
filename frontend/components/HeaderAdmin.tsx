'use client'
import React from 'react'
import { Bell } from 'lucide-react'

export default function Header() {
  return (
    <header
      className="flex items-center justify-between bg-white shadow-sm px-6"
      style={{
        height: '70px',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <Bell size={20} className="text-gray-600 cursor-pointer" />
        <div className="flex items-center gap-2">
          <div className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
            JM
          </div>
          <span className="text-sm text-gray-700 font-medium">John Miller</span>
          <button className="text-red-500 text-sm font-medium">Sign Out</button>
        </div>
      </div>
    </header>
  )
}
