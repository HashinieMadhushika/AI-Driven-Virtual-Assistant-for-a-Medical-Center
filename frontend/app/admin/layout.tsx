// app/admin/layout.tsx
import HeaderAdmin from "@/admincomponents/HeaderAdmin";
import SidebarAdmin from "@/admincomponents/SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid grid-cols-[260px_1fr] min-h-screen">
        <SidebarAdmin />

        <div className="flex flex-col">
          <HeaderAdmin />

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
