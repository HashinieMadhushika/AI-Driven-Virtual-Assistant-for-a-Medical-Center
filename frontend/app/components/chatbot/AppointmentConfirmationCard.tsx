import { CalendarDays, Check, Clock3, Stethoscope } from "lucide-react";

type Props = {
  doctorName: string;
  date: string;
  time: string;
  onConfirm: () => void;
};

export default function AppointmentConfirmationCard({ doctorName, date, time, onConfirm }: Props) {
  const formattedDate = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "Date not selected";

  return (
    <article className="mt-3 max-w-[360px] overflow-hidden rounded-lg border border-teal-200 bg-white shadow-sm">
      <div className="border-b border-teal-100 bg-teal-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase text-teal-800">Appointment preview</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">Review your selection</p>
      </div>
      <div className="space-y-2 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Stethoscope className="h-4 w-4 shrink-0 text-teal-700" />{doctorName}
        </p>
        <p className="flex items-center gap-2 text-xs text-slate-600">
          <CalendarDays className="h-4 w-4 shrink-0 text-teal-700" />{formattedDate}
        </p>
        <p className="flex items-center gap-2 text-xs text-slate-600">
          <Clock3 className="h-4 w-4 shrink-0 text-teal-700" />{time}
        </p>
      </div>
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
        >
          <Check className="h-4 w-4" />Confirm booking
        </button>
      </div>
    </article>
  );
}