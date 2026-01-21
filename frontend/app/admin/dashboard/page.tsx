// // 'use client'

// // import React, { useEffect, useMemo, useState } from 'react'
// // import SidebarAdmin from '@/admincomponents/SidebarAdmin'
// // import Header from '@/admincomponents/HeaderAdmin'
// // import AppointmentForm from '@/admincomponents/AppointmentformAdmin'

// // type ChatItem = {
// //   id: string
// //   name: string
// //   type: 'AI' | 'Human'
// //   createdAt: string // ISO
// // }

// // type AppointmentItem = {
// //   id: string
// //   patientName: string
// //   time: string // "09:00 AM"
// //   doctorName: string
// //   status: 'Confirmed' | 'Pending' | 'Cancelled'
// //   date: string // "YYYY-MM-DD"
// // }

// // function formatRelativeTime(iso: string) {
// //   const now = new Date()
// //   const then = new Date(iso)
// //   const diffMs = now.getTime() - then.getTime()

// //   const diffMin = Math.floor(diffMs / 60000)
// //   if (diffMin < 1) return 'Just now'
// //   if (diffMin < 60) return `${diffMin} min ago`

// //   const diffHr = Math.floor(diffMin / 60)
// //   if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`

// //   const diffDay = Math.floor(diffHr / 24)
// //   return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
// // }

// // function getTodayKey(d = new Date()) {
// //   // local date key: YYYY-MM-DD
// //   const yyyy = d.getFullYear()
// //   const mm = String(d.getMonth() + 1).padStart(2, '0')
// //   const dd = String(d.getDate()).padStart(2, '0')
// //   return `${yyyy}-${mm}-${dd}`
// // }

// // function statusBadgeClasses(status: AppointmentItem['status']) {
// //   switch (status) {
// //     case 'Confirmed':
// //       return 'bg-green-100 text-green-700'
// //     case 'Pending':
// //       return 'bg-yellow-100 text-yellow-700'
// //     case 'Cancelled':
// //       return 'bg-red-100 text-red-700'
// //     default:
// //       return 'bg-gray-100 text-gray-700'
// //   }
// // }

// // function StatCard({
// //   icon,
// //   label,
// //   value,
// // }: {
// //   icon: React.ReactNode
// //   label: string
// //   value: number | string
// // }) {
// //   return (
// //     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center min-h-[110px]">
// //       <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 mb-2">
// //         {icon}
// //       </div>
// //       <div className="text-xs text-slate-500 text-center">{label}</div>
// //       <div className="text-2xl font-semibold text-slate-800 mt-1">{value}</div>
// //     </div>
// //   )
// // }

// // export default function AdminDashboard() {
// //   const [showForm, setShowForm] = useState(false)

// //   // ✅ used only for auto-refreshing “today” + relative time labels
// //   const [now, setNow] = useState<Date>(new Date())

// //   // ---------------------------------------------------------------------------
// //   // Mock data (replace with API later)
// //   // ---------------------------------------------------------------------------
// //   const [recentChats, setRecentChats] = useState<ChatItem[]>([
// //     {
// //       id: 'c1',
// //       name: 'Sarah Johnson',
// //       type: 'AI',
// //       createdAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min ago
// //     },
// //     {
// //       id: 'c2',
// //       name: 'Michael Chen',
// //       type: 'Human',
// //       createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
// //     },
// //     {
// //       id: 'c3',
// //       name: 'Emma Davis',
// //       type: 'AI',
// //       createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
// //     },
// //     {
// //       id: 'c4',
// //       name: 'James Wilson',
// //       type: 'AI',
// //       createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
// //     },
// //     {
// //       id: 'c5',
// //       name: 'Lisa Anderson',
// //       type: 'Human',
// //       createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
// //     },
// //   ])

// //   const [appointments, setAppointments] = useState<AppointmentItem[]>(() => {
// //     const today = getTodayKey()
// //     const tomorrow = getTodayKey(new Date(Date.now() + 24 * 60 * 60 * 1000))

