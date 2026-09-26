import React from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function FeatureCard({ title, description, icon, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-teal-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-800 truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {description}
          </p>
        </div>

        <ChevronRight className="shrink-0 w-4 h-4 text-slate-300 transition group-hover:text-teal-600 group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
