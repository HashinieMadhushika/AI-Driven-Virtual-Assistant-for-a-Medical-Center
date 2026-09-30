import { BadgeCheck } from "lucide-react";

type Props = {
  message: string;
  appointmentId?: string | number;
};

export default function BookingConfirmationMessage({ message, appointmentId }: Props) {
  return (
    <section className="mt-2 max-w-[420px] rounded-lg border border-emerald-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-emerald-100 bg-emerald-50 px-4 py-3">
        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <div>
          <h3 className="text-sm font-semibold text-emerald-900">Appointment confirmed</h3>
          <p className="mt-1 text-sm text-slate-700">{message}</p>
        </div>
      </div>
      {appointmentId !== undefined ? (
        <p className="px-4 py-2 text-xs text-slate-600">Reference: {appointmentId}</p>
      ) : null}
    </section>
  );
}