// //     return [
// //       {
// //         id: 'a1',
// //         patientName: 'Sarah Johnson',
// //         time: '09:00 AM',
// //         doctorName: 'Dr. Emily Roberts',
// //         status: 'Confirmed',
// //         date: today,
// //       },
// //       {
// //         id: 'a2',
// //         patientName: 'Michael Chen',
// //         time: '10:30 AM',
// //         doctorName: 'Dr. Marcus Thompson',
// //         status: 'Confirmed',
// //         date: today,
// //       },
// //       {
// //         id: 'a3',
// //         patientName: 'Emma Davis',
// //         time: '11:00 AM',
// //         doctorName: 'Dr. Sarah Kim',
// //         status: 'Pending',
// //         date: today,
// //       },
// //       {
// //         id: 'a4',
// //         patientName: 'James Wilson',
// //         time: '02:00 PM',
// //         doctorName: 'Dr. David Martinez',
// //         status: 'Confirmed',
// //         date: today,
// //       },
// //       {
// //         id: 'a5',
// //         patientName: 'Lisa Anderson',
// //         time: '03:30 PM',
// //         doctorName: 'Dr. Jennifer Lee',
// //         status: 'Confirmed',
// //         date: today,
// //       },

// //       // Not today (to prove day-by-day filtering works)
// //       {
// //         id: 'a6',
// //         patientName: 'Tomorrow Patient',
// //         time: '09:00 AM',
// //         doctorName: 'Dr. Future',
// //         status: 'Confirmed',
// //         date: tomorrow,
// //       },
// //     ]
// //   })

// //   // ---------------------------------------------------------------------------
// //   // Auto update logic (day-by-day + relative times)
// //   // - refresh "now" every minute (updates “x min ago” + quick counters)
// //   // - refresh again exactly after midnight so "today" changes automatically
// //   // ---------------------------------------------------------------------------
// //   useEffect(() => {
// //     const everyMinute = setInterval(() => setNow(new Date()), 60_000)

// //     const msUntilMidnight = (() => {
// //       const d = new Date()
// //       const next = new Date(d)
// //       next.setHours(24, 0, 0, 0)
// //       return next.getTime() - d.getTime()
// //     })()

// //     const midnightTimer = setTimeout(() => {
// //       setNow(new Date())
// //     }, msUntilMidnight + 1000)

// //     return () => {
// //       clearInterval(everyMinute)
// //       clearTimeout(midnightTimer)
// //     }
// //   }, [])

// //   const todayKey = useMemo(() => getTodayKey(now), [now])

// //   const todaysAppointments = useMemo(() => {
// //     return appointments.filter((a) => a.date === todayKey)
// //   }, [appointments, todayKey])

// //   // Example “live” stats derived from data
// //   const totalAppointmentsToday = todaysAppointments.length
// //   const patientsServedToday = useMemo(() => {
// //     // If you have real "checked-in / served" status later, compute from that.
// //     // For now we count confirmed as served.
// //     return todaysAppointments.filter((a) => a.status === 'Confirmed').length
// //   }, [todaysAppointments])

// //   const activeAIConversationsToday = useMemo(() => {
// //     // if you later add createdAt day-filter + isToday, do it here.
// //     // For now: count AI chats created today.
// //     return recentChats.filter((c) => {
// //       const key = getTodayKey(new Date(c.createdAt))
// //       return key === todayKey && c.type === 'AI'
// //     }).length
// //   }, [recentChats, todayKey])

// //   const doctorsAvailableToday = 23 // Replace with API later (availability)

// //   return (
// //     <div className="flex flex-col h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe]">
// //       {/* Full-width Header */}
// //       <Header />

// //       {/* Sidebar + Main Content */}
// //       <div className="flex flex-1 overflow-hidden">
// //         {/* Sidebar on left */}
// //         <SidebarAdmin />

// //         {/* Main Content */}
// //         <main className="flex-1 overflow-y-auto p-8">
// //           {/* ✅ NEW: Top Stats Row */}
// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
// //             <StatCard
// //               label="Active AI Conversations Today"
// //               value={activeAIConversationsToday}
// //               icon={
// //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //                   <path
// //                     d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinejoin="round"
// //                   />
// //                 </svg>
// //               }
// //             />
// //             <StatCard
// //               label="Total Appointments Today"
// //               value={totalAppointmentsToday}
// //               icon={
// //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //                   <path
// //                     d="M8 3v3M16 3v3M3 10h18M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                   />
// //                 </svg>
// //               }
// //             />
// //             <StatCard
// //               label="Patients Served Today"
// //               value={patientsServedToday}
// //               icon={
// //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //                   <path
// //                     d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                   />
// //                   <path
// //                     d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinejoin="round"
// //                   />
// //                   <path
// //                     d="M22 21v-2a4 4 0 0 0-3-3.87"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                   />
// //                   <path
// //                     d="M16 3.13a4 4 0 0 1 0 7.75"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                   />
// //                 </svg>
// //               }
// //             />
// //             <StatCard
// //               label="Doctors Available Today"
// //               value={doctorsAvailableToday}
// //               icon={
// //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //                   <path
// //                     d="M9 18h6"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                   />
// //                   <path
// //                     d="M10 22h4"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                   />
// //                   <path
// //                     d="M12 2a7 7 0 0 0-4 12c.4.3.8 1 .9 1.5l.2 1.5h5.8l.2-1.5c.1-.5.5-1.2.9-1.5A7 7 0 0 0 12 2Z"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinejoin="round"
// //                   />
// //                 </svg>
// //               }
// //             />
// //           </div>

