// 'use client'

// import React, { useMemo, useState } from 'react'
// import SidebarAdmin from '@/admincomponents/SidebarAdmin'
// import Header from '@/admincomponents/HeaderAdmin'

// type ChatType = 'AI' | 'Human'
// type ChatStatus = 'Active' | 'Transferred' | 'Completed'

// type ChatRow = {
//   id: string
//   patient: string
//   type: ChatType
//   status: ChatStatus
//   timeISO: string
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

// function typeBadge(type: ChatType) {
//   return type === 'AI'
//     ? 'bg-emerald-100 text-emerald-700'
//     : 'bg-sky-100 text-sky-700'
// }

// function statusBadge(status: ChatStatus) {
//   if (status === 'Active') return 'bg-green-100 text-green-700'
//   if (status === 'Transferred') return 'bg-yellow-100 text-yellow-700'
//   return 'bg-slate-100 text-slate-700'
// }

// export default function AdminChatHistoryPage() {
//   const [filter, setFilter] = useState<'all' | 'active' | 'human'>('all')

//   // ✅ Mock data (replace with API later)
//   const rows: ChatRow[] = useMemo(() => {
//     const now = Date.now()
//     return [
//       {
//         id: 'CH001',
//         patient: 'Sarah Johnson',
//         type: 'AI',
//         status: 'Active',
//         timeISO: new Date(now - 2 * 60000).toISOString(),
//       },
//       {
//         id: 'CH002',
//         patient: 'Michael Chen',
//         type: 'Human',
//         status: 'Transferred',
//         timeISO: new Date(now - 15 * 60000).toISOString(),
//       },
//       {
//         id: 'CH003',
//         patient: 'Emma Davis',
//         type: 'AI',
//         status: 'Active',
//         timeISO: new Date(now - 60 * 60000).toISOString(),
//       },
//       {
//         id: 'CH004',
//         patient: 'James Wilson',
//         type: 'AI',
//         status: 'Completed',
//         timeISO: new Date(now - 2 * 60 * 60000).toISOString(),
//       },
//       {
//         id: 'CH005',
//         patient: 'Lisa Anderson',
//         type: 'Human',
//         status: 'Active',
//         timeISO: new Date(now - 3 * 60 * 60000).toISOString(),
//       },
//     ]
//   }, [])

//   const filteredRows = useMemo(() => {
//     if (filter === 'all') return rows
//     if (filter === 'active') return rows.filter((r) => r.status === 'Active')
//     return rows.filter((r) => r.type === 'Human')
//   }, [rows, filter])

//   const onView = (chatId: string) => {
//     // ✅ later: navigate to details page
//     alert(`View chat: ${chatId}`)
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f2fe]">
//       {/* Header (already exists) */}
//       <Header />

//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar (already exists) */}
//         <SidebarAdmin />

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto p-8">
//           <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl shadow-sm border border-slate-100 p-6">
//             {/* Title + Filters */}
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h1 className="text-2xl font-semibold text-slate-800">
//                   Live &amp; Recent Chats
//                 </h1>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={() => setFilter('all')}
//                   className={`px-4 py-2 rounded-xl text-sm font-medium border transition
//                     ${
//                       filter === 'all'
//                         ? 'bg-teal-700 text-white border-teal-700'
//                         : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
//                     }`}
//                 >
//                   All
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setFilter('active')}
//                   className={`px-4 py-2 rounded-xl text-sm font-medium border transition
//                     ${
//                       filter === 'active'
//                         ? 'bg-teal-700 text-white border-teal-700'
//                         : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
//                     }`}
//                 >
//                   Active
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setFilter('human')}
//                   className={`px-4 py-2 rounded-xl text-sm font-medium border transition
//                     ${
//                       filter === 'human'
//                         ? 'bg-teal-700 text-white border-teal-700'
//                         : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
//                     }`}
//                 >
//                   Human Takeovers
//                 </button>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="mt-6 overflow-x-auto">
//               <div className="min-w-[780px] bg-white rounded-xl border border-slate-100 shadow-sm">
//                 {/* Header row */}
//                 <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 bg-slate-50 rounded-t-xl">
//                   <div>Chat ID</div>
//                   <div>Patient</div>
//                   <div>Type</div>
//                   <div>Status</div>
//                   <div>Time</div>
//                   <div className="text-right">Action</div>
//                 </div>

