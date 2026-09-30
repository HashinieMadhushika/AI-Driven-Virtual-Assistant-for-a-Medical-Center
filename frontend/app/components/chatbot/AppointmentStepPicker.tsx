import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  step?: "date" | "time" | "patient" | "none";
  timeSlots?: Array<string | { label: string; booked?: boolean }>;
  onSubmit: (value: string) => void;
  onSelectTime?: (time: string) => void;
};

export default function AppointmentStepPicker({
  step,
  timeSlots = [],
  onSubmit,
  onSelectTime
}: Props) {
  const [date, setDate] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const monthDayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = monthStart.getDay();
  const monthDays = Array.from({ length: monthDayCount }, (_, index) => index + 1);
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const isCurrentMonth = monthStart.getTime() === currentMonthStart.getTime();
  const toLocalDateString = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (step === "date") {
    return (
      <form
        className="mt-3 max-w-[320px] rounded-lg border border-teal-100 bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (date) onSubmit(date);
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Choose a date</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              disabled={isCurrentMonth}
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
              className="grid h-7 w-7 place-items-center rounded-md text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-xs font-medium text-slate-700">
              {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
              className="grid h-7 w-7 place-items-center rounded-md text-teal-800 transition hover:bg-teal-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((weekday) => (
            <span key={weekday} className="py-1 text-[10px] font-medium text-slate-500">{weekday}</span>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`blank-${index}`} aria-hidden="true" />
          ))}
          {monthDays.map((day) => {
            const cellDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
            const dateValue = toLocalDateString(cellDate);
            const isPast = cellDate < today;
            const isToday = cellDate.getTime() === today.getTime();
            const isSelected = date === dateValue;

            return (
              <button
                key={dateValue}
                type="button"
                disabled={isPast}
                aria-pressed={isSelected}
                aria-label={cellDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
                onClick={() => setDate(dateValue)}
                className={`aspect-square min-w-0 rounded-md text-xs transition ${
                  isPast
                    ? "cursor-not-allowed bg-slate-50 text-slate-300"
                    : isSelected
                      ? "bg-teal-800 font-semibold text-white"
                      : isToday
                        ? "bg-teal-100 font-semibold text-teal-900 ring-1 ring-teal-600"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-200"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-xs text-slate-600" aria-live="polite">
            {date ? `Selected: ${new Date(`${date}T00:00:00`).toLocaleDateString()}` : "Select today or a future date"}
          </p>
        <button
          type="submit"
          disabled={!date}
          className="shrink-0 rounded-md bg-teal-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check times
        </button>
        </div>
      </form>
    );
  }

  if (step === "time" && timeSlots.length > 0) {
    return (
      <div className="mt-3 rounded-lg border border-teal-100 bg-white p-3">
        <p className="mb-2 text-xs font-medium text-slate-600">Choose an available time</p>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((slot) => {
            const label = typeof slot === "string" ? slot : slot.label;
            const booked = typeof slot !== "string" && slot.booked === true;

            return (
              <button
                key={label}
                type="button"
                disabled={booked}
                aria-label={booked ? `${label}, already booked` : label}
                onClick={() => !booked && onSelectTime?.(label)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                  booked
                    ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-600 line-through"
                    : "border-teal-200 text-teal-800 hover:border-teal-700 hover:bg-teal-50"
                }`}
              >
                {label}{booked ? " · Booked" : ""}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}