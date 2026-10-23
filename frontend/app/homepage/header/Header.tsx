"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#services", label: "Services" },
  { href: "#vision", label: "Vision" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact us" },
];

const Header = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-9 h-9 shrink-0 bg-linear-to-br from-teal-600 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="leading-tight">
            <span className="text-lg sm:text-xl font-bold text-slate-800">MediCare</span>
            <div className="hidden sm:block text-xs text-slate-500">Medical Center Platform</div>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-teal-600">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/login")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
          >
            Join with us
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-black/5 px-4 py-2 text-sm font-medium text-slate-700">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-2 py-3 rounded-lg hover:bg-teal-50 hover:text-teal-700"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
