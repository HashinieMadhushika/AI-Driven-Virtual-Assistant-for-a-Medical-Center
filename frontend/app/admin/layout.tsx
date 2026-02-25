// app/admin/layout.tsx
import HeaderAdmin from "@/admincomponents/HeaderAdmin";
import SidebarAdmin from "@/admincomponents/SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderAdmin />

      <div className="flex">
        <SidebarAdmin />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
