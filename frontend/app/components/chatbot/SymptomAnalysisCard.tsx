import { Activity, CalendarDays, Stethoscope } from "lucide-react";
import type { Doctor } from "./DoctorCards";

export type SymptomCardData = {
  summary: string;
  recommendation?: string;
  recommendedDoctor?: Doctor;
};

export default function SymptomAnalysisCard({
  analysis,
  onBook
}: {
  analysis: SymptomCardData;
  onBook: (doctor: Doctor) => void;
}) {
  return (
    <article className="w-full max-w-2xl overflow-hidden rounded-xl border border-emerald-200 bg-white text-slate-800 shadow-sm">
      <header className="flex items-center gap-3 border-b border-emerald-100 bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 px-4 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
          <Activity className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Symptom guide</p>
          <h3 className="text-sm font-semibold text-slate-900">What your symptoms may mean</h3>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-teal-800">
          AI guidance
        </span>
      </header>

      <div className="space-y-3 px-4 py-3">
        <p className="text-sm leading-6 text-slate-700">{analysis.summary}</p>
        {analysis.recommendation ? (
          <p className="border-l-2 border-amber-400 pl-3 text-sm leading-5 text-amber-900">
            {analysis.recommendation}
          </p>
        ) : null}
      </div>

      {analysis.recommendedDoctor ? (
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-800">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Recommended clinician</p>
            <p className="truncate text-sm font-semibold text-slate-900">{analysis.recommendedDoctor.name}</p>
            <p className="truncate text-xs text-teal-800">{analysis.recommendedDoctor.specialization ?? "Specialist"}</p>
          </div>
          <button
            type="button"
            onClick={() => onBook(analysis.recommendedDoctor!)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <CalendarDays className="h-4 w-4" />
            Book
          </button>
        </div>
      ) : null}

      <p className="px-4 pb-3 text-[11px] text-slate-500">General information only; this is not a diagnosis.</p>
    </article>
  );
}