// //           {/* Quick Appointment Booking (YOUR EXISTING BLOCK — unchanged logic) */}
// //           <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-2xl p-6 flex justify-between items-center mb-8">
// //             <div>
// //               <h3 className="text-lg font-semibold">Quick Appointment Booking</h3>
// //               <p className="text-sm text-teal-100">
// //                 Schedule a new appointment for your patients quickly.
// //               </p>
// //             </div>
// //             <button
// //               className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100"
// //               onClick={() => setShowForm(true)}
// //             >
// //               + New Appointment
// //             </button>
// //           </div>

// //           {/* Render Appointment Form (YOUR EXISTING LOGIC) */}
// //           {showForm && <AppointmentForm />}

// //           {/* ✅ NEW: Two Columns - Recent Chats + Today's Appointments */}
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
// //             {/* Recent Chats */}
// //             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h4 className="text-sm font-semibold text-slate-800">Recent Chats</h4>
// //                 <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
// //                   View All
// //                 </button>
// //               </div>

// //               <div className="space-y-3">
// //                 {recentChats.map((c) => (
// //                   <div
// //                     key={c.id}
// //                     className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
// //                   >
// //                     <div className="flex items-center gap-3">
// //                       <span className="w-2 h-2 rounded-full bg-emerald-500" />
// //                       <div>
// //                         <div className="text-sm font-medium text-slate-800">{c.name}</div>
// //                         <div className="text-xs text-slate-500">{formatRelativeTime(c.createdAt)}</div>
// //                       </div>
// //                     </div>

// //                     <span
// //                       className={
// //                         'text-xs px-3 py-1 rounded-full ' +
// //                         (c.type === 'AI'
// //                           ? 'bg-teal-100 text-teal-700'
// //                           : 'bg-sky-100 text-sky-700')
// //                       }
// //                     >
// //                       {c.type}
// //                     </span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Today's Appointments */}
// //             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h4 className="text-sm font-semibold text-slate-800">Today&apos;s Appointments</h4>
// //                 <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
// //                   View All
// //                 </button>
// //               </div>

// //               <div className="space-y-3">
// //                 {todaysAppointments.map((a) => (
// //                   <div
// //                     key={a.id}
// //                     className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
// //                   >
// //                     <div className="flex items-start gap-3">
// //                       <div className="mt-1 text-teal-600">
// //                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
// //                           <path
// //                             d="M12 8v5l3 2"
// //                             stroke="currentColor"
// //                             strokeWidth="2"
// //                             strokeLinecap="round"
// //                             strokeLinejoin="round"
// //                           />
// //                           <path
// //                             d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
// //                             stroke="currentColor"
// //                             strokeWidth="2"
// //                           />
// //                         </svg>
// //                       </div>

// //                       <div>
// //                         <div className="text-sm font-medium text-slate-800">{a.patientName}</div>
// //                         <div className="text-xs text-slate-500">
// //                           {a.time} &nbsp;•&nbsp; {a.doctorName}
// //                         </div>
// //                       </div>
// //                     </div>

// //                     <span
// //                       className={
// //                         'text-xs px-3 py-1 rounded-full font-medium ' + statusBadgeClasses(a.status)
// //                       }
// //                     >
// //                       {a.status}
// //                     </span>
// //                   </div>
// //                 ))}

// //                 {todaysAppointments.length === 0 && (
// //                   <div className="text-sm text-slate-500 py-8 text-center">
// //                     No appointments for today.
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   )
// // }

// 'use client'

// import React, { useEffect, useMemo, useState } from 'react'
// import AppointmentForm from '@/admincomponents/AppointmentformAdmin'

// type ChatItem = {
//   id: string
//   name: string
//   type: 'AI' | 'Human'
//   createdAt: string // ISO
// }

// type AppointmentItem = {
//   id: string
//   patientName: string
//   time: string // "09:00 AM"
//   doctorName: string
//   status: 'Confirmed' | 'Pending' | 'Cancelled'
//   date: string // "YYYY-MM-DD"
// }

