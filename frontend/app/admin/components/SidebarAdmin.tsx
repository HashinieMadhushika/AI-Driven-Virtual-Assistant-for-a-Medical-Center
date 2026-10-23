"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Active Conversation",
    href: "/admin/conversation",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m9-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Chat History",
    href: "/admin/history",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v5l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10a4 4 0 118 0v2a4 4 0 01-8 0v-2zm-4 9a6 6 0 0112 0H4z" />
      </svg>
    ),
  },
];

type SidebarAdminProps = {
  open: boolean;
  onClose: () => void;
};

export default function SidebarAdmin({ open, onClose }: SidebarAdminProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto bg-white border-r border-black/10 transition-transform duration-200",
          "lg:static lg:z-auto lg:h-full lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="px-4 pt-4 flex items-center justify-between font-extrabold text-slate-700">
          Admin
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((it) => {
            const active =
              pathname === it.href || pathname.startsWith(it.href + "/");

            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 px-3 py-3 rounded-xl border transition",
                  active
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-black/10",
                ].join(" ")}
              >
                {it.icon}
                <span className="font-medium">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
