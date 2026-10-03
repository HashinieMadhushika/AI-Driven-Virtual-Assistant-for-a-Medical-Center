-- Private medical-document metadata.
-- File bytes are stored in a PRIVATE Supabase Storage bucket.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  "sessionId" UUID NOT NULL
    REFERENCES public.chat_sessions(id)
    ON DELETE CASCADE,

  "patientId" INTEGER
    REFERENCES public.patients(id)
    ON DELETE SET NULL,

  "firstName" VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,

  "documentType" VARCHAR(40) NOT NULL
    CHECK (
      "documentType" IN (
        'PRESCRIPTION',
        'MEDICAL_REPORT',
        'LAB_REPORT',
        'OTHER_MEDICAL_DOCUMENT'
      )
    ),

  "originalFileName" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(100) NOT NULL,
  "fileSize" INTEGER NOT NULL
    CHECK ("fileSize" > 0),

  "storageBucket" VARCHAR(120) NOT NULL,
  "storagePath" VARCHAR(700) NOT NULL UNIQUE,

  status VARCHAR(30) NOT NULL DEFAULT 'UPLOADED'
    CHECK (
      status IN (
        'UPLOADED',
        'REVIEWED',
        'ARCHIVED'
      )
    ),

  "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medical_documents_session_idx
  ON public.medical_documents ("sessionId");

CREATE INDEX IF NOT EXISTS medical_documents_patient_idx
  ON public.medical_documents ("patientId");

CREATE INDEX IF NOT EXISTS medical_documents_email_idx
  ON public.medical_documents (LOWER(email));

CREATE INDEX IF NOT EXISTS medical_documents_type_idx
  ON public.medical_documents ("documentType");

CREATE INDEX IF NOT EXISTS medical_documents_uploaded_at_idx
  ON public.medical_documents ("uploadedAt" DESC);