// function formatRelativeTime(iso: string) {
//   const now = new Date()
//   const then = new Date(iso)
//   const diffMs = now.getTime() - then.getTime()

//   const diffMin = Math.floor(diffMs / 60000)
//   if (diffMin < 1) return 'Just now'
//   if (diffMin < 60) return `${diffMin} min ago`

//   const diffHr = Math.floor(diffMin / 60)
//   if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`

//   const diffDay = Math.floor(diffHr / 24)
//   return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
// }

// function getTodayKey(d = new Date()) {
//   const yyyy = d.getFullYear()
//   const mm = String(d.getMonth() + 1).padStart(2, '0')
//   const dd = String(d.getDate()).padStart(2, '0')
//   return `${yyyy}-${mm}-${dd}`
// }

// function statusBadgeClasses(status: AppointmentItem['status']) {
//   switch (status) {
//     case 'Confirmed':
//       return 'bg-green-100 text-green-700'
//     case 'Pending':
//       return 'bg-yellow-100 text-yellow-700'
//     case 'Cancelled':
//       return 'bg-red-100 text-red-700'
//     default:
//       return 'bg-gray-100 text-gray-700'
//   }
// }

// function StatCard({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode
//   label: string
//   value: number | string
// }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center justify-center min-h-[110px]">
//       <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 mb-2">
//         {icon}
//       </div>
//       <div className="text-xs text-slate-500 text-center">{label}</div>
//       <div className="text-2xl font-semibold text-slate-800 mt-1">{value}</div>
//     </div>
//   )
// }

// export default function AdminDashboard() {
//   const [showForm, setShowForm] = useState(false)
//   const [now, setNow] = useState<Date>(new Date())

//   const [recentChats] = useState<ChatItem[]>([
//     {
//       id: 'c1',
//       name: 'Sarah Johnson',
//       type: 'AI',
//       createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
//     },
//     {
//       id: 'c2',
//       name: 'Michael Chen',
//       type: 'Human',
//       createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
//     },
//     {
//       id: 'c3',
//       name: 'Emma Davis',
//       type: 'AI',
//       createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
//     },
//     {
//       id: 'c4',
//       name: 'James Wilson',
//       type: 'AI',
//       createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
//     },
//     {
//       id: 'c5',
//       name: 'Lisa Anderson',
//       type: 'Human',
//       createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
//     },
//   ])

//   const [appointments] = useState<AppointmentItem[]>(() => {
//     const today = getTodayKey()
//     const tomorrow = getTodayKey(new Date(Date.now() + 24 * 60 * 60 * 1000))

//     return [
//       {
//         id: 'a1',
//         patientName: 'Sarah Johnson',
//         time: '09:00 AM',
//         doctorName: 'Dr. Emily Roberts',
//         status: 'Confirmed',
//         date: today,
//       },
//       {
//         id: 'a2',
//         patientName: 'Michael Chen',
//         time: '10:30 AM',
//         doctorName: 'Dr. Marcus Thompson',
//         status: 'Confirmed',
//         date: today,
//       },
//       {
//         id: 'a3',
//         patientName: 'Emma Davis',
//         time: '11:00 AM',
//         doctorName: 'Dr. Sarah Kim',
//         status: 'Pending',
//         date: today,
//       },
//       {
//         id: 'a4',
//         patientName: 'James Wilson',
//         time: '02:00 PM',
//         doctorName: 'Dr. David Martinez',
//         status: 'Confirmed',
//         date: today,
//       },
//       {
//         id: 'a5',
//         patientName: 'Lisa Anderson',
//         time: '03:30 PM',
//         doctorName: 'Dr. Jennifer Lee',
//         status: 'Confirmed',
//         date: today,
//       },
//       {
//         id: 'a6',
//         patientName: 'Tomorrow Patient',
//         time: '09:00 AM',
//         doctorName: 'Dr. Future',
//         status: 'Confirmed',
//         date: tomorrow,
//       },
//     ]
//   })

//   useEffect(() => {
//     const everyMinute = setInterval(() => setNow(new Date()), 60_000)

//     const msUntilMidnight = (() => {
//       const d = new Date()
//       const next = new Date(d)
//       next.setHours(24, 0, 0, 0)
//       return next.getTime() - d.getTime()
//     })()

//     const midnightTimer = setTimeout(() => {
//       setNow(new Date())
//     }, msUntilMidnight + 1000)