//                 {/* Body */}
//                 <div className="divide-y divide-slate-100">
//                   {filteredRows.map((r) => (
//                     <div
//                       key={r.id}
//                       className="grid grid-cols-6 gap-4 px-6 py-4 items-center text-sm text-slate-700"
//                     >
//                       <div className="font-medium text-slate-800">{r.id}</div>
//                       <div>{r.patient}</div>

//                       <div>
//                         <span
//                           className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${typeBadge(
//                             r.type
//                           )}`}
//                         >
//                           {r.type}
//                         </span>
//                       </div>

//                       <div>
//                         <span
//                           className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
//                             r.status
//                           )}`}
//                         >
//                           {r.status}
//                         </span>
//                       </div>

//                       <div className="text-slate-500">
//                         {formatRelativeTime(r.timeISO)}
//                       </div>

//                       <div className="flex justify-end">
//                         <button
//                           type="button"
//                           onClick={() => onView(r.id)}
//                           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition"
//                         >
//                           <span className="text-sm">👁</span>
//                           View
//                         </button>
//                       </div>
//                     </div>
//                   ))}

//                   {filteredRows.length === 0 && (
//                     <div className="px-6 py-10 text-center text-sm text-slate-500">
//                       No chats found for this filter.
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Big bottom spacing like screenshot */}
//           <div className="h-16" />
//         </main>
//       </div>
//     </div>
//   )
// }

'use client'

import React, { useMemo, useState } from 'react'

type ChatType = 'AI' | 'Human'
type ChatStatus = 'Active' | 'Transferred' | 'Completed'

type ChatRow = {
  id: string
  patient: string
  type: ChatType
  status: ChatStatus
  timeISO: string
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

function typeBadge(type: ChatType) {
  return type === 'AI'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-sky-100 text-sky-700'
}

function statusBadge(status: ChatStatus) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Transferred') return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-700'
}

export default function AdminChatHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'human'>('all')

  // ✅ Mock data (replace with API later)
  const rows: ChatRow[] = useMemo(() => {
    const now = Date.now()
    return [
      {
        id: 'CH001',
        patient: 'Sarah Johnson',
        type: 'AI',
        status: 'Active',
        timeISO: new Date(now - 2 * 60000).toISOString(),
      },
      {
        id: 'CH002',
        patient: 'Michael Chen',
        type: 'Human',
        status: 'Transferred',
        timeISO: new Date(now - 15 * 60000).toISOString(),
      },
      {
        id: 'CH003',
        patient: 'Emma Davis',
        type: 'AI',
        status: 'Active',
        timeISO: new Date(now - 60 * 60000).toISOString(),
      },
      {
        id: 'CH004',
        patient: 'James Wilson',
        type: 'AI',
        status: 'Completed',
        timeISO: new Date(now - 2 * 60 * 60000).toISOString(),
      },
      {
        id: 'CH005',
        patient: 'Lisa Anderson',
        type: 'Human',
        status: 'Active',
        timeISO: new Date(now - 3 * 60 * 60000).toISOString(),
      },
    ]
  }, [])

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows
    if (filter === 'active') return rows.filter((r) => r.status === 'Active')
    return rows.filter((r) => r.type === 'Human')
  }, [rows, filter])

  const onView = (chatId: string) => {
    // ✅ later: navigate to details page
    alert(`View chat: ${chatId}`)
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* Title + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Live &amp; Recent Chats
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                ${
                  filter === 'all'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                ${
                  filter === 'active'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() => setFilter('human')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                ${
                  filter === 'human'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
            >
              Human Takeovers
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[780px] bg-white rounded-xl border border-slate-100 shadow-sm">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 bg-slate-50 rounded-t-xl">
              <div>Chat ID</div>
              <div>Patient</div>
              <div>Type</div>
              <div>Status</div>
              <div>Time</div>
              <div className="text-right">Action</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-slate-100">
              {filteredRows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-6 gap-4 px-6 py-4 items-center text-sm text-slate-700"
                >
                  <div className="font-medium text-slate-800">{r.id}</div>
                  <div>{r.patient}</div>

                  <div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${typeBadge(
                        r.type
                      )}`}
                    >
                      {r.type}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="text-slate-500">{formatRelativeTime(r.timeISO)}</div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onView(r.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition"
                    >
                      <span className="text-sm">👁</span>
                      View
                    </button>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No chats found for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </main>
  )
}
