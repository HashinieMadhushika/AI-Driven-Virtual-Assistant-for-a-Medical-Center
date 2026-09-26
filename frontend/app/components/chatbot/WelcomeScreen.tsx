import {
  ArrowRight,
  CalendarCheck,
  Stethoscope,
  FileText,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Props {
  onNext: () => void;
}

const capabilities = [
  {
    icon: CalendarCheck,
    title: "Book appointments",
    description: "Pick a doctor and time in seconds",
  },
  {
    icon: Stethoscope,
    title: "Find the right doctor",
    description: "Search by specialty or symptom",
  },
  {
    icon: FileText,
    title: "Check your reports",
    description: "See results as soon as they're ready",
  },
];

export default function WelcomeScreen({ onNext }: Props) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center py-4">
      {/* Avatar */}
      <div className="relative mb-5">
        <span className="absolute inset-0 rounded-full bg-teal-400/30 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg ring-4 ring-white">
          <img
            src="/images/ai-assistant.png"
            alt="MediCare AI assistant"
            className="w-14 h-14"
          />
        </div>
        <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
      </div>

      {/* Greeting */}
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
        Hi there 👋
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
        Welcome to <span className="text-teal-600">MediCare AI</span>
      </h1>
      <p className="mt-2 max-w-md text-sm sm:text-base text-slate-600">
        Your personal healthcare assistant. I can help you get care faster,
        with no waiting on the phone.
      </p>

      {/* What I can do */}
      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 gap-3">
        {capabilities.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 rounded-2xl border border-teal-100 bg-white/80 p-4 text-left sm:text-center shadow-sm"
          >
            <div className="shrink-0 w-10 h-2 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <button
        onClick={onNext}
        className="group mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3 font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
      >
        Get Started
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Trust notes */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          Private &amp; secure
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          Available 24/7
        </span>
      </div>

      {/* Safety note */}
      {/* <p className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        For medical emergencies, call 1990 or visit the nearest hospital.
      </p> */}
    </div>
  );
}
