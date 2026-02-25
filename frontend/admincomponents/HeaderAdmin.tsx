// components/admin/HeaderAdmin.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function HeaderAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setAdmin(null);
      return;
    }
    try {
      setAdmin(JSON.parse(stored));
    } catch {
      setAdmin(null);
    }
  }, []);

  const initials = useMemo(() => {
    if (!admin?.name) return "AD";
    const parts = admin.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [admin?.name]);

  const displayName = admin?.name || "Admin";

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <header className="h-[72px] bg-white border-b border-black/10 text-slate-800">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center text-white font-black bg-linear-to-br from-teal-700 to-cyan-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-wide">ADMIN</div>
            <div className="text-xs text-slate-500">MediCare AI System</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-50 border border-black/10">
              <span className="text-teal-800 font-bold text-sm">{initials}</span>
            </div>
            <div className="hidden md:block leading-tight">
              <div className="font-semibold text-sm">{displayName}</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-2 font-semibold text-teal-800 hover:underline text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
