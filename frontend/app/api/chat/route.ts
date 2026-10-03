import { NextResponse } from "next/server";

type ChatMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

type ChatDoctor = {
  id?: number | string;
  doctorId?: number | string;
  doctorName?: string;
  name?: string;
  specialization?: string | null;
  designation?: string | null;
  profileImageUrl?: string | null;
  yearsOfExperience?: number | null;
  weeklySchedule?: Record<string, unknown>;
  availableTimes?: string[] | string | Record<string, unknown> | null;
};

type ChatRequest = {
  messages?: ChatMessage[];
  sessionId?: string;
  firstName?: string;
  email?: string;
  bookingAction?:
    | "start_booking"
    | "check_time_slots"
    | "select_time_slot"
    | "cancel_appointment"
    | "reschedule_appointment";
  selectedDoctor?: ChatDoctor | string;
  appointmentDate?: string;
  appointmentTime?: string;
  displayDate?: string;
  dayName?: string;
  appointmentId?: string | number;
  cancellationReason?: string;
  newAppointmentDate?: string;
  newAppointmentTime?: string;
  audioBase64?: string;
  mimeType?: string;
  requestVoiceReply?: boolean;
  documentType?:
    | "PRESCRIPTION"
    | "MEDICAL_REPORT"
    | "LAB_REPORT"
    | "OTHER_MEDICAL_DOCUMENT";
  documentFile?: File;
  documentId?: string;
};

type CalendarDay = {
  date: string;
  displayDate?: string;
  dayName?: string;
  available?: boolean;
  timeSlots?: string[];
};

type AssistantResponse = {
  intent?: string;
  reply?: string;
  transcript?: string;
  message?: string;
  cards?: ChatDoctor[];
  doctors?: ChatDoctor[];
  timeSlots?: unknown[];
  availableTimeSlots?: unknown[];
  calendar?: CalendarDay[] | null;
  selectedDoctor?: ChatDoctor | null;
  selectedDate?: string;
  selectedTime?: string;
  appointmentOperation?: "cancelled" | "rescheduled" | "none";
  rescheduleMode?: boolean;
  bookingStep?: "date" | "time" | "patient" | "none";
  bookingConfirmed?: boolean;
  success?: boolean;
  appointmentId?: string | number;
  appointment?: {
    id?: string | number;
    [key: string]: unknown;
  } | null;
  sessionId?: string;
  email?: string;
  voiceMode?: boolean;
  audioBase64?: string;
  mimeType?: string;
  humanMode?: boolean;
  phone?: string;
  handover?: {
    id: number;
    status: "Pending" | "Active" | "Resolved";
    phone?: string;
  } | null;
  documentResult?: {
    documentType: string;
    success: boolean;
    error?: boolean | string;
    message?: string;
    timestamp?: string;
    card?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
};

function getBackendUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_BASE_URL ||
    "http://localhost:5000"
  );
}

function isHumanSupportRequest(message: string) {
  return /\b(talk|speak|chat|connect)\s+(?:to|with)\s+(?:a\s+)?(?:human|person|receptionist|agent|staff|admin)\b|\bhuman\s+(?:support|help|agent)\b|\breal\s+person\b|\bneed\s+(?:a\s+)?(?:human|receptionist|agent)\b/i.test(
    message
  );
}

