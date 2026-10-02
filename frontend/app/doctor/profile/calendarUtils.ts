import type { CalendarEvent, EventFormValues } from './types';

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  attendees: '',
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date as YYYY-MM-DD (the format <input type="date"> uses). */
export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Local time as HH:MM (the format <input type="time"> uses). */
export const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Google all-day events only have a date; parse it as local midnight, not UTC. */
const parseEventTime = ({ dateTime, date }: CalendarEvent['start']) =>
  new Date(dateTime ?? `${date}T00:00`);

export const getEventStart = (event: CalendarEvent) => parseEventTime(event.start);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Day numbers for a month grid, padded with nulls so the 1st falls on its weekday. */
export function getMonthDays(month: Date): (number | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}

export function eventToForm(event: CalendarEvent): EventFormValues {
  const start = parseEventTime(event.start);
  const end = parseEventTime(event.end);
  const attendees = Array.isArray(event.attendees)
    ? event.attendees.map((a) => (typeof a === 'string' ? a : a.email)).join(', ')
    : event.attendees ?? '';

  return {
    title: event.summary ?? '',
    description: event.description ?? '',
    startDate: toDateInput(start),
    startTime: toTimeInput(start),
    endDate: toDateInput(end),
    endTime: toTimeInput(end),
    attendees,
  };
}
