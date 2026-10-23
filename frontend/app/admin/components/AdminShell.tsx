"use client";

import { useState } from "react";
import HeaderAdmin from "@/app/admin/components/HeaderAdmin";
import SidebarAdmin from "@/app/admin/components/SidebarAdmin";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  // Sidebar is a slide-in drawer below lg; always visible on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Header and sidebar stay fixed; only the page content scrolls
    <div className="h-dvh flex flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0">
        <HeaderAdmin onMenuClick={() => setSidebarOpen(true)} />
      </div>

      <div className="flex flex-1 min-h-0">
        <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
