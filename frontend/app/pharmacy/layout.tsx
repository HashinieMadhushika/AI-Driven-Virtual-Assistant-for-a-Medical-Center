// app/pharmacy/layout.tsx
"use client";
import React from "react";
import SidebarPharmacy from "../../admincomponents/SidbarPharmacy";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarPharmacy />
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
