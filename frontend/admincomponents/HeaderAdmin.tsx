// components/admin/HeaderAdmin.tsx
"use client";

export default function HeaderAdmin() {
  return (
    <header className="h-[72px] bg-white border-b border-black/10 px-5 flex items-center justify-between">
      {/* Left brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center text-white font-black
                        bg-gradient-to-br from-teal-700 to-cyan-500">
          ∿
        </div>
        <div className="leading-tight">
          <div className="font-extrabold tracking-wide">ADMIN</div>
          <div className="text-xs text-slate-500">MediCare AI System</div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button
          className="border border-black/10 rounded-xl px-3 py-2 hover:bg-slate-50"
          title="Notifications"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full grid place-items-center font-extrabold text-teal-800
                          bg-teal-50 border border-black/10">
            JM
          </div>
          <div className="leading-tight">
            <div className="font-bold">John Miller</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>

        <button className="font-semibold text-teal-800 hover:underline">Sign Out</button>
      </div>
    </header>
  );
}