function isDocumentExitRequest(message: string) {
  const normalized =
    String(
      message ||
      ""
    )
      .toLowerCase()
      .replace(
        /[.,!?]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return /^(exit document mode|exit report mode|stop document mode|stop checking (?:the )?(?:document|report|prescription)|finish (?:the )?(?:document|report|prescription)|done with (?:the )?(?:document|report|prescription)|go back to normal assistant|return to normal assistant)$/.test(
    normalized
  );
}

async function getOpenHandover({
  backendUrl,
  sessionId,
  email,
}: {
  backendUrl: string;
  sessionId: string;
  email: string;
}) {
  try {
    const response = await fetch(
      `${backendUrl}/api/chat/handover/status/${encodeURIComponent(
        sessionId
      )}?email=${encodeURIComponent(email)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      handover?: AssistantResponse["handover"];
      phone?: string;
    };

    const status = data.handover?.status;

    return status === "Pending" || status === "Active"
      ? {
          handover: data.handover,
          phone: data.phone ?? data.handover?.phone ?? "",
        }
      : null;
  } catch {
    return null;
  }
}

function mapBookingAction(action: ChatRequest["bookingAction"] | undefined) {
  switch (action) {
    case "start_booking":
      return "select_doctor";

    case "check_time_slots":
      return "select_date";

    case "select_time_slot":
      return "confirm_booking";

    case "cancel_appointment":
      return "cancel_appointment";

    case "reschedule_appointment":
      return "reschedule_appointment";

    default:
      return "";
  }
}

function normalizeDoctor(doctor: ChatDoctor | string | undefined) {
  if (!doctor) {
    return null;
  }

  if (typeof doctor === "string") {
    return {
      name: doctor,
      doctorName: doctor,
    };
  }

  return {
    ...doctor,
    id: doctor.id ?? doctor.doctorId,
    doctorId: doctor.doctorId ?? doctor.id,
    name: doctor.name ?? doctor.doctorName,
    doctorName: doctor.doctorName ?? doctor.name,
    weeklySchedule: doctor.weeklySchedule ?? doctor.availableTimes ?? {},
  };
}

function normalizeTimeSlots(slots: unknown) {
  if (!Array.isArray(slots)) {
    return [];
  }

  return slots
    .map((slot) => {
      if (typeof slot === "string") {
        return {
          label: slot,
          booked: false,
        };
      }

      if (typeof slot !== "object" || slot === null) {
        return null;
      }

      const value = slot as Record<string, unknown>;
      const label = String(value.label ?? value.value ?? value.time ?? "");

      if (!label) {
        return null;
      }

      return {
        label,
        booked:
          value.booked === true ||
          value.isBooked === true ||
          value.available === false,
      };
    })
    .filter(
      (slot): slot is { label: string; booked: boolean } => slot !== null
    );
}

async function parseRequest(request: Request): Promise<ChatRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const messagesRaw = formData.get("messages");

    let messages: ChatMessage[] | undefined;

    if (typeof messagesRaw === "string" && messagesRaw) {
      try {
        messages = JSON.parse(messagesRaw) as ChatMessage[];
      } catch {
        messages = undefined;
      }
    }

    const doctorRaw = formData.get("selectedDoctor");
    let selectedDoctor: ChatDoctor | string | undefined;

    if (typeof doctorRaw === "string" && doctorRaw) {
      try {
        selectedDoctor = JSON.parse(doctorRaw) as ChatDoctor;
      } catch {
        selectedDoctor = doctorRaw;
      }
    }

    return {
      messages,
      sessionId: String(formData.get("sessionId") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      email: String(formData.get("email") ?? ""),
      bookingAction: String(
        formData.get("bookingAction") ?? ""
      ) as ChatRequest["bookingAction"],
      selectedDoctor,
      appointmentDate: String(formData.get("appointmentDate") ?? ""),
      appointmentTime: String(formData.get("appointmentTime") ?? ""),
      displayDate: String(formData.get("displayDate") ?? ""),
      dayName: String(formData.get("dayName") ?? ""),
      appointmentId: String(formData.get("appointmentId") ?? ""),
      cancellationReason: String(formData.get("cancellationReason") ?? ""),
      newAppointmentDate: String(formData.get("newAppointmentDate") ?? ""),
      newAppointmentTime: String(formData.get("newAppointmentTime") ?? ""),
      audioBase64: String(formData.get("audioBase64") ?? ""),
      mimeType: String(formData.get("mimeType") ?? ""),
      requestVoiceReply:
        String(formData.get("requestVoiceReply") ?? "").toLowerCase() ===
        "true",
      documentType: String(
        formData.get("documentType") ?? ""
      ) as ChatRequest["documentType"],
      documentId: String(
        formData.get("documentId") ?? ""
      ),
      documentFile:
        formData.get("image") instanceof File
          ? (formData.get("image") as File)
          : formData.get("document") instanceof File
            ? (formData.get("document") as File)
            : undefined,
    };
  }

  return (await request.json()) as ChatRequest;
}

/*
 * Persist one successful user/assistant turn to the backend chat history.
 *
 * This is intentionally best-effort:
 * - assistant responses must still reach the user if history persistence fails;
 * - both text and voice use the same sessionId;
 * - for voice, the STT transcript is stored as the user message.
 */
async function saveChatHistory({
  backendUrl,
  sessionId,
  firstName,
  email,
  userMessage,
  assistantReply,
}: {
  backendUrl: string;
  sessionId: string;
  firstName: string;
  email: string;
  userMessage: string;
  assistantReply: string;
}) {
  const cleanSessionId = sessionId.trim();
  const cleanFirstName = firstName.trim();
  const cleanEmail = email.trim();
  const cleanUserMessage = userMessage.trim();
  const cleanAssistantReply = assistantReply.trim();

  if (
    !cleanSessionId ||
    !cleanFirstName ||
    !cleanEmail ||
    !cleanUserMessage ||
    !cleanAssistantReply
  ) {
    console.warn("[chat history] skipped because required data is missing", {
      hasSessionId: Boolean(cleanSessionId),
      hasFirstName: Boolean(cleanFirstName),
      hasEmail: Boolean(cleanEmail),
      hasUserMessage: Boolean(cleanUserMessage),
      hasAssistantReply: Boolean(cleanAssistantReply),
    });

    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/api/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: cleanSessionId,
        firstName: cleanFirstName,
        email: cleanEmail,
        messages: [
          {
            role: "user",
            content: cleanUserMessage,
          },
          {
            role: "assistant",
            content: cleanAssistantReply,
          },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[chat history] backend save failed:",
        response.status,
        errorText
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[chat history] save error:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequest(request);

    if (!payload.sessionId) {
      return NextResponse.json(
        {
          error: "sessionId is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        {
          error: "email is required",
        },
        {
          status: 400,
        }
      );
    }

    const hasAudio =
      typeof payload.audioBase64 === "string" && payload.audioBase64.length > 100;

    let message = "";

    if (!hasAudio) {
      const messages = payload.messages ?? [];
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage || lastMessage.role !== "user") {
        return NextResponse.json(
          {
            error: "Latest message must be a user message",
          },
          {
            status: 400,
          }
        );
      }

      message = lastMessage.content;
    }

    const backendUrl = getBackendUrl();

    /*
     * HUMAN HANDOVER
     *
     * Human-support requests never go to n8n/Gemini.
     * While a handover is Pending/Active, AI replies are suspended.
     */
    if (!hasAudio && isHumanSupportRequest(message)) {
      const handoverResponse = await fetch(
        `${backendUrl}/api/chat/handover/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: payload.sessionId,
            firstName: String(payload.firstName ?? ""),
            email: payload.email,
            reason: message.trim() || "Patient requested human support",
          }),
          cache: "no-store",
        }
      );

      const handoverData = (await handoverResponse.json()) as {
        error?: string;
        reply?: string;
        handover?: AssistantResponse["handover"];
      };

      if (!handoverResponse.ok) {
        return NextResponse.json(
          {
            error: handoverData.error ?? "Could not request human support",
            reply:
              handoverData.error ??
              "I could not request a receptionist right now. Please call Medicare Medical Center.",
          },
          {
            status: handoverResponse.status,
          }
        );
      }

      return NextResponse.json({
        reply:
          handoverData.reply ??
          "A receptionist has been requested for this conversation.",
        intent: "human_handover_requested",
        humanMode: true,
        handover: handoverData.handover ?? null,
        phone: handoverData.handover?.phone ?? "+94 11 234 5678",
        sessionId: payload.sessionId,
        email: payload.email,
        historySaved: true,
      });
    }

    const openHandover = await getOpenHandover({
      backendUrl,
      sessionId: payload.sessionId,
      email: payload.email,
    });

    if (openHandover) {
      if (hasAudio) {
        return NextResponse.json(
          {
            error: "Human support is active",
            reply:
              "A Medicare receptionist is handling this conversation. Please type your message here, or call the medical center.",
            intent: "human_handover_active",
            humanMode: true,
            handover: openHandover.handover,
            phone: openHandover.phone,
          },
          {
            status: 409,
          }
        );
      }

      const patientMessageResponse = await fetch(
        `${backendUrl}/api/chat/handover/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: payload.sessionId,
            firstName: String(payload.firstName ?? ""),
            email: payload.email,
            content: message.trim(),
          }),
          cache: "no-store",
        }
      );

      const patientMessageData = (await patientMessageResponse.json()) as {
        error?: string;
        handover?: AssistantResponse["handover"];
      };

      if (!patientMessageResponse.ok) {
        return NextResponse.json(
          {
            error:
              patientMessageData.error ??
              "Could not send message to reception",
          },
          {
            status: patientMessageResponse.status,
          }
        );
      }

      return NextResponse.json({
        reply: "",
        intent: "human_handover_message_sent",
        humanMode: true,
        handover:
          patientMessageData.handover ??
          openHandover.handover,
        phone: openHandover.phone,
        sessionId: payload.sessionId,
        email: payload.email,
        historySaved: true,
      });
    }

    /*
     * VOICE MEDICAL-DOCUMENT Q&A
     *
     * When document mode is active, voice is transcribed by the backend,
     * answered against the private document with Gemini, and spoken back
     * with ElevenLabs. Normal voice/n8n behavior remains unchanged outside
     * document mode.
     */
    if (
      hasAudio &&
      payload.documentId
    ) {
      const cleanBase64 =
        String(
          payload.audioBase64 ||
          ""
        ).includes(
          ","
        )
          ? String(
              payload.audioBase64
            ).split(
              ","
            )[1]
          : String(
              payload.audioBase64 ||
              ""
            );

      if (!cleanBase64) {
        return NextResponse.json(
          {
            error:
              "Voice recording is missing.",
            reply:
              "I could not read that voice recording.",
          },
          {
            status:
              400,
          }
        );
      }

      const audioBytes =
        Buffer.from(
          cleanBase64,
          "base64"
        );

      const voiceForm =
        new FormData();

      voiceForm.set(
        "sessionId",
        payload.sessionId
      );

      voiceForm.set(
        "email",
        payload.email
      );

      voiceForm.set(
        "audio",
        new Blob(
          [
            audioBytes,
          ],
          {
            type:
              payload.mimeType ||
              "audio/webm",
          }
        ),
        "medical-document-question.webm"
      );

      const voiceResponse =
        await fetch(
          `${backendUrl}/api/medical-documents/${encodeURIComponent(
            payload.documentId
          )}/ask-voice`,
          {
            method:
              "POST",
            body:
              voiceForm,
            cache:
              "no-store",
          }
        );

      const rawVoiceResponse =
        await voiceResponse.text();

      let voiceData: {
        success?: boolean;
        error?: string;
        reply?: string;
        transcript?: string;
        intent?: string;
        documentId?: string;
        documentType?: string;
        originalFileName?: string;
        voiceMode?: boolean;
        audioBase64?: string;
        mimeType?: string;
      };

      try {
        voiceData =
          JSON.parse(
            rawVoiceResponse
          );
      } catch {
        console.error(
          "[medical document voice] backend returned non-JSON response",
          {
            status:
              voiceResponse.status,
            body:
              rawVoiceResponse.slice(
                0,
                500
              ),
          }
        );

        return NextResponse.json(
          {
            error:
              "Medical document voice service returned an invalid response.",
            reply:
              "I could not process that voice question about your document.",
          },
          {
            status:
              502,
          }
        );
      }

      if (
        !voiceResponse.ok
      ) {
        return NextResponse.json(
          {
            error:
              voiceData.error ??
              "Could not answer the voice medical document question.",
            reply:
              voiceData.error ??
              "I could not answer that voice question about your document.",
          },
          {
            status:
              voiceResponse.status,
          }
        );
      }

      const transcript =
        String(
          voiceData.transcript ||
          ""
        ).trim();

      const assistantReply =
        String(
          voiceData.reply ||
          "I could not produce an explanation for that document."
        ).trim();

      const historySaved =
        await saveChatHistory({
          backendUrl,
          sessionId:
            payload.sessionId,
          firstName:
            String(
              payload.firstName ??
              ""
            ),
          email:
            payload.email,
          userMessage:
            transcript ||
            "Voice question about uploaded medical document",
          assistantReply,
        });

      return NextResponse.json({
        reply:
          assistantReply,
        transcript,
        intent:
          voiceData.intent ??
          "medical_document_question",
        documentId:
          voiceData.documentId ??
          payload.documentId,
        documentType:
          voiceData.documentType,
        originalFileName:
          voiceData.originalFileName,
        sessionId:
          payload.sessionId,
        email:
          payload.email,
        voiceMode:
          true,
        audioBase64:
          voiceData.audioBase64 ??
          "",
        mimeType:
          voiceData.mimeType ??
          "audio/mpeg",
        historySaved,
      });
    }

    /*
     * SECURE MEDICAL-DOCUMENT UPLOAD
     *
     * Prescriptions/reports are stored by the backend in a PRIVATE
     * Supabase Storage bucket. File bytes do not go to n8n/Gemini.
     */
    if (payload.documentFile) {
      const uploadForm =
        new FormData();

      uploadForm.set(
        "sessionId",
        payload.sessionId
      );

      uploadForm.set(
        "firstName",
        String(
          payload.firstName ??
          ""
        )
      );

      uploadForm.set(
        "email",
        payload.email
      );

      uploadForm.set(
        "documentType",
        payload.documentType ||
          "OTHER_MEDICAL_DOCUMENT"
      );

      uploadForm.set(
        "document",
        payload.documentFile,
        payload.documentFile.name
      );

      const uploadResponse =
        await fetch(
          `${backendUrl}/api/medical-documents/upload`,
          {
            method:
              "POST",
            body:
              uploadForm,
            cache:
              "no-store",
          }
        );

      const uploadRaw =
        await uploadResponse.text();

      let uploadData: {
        success?: boolean;
        error?: string;
        reply?: string;
        documentResult?: AssistantResponse["documentResult"];
      };

      try {
        uploadData =
          JSON.parse(
            uploadRaw
          ) as {
            success?: boolean;
            error?: string;
            reply?: string;
            documentResult?: AssistantResponse["documentResult"];
          };
      } catch {
        console.error(
          "[medical document upload] backend returned non-JSON response",
          {
            status:
              uploadResponse.status,
            body:
              uploadRaw.slice(
                0,
                500
              ),
          }
        );

        return NextResponse.json(
          {
            error:
              "Medical document service returned an invalid response.",
            reply:
              "The medical document upload service is not available right now.",
          },
          {
            status:
              502,
          }
        );
      }

      if (!uploadResponse.ok) {
        return NextResponse.json(
          {
            error:
              uploadData.error ??
              "Medical document upload failed",
            reply:
              uploadData.error ??
              "I could not upload that medical document.",
          },
          {
            status:
              uploadResponse.status,
          }
        );
      }

      const documentType =
        payload.documentType ||
        "OTHER_MEDICAL_DOCUMENT";

      const assistantReply =
        String(
          uploadData.reply ??
          "Your medical document was uploaded securely."
        ).trim();

      const historySaved =
        await saveChatHistory({
          backendUrl,
          sessionId:
            payload.sessionId,
          firstName:
            String(
              payload.firstName ??
              ""
            ),
          email:
            payload.email,
          userMessage:
            `Uploaded a ${documentType
              .toLowerCase()
              .replaceAll(
                "_",
                " "
              )}.`,
          assistantReply,
        });

      return NextResponse.json({
        reply:
          assistantReply,
        intent:
          "medical_document_uploaded",
        documentResult:
          uploadData.documentResult,
        sessionId:
          payload.sessionId,
        email:
          payload.email,
        historySaved,
      });
    }

    if (
      !hasAudio &&
      payload.documentId &&
      isDocumentExitRequest(
        message
      )
    ) {
      const assistantReply =
        "Document review mode has ended successfully. You can now continue with normal Medicare AI questions, book or manage an appointment, find a doctor, request human support, or upload another medical document.";

      const historySaved =
        await saveChatHistory({
          backendUrl,
          sessionId:
            payload.sessionId,
          firstName:
            String(
              payload.firstName ??
              ""
            ),
          email:
            payload.email,
          userMessage:
            message,
          assistantReply,
        });

      return NextResponse.json({
        reply:
          assistantReply,
        intent:
          "medical_document_exit",
        documentId:
          payload.documentId,
        sessionId:
          payload.sessionId,
        email:
          payload.email,
        historySaved,
      });
    }

    /*
     * MEDICAL DOCUMENT Q&A
     *
     * When the patient is in document-question mode, ask the backend
     * to explain the already-uploaded private document with Gemini.
     * The file remains in private Supabase Storage and is fetched
     * server-side only.
     */
    if (
      !hasAudio &&
      payload.documentId &&
      message.trim()
    ) {
      const documentResponse =
        await fetch(
          `${backendUrl}/api/medical-documents/${encodeURIComponent(
            payload.documentId
          )}/ask`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                sessionId:
                  payload.sessionId,
                email:
                  payload.email,
                question:
                  message,
              }),
            cache:
              "no-store",
          }
        );

      const rawDocumentResponse =
        await documentResponse.text();

      let documentData: {
        success?: boolean;
        error?: string;
        reply?: string;
        intent?: string;
        documentId?: string;
        documentType?: string;
        originalFileName?: string;
      };

      try {
        documentData =
          JSON.parse(
            rawDocumentResponse
          );
      } catch {
        console.error(
          "[medical document question] backend returned non-JSON response",
          {
            status:
              documentResponse.status,
            body:
              rawDocumentResponse.slice(
                0,
                500
              ),
          }
        );

        return NextResponse.json(
          {
            error:
              "Medical document guidance service returned an invalid response.",
            reply:
              "I could not read the medical document guidance service response.",
          },
          {
            status:
              502,
          }
        );
      }

      if (
        !documentResponse.ok
      ) {
        return NextResponse.json(
          {
            error:
              documentData.error ??
              "Could not answer the medical document question.",
            reply:
              documentData.error ??
              "I could not answer that question about your document.",
          },
          {
            status:
              documentResponse.status,
          }
        );
      }

      const assistantReply =
        String(
          documentData.reply ??
          "I could not produce an explanation for that document."
        ).trim();

      const historySaved =
        await saveChatHistory({
          backendUrl,
          sessionId:
            payload.sessionId,
          firstName:
            String(
              payload.firstName ??
              ""
            ),
          email:
            payload.email,
          userMessage:
            message,
          assistantReply,
        });

      return NextResponse.json({
        reply:
          assistantReply,
        intent:
          "medical_document_question",
        documentId:
          documentData.documentId ??
          payload.documentId,
        documentType:
          documentData.documentType,
        originalFileName:
          documentData.originalFileName,
        sessionId:
          payload.sessionId,
        email:
          payload.email,
        historySaved,
      });
    }

    const selectedDoctor = normalizeDoctor(payload.selectedDoctor);

    const backendPayload = {
      message,
      sessionId: payload.sessionId,
      email: payload.email,
      action: mapBookingAction(payload.bookingAction),
      selectedDoctor,
      selectedDate: payload.appointmentDate ?? "",
      displayDate: payload.displayDate ?? payload.appointmentDate ?? "",
      dayName: payload.dayName ?? "",
      selectedTime: payload.appointmentTime ?? "",
      appointmentId: payload.appointmentId ?? "",
      cancellationReason: payload.cancellationReason ?? "",
      newAppointmentDate: payload.newAppointmentDate ?? "",
      newAppointmentTime: payload.newAppointmentTime ?? "",
      audioBase64: hasAudio ? payload.audioBase64 : "",
      mimeType: hasAudio ? payload.mimeType || "audio/webm" : "",
      requestVoiceReply: hasAudio ? true : Boolean(payload.requestVoiceReply),
    };

    console.log("======================================");
    console.log("[Next /api/chat] forwarding to backend", {
      backendUrl,
      sessionId: backendPayload.sessionId,
      email: backendPayload.email,
      message: backendPayload.message,
      action: backendPayload.action,
      appointmentId: backendPayload.appointmentId,
      hasAudio,
      mimeType: backendPayload.mimeType,
      requestVoiceReply: backendPayload.requestVoiceReply,
    });
    console.log("======================================");

    const response = await fetch(`${backendUrl}/api/assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
      cache: "no-store",
    });

    const raw = await response.text();

    console.log("[Next /api/chat] backend status:", response.status);

    let result: AssistantResponse;

    try {
      result = JSON.parse(raw) as AssistantResponse;
    } catch {
      result = {
        reply: raw,
      };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Assistant backend failed",
          reply: result.reply ?? "The assistant is temporarily unavailable.",
        },
        {
          status: response.status,
        }
      );
    }

    const doctors = result.cards ?? result.doctors ?? [];
    const timeSlots = normalizeTimeSlots(
      result.timeSlots ?? result.availableTimeSlots
    );

    let bookingStep = result.bookingStep;

    if (!bookingStep && result.intent === "booking_calendar") {
      bookingStep = "date";
    }

    if (
      !bookingStep &&
      (result.intent === "time_selection" || timeSlots.length > 0)
    ) {
      bookingStep = "time";
    }

    if (!bookingStep && payload.bookingAction === "start_booking") {
      bookingStep = "date";
    }

    const bookingConfirmed =
      result.bookingConfirmed === true ||
      result.intent === "booking_confirmed" ||
      result.intent === "appointment_booked";

    const assistantReply = String(
      result.reply ?? "I could not create a response."
    ).trim();

    const transcript = String(result.transcript ?? result.message ?? "").trim();

    /*
     * Text history stores only this turn's user message.
     * Voice history stores the STT transcript.
     */
    const userHistoryMessage = hasAudio ? transcript : message.trim();

    const historySaved = await saveChatHistory({
      backendUrl,
      sessionId: payload.sessionId,
      firstName: String(payload.firstName ?? ""),
      email: payload.email,
      userMessage: userHistoryMessage,
      assistantReply,
    });

    const appointmentOperation =
      result.appointmentOperation ??
      (result.intent === "appointment_cancelled"
        ? "cancelled"
        : result.intent === "appointment_rescheduled"
          ? "rescheduled"
          : "none");

    return NextResponse.json({
      reply: assistantReply,
      transcript,
      intent: result.intent,
      doctors,
      cards: result.cards ?? doctors,
      bookingStep,
      timeSlots,
      calendar: result.calendar ?? null,
      selectedDoctor: result.selectedDoctor ?? null,
      selectedDate: result.selectedDate ?? "",
      selectedTime: result.selectedTime ?? "",
      appointmentOperation,
      rescheduleMode: result.rescheduleMode === true,
      bookingConfirmed,
      appointmentId: result.appointment?.id ?? result.appointmentId,
      sessionId: result.sessionId ?? payload.sessionId,
      email: result.email ?? payload.email,
      voiceMode: result.voiceMode ?? hasAudio,
      audioBase64: result.audioBase64 ?? "",
      mimeType: result.mimeType ?? (result.audioBase64 ? "audio/mpeg" : ""),
      historySaved,
    });
  } catch (error) {
    console.error("[Next /api/chat]", error);

    return NextResponse.json(
      {
        error: "Unable to reach assistant",
        reply:
          error instanceof Error
            ? error.message
            : "The medical assistant is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}
