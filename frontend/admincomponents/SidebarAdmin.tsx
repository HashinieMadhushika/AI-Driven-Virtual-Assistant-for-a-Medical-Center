// // components/admin/SidebarAdmin.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const items = [
//   { label: "Dashboard", icon: "▦", href: "/admin/dashboard" },
//   { label: "Appointments", icon: "🗓", href: "/admin/appointments" },
//   { label: "Active Conversation", icon: "💬", href: "/admin/conversation" },
//   { label: "Chat History", icon: "🕘", href: "/admin/history" },
//   { label: "Patients", icon: "👥", href: "/admin/patients" },
//   { label: "Doctors", icon: "🩺", href: "/admin/doctors" },
// ];

// export default function SidebarAdmin() {
//   const pathname = usePathname();

//   return (
//     <aside className="bg-white border-r border-black/10 p-4">
//       <div className="px-3 py-2 font-extrabold text-slate-700">Admin</div>

//       <nav className="mt-3 space-y-2">
//         {items.map((it) => {
//           const active = pathname === it.href || pathname.startsWith(it.href + "/");

//           return (
//             <Link
//               key={it.href}
//               href={it.href}
//               className={[
//                 "flex items-center gap-3 px-3 py-3 rounded-xl border transition",
//                 active
//                   ? "bg-teal-700 text-white border-teal-700"
//                   : "bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-black/10",
//               ].join(" ")}
//             >
//               <span className="w-6 inline-flex justify-center">{it.icon}</span>
//               <span className="font-medium">{it.label}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }


// components/admin/SidebarAdmin.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", icon: "▦", href: "/admin/dashboard" },
  { label: "Appointments", icon: "🗓", href: "/admin/appointments" },
  { label: "Active Conversation", icon: "💬", href: "/admin/conversation" },
  { label: "Chat History", icon: "🕘", href: "/admin/history" },
  { label: "Doctors", icon: "🩺", href: "/admin/doctors" },
];

export default function SidebarAdmin() {
  const pathname = usePathname();

  return (
    <aside className="bg-white border-r border-black/10 p-4">
      <div className="px-3 py-2 font-extrabold text-slate-700">
        Admin
      </div>

      <nav className="mt-3 space-y-2">
        {items.map((it) => {
          const active =
            pathname === it.href || pathname.startsWith(it.href + "/");

          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                "flex items-center gap-3 px-3 py-3 rounded-xl border transition",
                active
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-black/10",
              ].join(" ")}
            >
              <span className="w-6 inline-flex justify-center">
                {it.icon}
              </span>
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

