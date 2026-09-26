"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-linear-to-br from-teal-600 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="leading-tight">
            <span className="text-xl font-bold text-slate-800">MediCare</span>
            <div className="text-xs text-slate-500">Medical Center Platform</div>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
          <a href="#services" className="hover:text-teal-600">Services</a>
          <a href="#vision" className="hover:text-teal-600">Vision</a>
          <a href="#about" className="hover:text-teal-600">About</a>
          <a href="#contact" className="hover:text-teal-600">Contact us</a>
        </nav>

        <button
          onClick={() => router.push("/login")}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Join with us
        </button>
      </div>
    </header>
  );
};

export default Header;
