ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS "reminder24hSentAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "reminder1hSentAt" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "appointments_reminder_status_date_idx"
ON public.appointments ("status", "appointmentDate");