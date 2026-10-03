-- Human handover support for Medicare AI Assistant

CREATE TABLE IF NOT EXISTS public.handover_requests (
  id SERIAL PRIMARY KEY,
  "sessionId" UUID NOT NULL
    REFERENCES public.chat_sessions(id)
    ON DELETE CASCADE,
  "firstName" VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  reason TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Active', 'Resolved')),
  "assignedAdminId" INTEGER,
  "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "acceptedAt" TIMESTAMPTZ,
  "resolvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS handover_requests_session_idx
  ON public.handover_requests ("sessionId");

CREATE INDEX IF NOT EXISTS handover_requests_status_idx
  ON public.handover_requests (status);

CREATE INDEX IF NOT EXISTS handover_requests_requested_at_idx
  ON public.handover_requests ("requestedAt");

CREATE UNIQUE INDEX IF NOT EXISTS handover_requests_one_open_per_session_idx
  ON public.handover_requests ("sessionId")
  WHERE status IN ('Pending', 'Active');

-- Existing chat_messages.role is a Sequelize/PostgreSQL enum.
-- Add a dedicated role for receptionist/admin replies.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'enum_chat_messages_role'
  ) THEN
    ALTER TYPE public.enum_chat_messages_role
      ADD VALUE IF NOT EXISTS 'admin';
  END IF;
END
$$;
