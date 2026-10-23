// app/admin/layout.tsx
import AdminShell from "@/app/admin/components/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
