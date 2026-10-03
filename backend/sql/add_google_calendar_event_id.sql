ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS "googleCalendarEventId" VARCHAR(255);

CREATE INDEX IF NOT EXISTS "appointments_google_calendar_event_id_idx"
ON public.appointments ("googleCalendarEventId");