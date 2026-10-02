export interface Doctor {
  id?: number;
  name: string;
  email: string;
  phone?: string | null;
  specialization?: string | null;
  designation?: string | null;
  yearsOfExperience?: number | string | null;
  education?: string | null;
  certifications?: string[] | null;
  profileImageUrl?: string | null;
}

interface EventTime {
  dateTime?: string;
  date?: string;
}

export interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: EventTime;
  end: EventTime;
  attendees?: (string | { email: string })[] | string;
}

export interface EventFormValues {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  attendees: string;
}