//     return () => {
//       clearInterval(everyMinute)
//       clearTimeout(midnightTimer)
//     }
//   }, [])

//   const todayKey = useMemo(() => getTodayKey(now), [now])

//   const todaysAppointments = useMemo(() => {
//     return appointments.filter((a) => a.date === todayKey)
//   }, [appointments, todayKey])

//   const totalAppointmentsToday = todaysAppointments.length

//   const patientsServedToday = useMemo(() => {
//     return todaysAppointments.filter((a) => a.status === 'Confirmed').length
//   }, [todaysAppointments])

//   const activeAIConversationsToday = useMemo(() => {
//     return recentChats.filter((c) => {
//       const key = getTodayKey(new Date(c.createdAt))
//       return key === todayKey && c.type === 'AI'
//     }).length
//   }, [recentChats, todayKey])

//   const doctorsAvailableToday = 23

//   return (
//     // ✅ Header and Sidebar removed. This page now assumes layout already renders them.
//     <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] min-h-screen">
//       {/* ✅ Top Stats Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           label="Active AI Conversations Today"
//           value={activeAIConversationsToday}
//           icon={
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           }
//         />
//         <StatCard
//           label="Total Appointments Today"
//           value={totalAppointmentsToday}
//           icon={
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M8 3v3M16 3v3M3 10h18M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           }
//         />
//         <StatCard
//           label="Patients Served Today"
//           value={patientsServedToday}
//           icon={
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//               <path
//                 d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinejoin="round"
//               />
//               <path
//                 d="M22 21v-2a4 4 0 0 0-3-3.87"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//               <path
//                 d="M16 3.13a4 4 0 0 1 0 7.75"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </svg>
//           }
//         />
//         <StatCard
//           label="Doctors Available Today"
//           value={doctorsAvailableToday}
//           icon={
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <path d="M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//               <path d="M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//               <path
//                 d="M12 2a7 7 0 0 0-4 12c.4.3.8 1 .9 1.5l.2 1.5h5.8l.2-1.5c.1-.5.5-1.2.9-1.5A7 7 0 0 0 12 2Z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           }
//         />
//       </div>

//       {/* Quick Appointment Booking */}
//       <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-2xl p-6 flex justify-between items-center mb-8">
//         <div>
//           <h3 className="text-lg font-semibold">Quick Appointment Booking</h3>
//           <p className="text-sm text-teal-100">Schedule a new appointment for your patients quickly.</p>
//         </div>
//         <button
//           className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100"
//           onClick={() => setShowForm(true)}
//         >
//           + New Appointment
//         </button>
//       </div>

//       {showForm && <AppointmentForm />}

//       {/* Recent Chats + Today's Appointments */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
//         {/* Recent Chats */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h4 className="text-sm font-semibold text-slate-800">Recent Chats</h4>
//             <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
//               View All
//             </button>
//           </div>

//           <div className="space-y-3">
//             {recentChats.map((c) => (
//               <div
//                 key={c.id}
//                 className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
//               >
//                 <div className="flex items-center gap-3">
//                   <span className="w-2 h-2 rounded-full bg-emerald-500" />
//                   <div>
//                     <div className="text-sm font-medium text-slate-800">{c.name}</div>
//                     <div className="text-xs text-slate-500">{formatRelativeTime(c.createdAt)}</div>
//                   </div>
//                 </div>

//                 <span
//                   className={
//                     'text-xs px-3 py-1 rounded-full ' +
//                     (c.type === 'AI' ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-700')
//                   }
//                 >
//                   {c.type}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Today's Appointments */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h4 className="text-sm font-semibold text-slate-800">Today&apos;s Appointments</h4>
//             <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
//               View All
//             </button>
//           </div>

//           <div className="space-y-3">
//             {todaysAppointments.map((a) => (
//               <div
//                 key={a.id}
//                 className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
//               >
//                 <div className="flex items-start gap-3">
//                   <div className="mt-1 text-teal-600">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <path
//                         d="M12 8v5l3 2"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                       <path
//                         d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                       />
//                     </svg>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-slate-800">{a.patientName}</div>
//                     <div className="text-xs text-slate-500">
//                       {a.time} &nbsp;•&nbsp; {a.doctorName}
//                     </div>
//                   </div>
//                 </div>

//                 <span
//                   className={
//                     'text-xs px-3 py-1 rounded-full font-medium ' + statusBadgeClasses(a.status)
//                   }
//                 >
//                   {a.status}
//                 </span>
//               </div>
//             ))}

