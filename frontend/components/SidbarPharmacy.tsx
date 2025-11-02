import React from "react";
import { Home, Package, FileText, BarChart3, Bot } from "lucide-react";
import Link from "next/link";

export default function SidebarPharmacy() {
  const [active, setActive] = React.useState("Dashboard");

  const menus = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/pharmacy" },
    { name: "Inventory", icon: <Package size={20} />, path: "/pharmacy/inventory" },
    { name: "Prescriptions", icon: <FileText size={20} />, path: "/pharmacy/prescriptions" },
    { name: "Reports", icon: <BarChart3 size={20} />, path: "/pharmacy/reports" },
    { name: "AI Assistant", icon: <Bot size={20} />, path: "/pharmacy/assistant" },
  ];

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '200px',
      background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    }}>
      {/* Navigation Box */}
      <nav style={{
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.path}
            onClick={() => setActive(menu.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: active === menu.name ? '#14b8a6' : 'transparent',
              color: active === menu.name ? 'white' : '#4b5563',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.25rem'
            }}
            onMouseEnter={(e) => {
              if (active !== menu.name) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== menu.name) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {menu.icon}
            <span>{menu.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}