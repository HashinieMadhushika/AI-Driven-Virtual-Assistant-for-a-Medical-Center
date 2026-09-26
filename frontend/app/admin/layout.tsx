// app/admin/layout.tsx
import HeaderAdmin from "@/app/admin/components/HeaderAdmin";
import SidebarAdmin from "@/app/admin/components/SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Header and sidebar stay fixed; only the page content scrolls
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0">
        <HeaderAdmin />
      </div>

      <div className="flex flex-1 min-h-0">
        <SidebarAdmin />

        <main className="flex-1 min-w-0 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