//             {todaysAppointments.length === 0 && (
//               <div className="text-sm text-slate-500 py-8 text-center">No appointments for today.</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }


'use client'

import React, { useEffect, useMemo, useState } from 'react'
import AppointmentForm from '@/admincomponents/AppointmentformAdmin'

type ChatItem = {
  id: string
  name: string
  type: 'AI' | 'Human'
  createdAt: string
}

type AppointmentItem = {
  id: string
  patientName: string
  time: string
  doctorName: string
  status: 'Confirmed' | 'Pending' | 'Cancelled'
  date: string
}

function formatRelativeTime(iso: string) {
  const now = new Date()
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()

  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`

  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
}

function getTodayKey(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function statusBadgeClasses(status: AppointmentItem['status']) {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-100 text-green-700'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
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

  const [recentChats] = useState<ChatItem[]>([
    { id: 'c1', name: 'Sarah Johnson', type: 'AI', createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
    { id: 'c2', name: 'Michael Chen', type: 'Human', createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'c3', name: 'Emma Davis', type: 'AI', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: 'c4', name: 'James Wilson', type: 'AI', createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString() },
    { id: 'c5', name: 'Lisa Anderson', type: 'Human', createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString() },
  ])

  const [appointments] = useState<AppointmentItem[]>(() => {
    const today = getTodayKey()
    const tomorrow = getTodayKey(new Date(Date.now() + 24 * 60 * 60 * 1000))

    return [
      { id: 'a1', patientName: 'Sarah Johnson', time: '09:00 AM', doctorName: 'Dr. Emily Roberts', status: 'Confirmed', date: today },
      { id: 'a2', patientName: 'Michael Chen', time: '10:30 AM', doctorName: 'Dr. Marcus Thompson', status: 'Confirmed', date: today },
      { id: 'a3', patientName: 'Emma Davis', time: '11:00 AM', doctorName: 'Dr. Sarah Kim', status: 'Pending', date: today },
      { id: 'a4', patientName: 'James Wilson', time: '02:00 PM', doctorName: 'Dr. David Martinez', status: 'Confirmed', date: today },
      { id: 'a5', patientName: 'Lisa Anderson', time: '03:30 PM', doctorName: 'Dr. Jennifer Lee', status: 'Confirmed', date: today },
      { id: 'a6', patientName: 'Tomorrow Patient', time: '09:00 AM', doctorName: 'Dr. Future', status: 'Confirmed', date: tomorrow },
    ]
  })

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

  const todayKey = useMemo(() => getTodayKey(now), [now])

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => a.date === todayKey),
    [appointments, todayKey]
  )

  const totalAppointmentsToday = todaysAppointments.length
  const patientsServedToday = useMemo(
    () => todaysAppointments.filter((a) => a.status === 'Confirmed').length,
    [todaysAppointments]
  )

  const activeAIConversationsToday = useMemo(() => {
    return recentChats.filter((c) => getTodayKey(new Date(c.createdAt)) === todayKey && c.type === 'AI').length
  }, [recentChats, todayKey])

  const doctorsAvailableToday = 23

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe] min-h-screen">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active AI Conversations Today" value={activeAIConversationsToday} icon={<span>💬</span>} />
        <StatCard label="Total Appointments Today" value={totalAppointmentsToday} icon={<span>📅</span>} />
        <StatCard label="Patients Served Today" value={patientsServedToday} icon={<span>👥</span>} />
        <StatCard label="Doctors Available Today" value={doctorsAvailableToday} icon={<span>🩺</span>} />
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
            {recentChats.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500">{formatRelativeTime(c.createdAt)}</div>
                  </div>
                </div>

                <span
                  className={
                    'text-xs px-3 py-1 rounded-full ' +
                    (c.type === 'AI' ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-700')
                  }
                >
                  {c.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-800">Today&apos;s Appointments</h4>
            <button className="text-xs px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-700">View All</button>
          </div>

          <div className="space-y-3">
            {todaysAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                <div>
                  <div className="text-sm font-medium text-slate-800">{a.patientName}</div>
                  <div className="text-xs text-slate-500">
                    {a.time} • {a.doctorName}
                  </div>
                </div>

                <span className={'text-xs px-3 py-1 rounded-full font-medium ' + statusBadgeClasses(a.status)}>
                  {a.status}
                </span>
              </div>
            ))}

            {todaysAppointments.length === 0 && (
              <div className="text-sm text-slate-500 py-8 text-center">No appointments for today.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
