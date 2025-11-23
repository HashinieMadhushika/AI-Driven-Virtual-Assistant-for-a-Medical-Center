
// 'use client'

// import React, { useState } from 'react'
// import SidebarAdmin from '@/components/SidebarAdmin'
// import Header from '@/components/HeaderAdmin'
// import AppointmentForm from '@/components/AppointmentformAdmin'

// export default function AdminDashboard() {
//   const [showForm, setShowForm] = useState(false)

//   return (
//     <div className="flex h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe]">
//       <SidebarAdmin />
//       <div className="flex flex-col flex-1">
//         <Header />

//         <main className="flex-1 overflow-y-auto p-8">
//           {/* Quick Appointment Booking */}
//           <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-2xl p-6 flex justify-between items-center mb-8">
//             <div>
//               <h3 className="text-lg font-semibold">Quick Appointment Booking</h3>
//               <p className="text-sm text-teal-100">
//                 Schedule a new appointment for your patients quickly.
//               </p>
//             </div>
//             <button
//               className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100"
//               onClick={() => setShowForm(true)}
//             >
//               + New Appointment
//             </button>
//           </div>

//           {/* Render Appointment Form */}
//           {showForm && <AppointmentForm />}
//         </main>
//       </div>
//     </div>
//   )
// }
'use client'

import React, { useState } from 'react'
import SidebarAdmin from '@/components/SidebarAdmin'
import Header from '@/components/HeaderAdmin'
import AppointmentForm from '@/components/AppointmentformAdmin'

export default function AdminDashboard() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe]">
      {/* Full-width Header */}
      <Header />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar on left */}
        <SidebarAdmin />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Quick Appointment Booking */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-2xl p-6 flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-semibold">Quick Appointment Booking</h3>
              <p className="text-sm text-teal-100">
                Schedule a new appointment for your patients quickly.
              </p>
            </div>
            <button
              className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100"
              onClick={() => setShowForm(true)}
            >
              + New Appointment
            </button>
          </div>

          {/* Render Appointment Form */}
          {showForm && <AppointmentForm />}
        </main>
      </div>
    </div>
  )
}
