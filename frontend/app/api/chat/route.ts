import { NextResponse } from "next/server";

type ChatMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

type ChatDoctor = {
  id: number | string;
  name: string;
  specialization?: string | null;
  designation?: string | null;
  profileImageUrl?: string | null;
  yearsOfExperience?: number | null;
  availableTimes?: string[] | string | Record<string, unknown> | null;
  weeklySchedule?: Record<string, unknown>;
};

type BookingStep = "date" | "time" | "patient" | "none";
type WebhookTimeSlot = string | {
  label?: string;
  value?: string;
  time?: string;
  booked?: boolean;
  isBooked?: boolean;
  available?: boolean;
};

type ChatRequest = {
  messages: ChatMessage[];
  context?: ChatContext;
  sessionId?: string;
  firstName?: string;
  email?: string;
  bookingAction?: "start_booking" | "check_time_slots" | "select_time_slot";
  selectedDoctor?: ChatDoctor | string;
  appointmentDate?: string;
  appointmentTime?: string;
  displayDate?: string;
  dayName?: string;
};

type PublicDoctor = {
  id: number | string;
  name?: string | null;
  specialization?: string | null;
  designation?: string | null;
  profileImageUrl?: string | null;
  yearsOfExperience?: number | null;
};

type BookingDraft = {
  step: "none" | "doctor" | "datetime" | "patient";
  doctorId?: number | string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
};

type RescheduleDraft = {
  step: "none" | "lookup" | "datetime";
  appointmentId?: string;
  patientEmail?: string;
};

type CancelDraft = {
  step: "none" | "lookup" | "reason";
  appointmentId?: string;
  patientEmail?: string;
  cancellationReason?: string;
};

type ChatContext = {
  bookingDraft?: BookingDraft;
  rescheduleDraft?: RescheduleDraft;
  cancelDraft?: CancelDraft;
};

const isDoctorAvailabilityQuery = (text: string) => {
  return /available\s+doctors|who\s+are\s+the\s+doctors|list\s+.*doctors/i.test(text);
};

const isBookingIntent = (text: string) => {
  return /book\s+an?\s+appointment|book\s+appointment|book\s+with/i.test(text);
};

const parseEmail = (text: string) => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
};

const parsePhone = (text: string) => {
  const match = text.match(/(\+?\d[\d\s()\-]{7,})/);
  return match ? match[0].replace(/\s+/g, " ").trim() : null;
};

const parseDate = (text: string) => {
  const match = text.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

const parseTime = (text: string) => {
  // Match time in formats: HH:MM, H:MM, HH.MM, H.MM, with optional am/pm
  const match = text.match(/(\d{1,2})[:.]?(\d{2})\s*(am|pm)?/i);
  if (!match) {
    return null;
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3]?.toLowerCase();
  
  // Handle 12-hour to 24-hour conversion
  if (meridiem === "pm" && hours < 12) {
    hours += 12;
  }
  if (meridiem === "am" && hours === 12) {
    hours = 0;
  }
  
  // Validate time ranges
  if (hours < 0 || hours > 23 || parseInt(minutes, 10) < 0 || parseInt(minutes, 10) > 59) {
    return null;
  }
  
  const paddedHours = hours.toString().padStart(2, "0");
  return `${paddedHours}:${minutes}`;
};

const parseAppointmentId = (text: string) => {
  const match = text.match(/\b(\d{1,10})\b/);
  return match ? match[1] : null;
};

const isRescheduleIntent = (text: string) => {
  return /reschedule|change\s+appointment|move\s+appointment/i.test(text);
};

const isCancelIntent = (text: string) => {
  return /cancel\s+appointment|cancel\s+my\s+appointment|delete\s+appointment/i.test(text);
};

const normalizeName = (value: string) => value.trim().toLowerCase();

const matchDoctorsByName = (doctors: PublicDoctor[], input: string) => {
  const normalizedInput = normalizeName(input);
  if (!normalizedInput) {
    return [];
  }

  return doctors.filter((doctor) => {
    const name = doctor.name ? normalizeName(doctor.name) : "";
    return name.includes(normalizedInput) || normalizedInput.includes(name);
  });
};

const formatDoctorList = (doctors: PublicDoctor[]) => {
  if (doctors.length === 0) {
    return "I do not see any doctors in the system yet. Please ask an administrator to add doctors first.";
  }

  const lines = doctors.map((doctor, index) => {
    const specialization = doctor.specialization ? ` — ${doctor.specialization}` : "";
    const designation = doctor.designation ? `, ${doctor.designation}` : "";
    const experience =
      typeof doctor.yearsOfExperience === "number"
        ? ` (Experience: ${doctor.yearsOfExperience} years)`
        : "";
    const name = doctor.name ?? "Doctor";
    return `${index + 1}. ${name}${specialization}${designation}${experience}`;
  });

  return [
    "Here are the doctors currently listed for appointments:",
    "",
    ...lines,
    "",
    "Tell me who you would like to see and your preferred date and time, and I will check availability."
  ].join("\n");
};

export async function POST(request: Request) {
  let payload: ChatRequest;
  let image: File | undefined;

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.formData();
    const messagesValue = formData.get("messages");
    const imageValue = formData.get("image");

    if (typeof messagesValue !== "string") {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    try {
      payload = {
        messages: JSON.parse(messagesValue) as ChatMessage[],
        sessionId: String(formData.get("sessionId") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        email: String(formData.get("email") ?? ""),
        bookingAction: String(formData.get("bookingAction") ?? "") as ChatRequest["bookingAction"],
        selectedDoctor: (() => {
          const value = formData.get("selectedDoctor");
          if (typeof value !== "string" || !value) return undefined;
          try {
            return JSON.parse(value) as ChatDoctor;
          } catch {
            return value;
          }
        })(),
        appointmentDate: String(formData.get("appointmentDate") ?? ""),
        appointmentTime: String(formData.get("appointmentTime") ?? ""),
        displayDate: String(formData.get("displayDate") ?? ""),
        dayName: String(formData.get("dayName") ?? "")
      };
    } catch {
      return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
    }

    if (imageValue instanceof File) {
      if (!imageValue.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
      }
      if (imageValue.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be 10 MB or smaller" }, { status: 413 });
      }
      image = imageValue;
    }
  } else {
    payload = (await request.json()) as ChatRequest;
  }

  const {
    messages,
    context,
    sessionId,
    firstName,
    email,
    bookingAction,
    selectedDoctor,
    appointmentDate,
    appointmentTime,
    displayDate,
    dayName
  } = payload;

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:5000";
  const logMessages = async (replyText: string) => {
    if (!sessionId || !lastMessage || !firstName || !email) {
      return;
    }

    try {
      const historyResponse = await fetch(`${backendBaseUrl}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          firstName,
          email,
          messages: [
            { role: lastMessage.role, content: lastMessage.content },
            { role: "assistant", content: replyText }
          ]
        })
      });

      if (!historyResponse.ok) {
        console.error("Chat history log failed:", await historyResponse.text());
      }
    } catch (error) {
      console.error("Chat history log failed:", error);
    }
  };

  const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;

  if (n8nWebhookUrl && lastMessage?.role === "user") {
    try {
      const webhookBody = image ? new FormData() : null;
      const selectedDoctorRecord: Record<string, unknown> | undefined = typeof selectedDoctor === "string"
        ? { doctorName: selectedDoctor }
        : selectedDoctor
          ? {
              ...selectedDoctor,
              doctorId: selectedDoctor.id,
              doctorName: selectedDoctor.name,
              weeklySchedule: selectedDoctor.weeklySchedule ?? selectedDoctor.availableTimes
            }
          : undefined;
      const messagePayload = {
        chatInput: lastMessage.content,
        message: lastMessage.content,
        messages,
        sessionId: sessionId ?? "anonymous",
        firstName,
        email,
        action: bookingAction === "check_time_slots"
          ? "select_date"
          : bookingAction === "select_time_slot"
            ? "confirm_booking"
            : bookingAction === "start_booking"
              ? "select_doctor"
              : undefined,
        bookingAction,
        selectedDoctor: selectedDoctorRecord,
        weeklySchedule: selectedDoctorRecord?.weeklySchedule,
        doctorId: selectedDoctorRecord?.doctorId,
        doctorName: selectedDoctorRecord?.doctorName,
        selectedDate: appointmentDate,
        appointmentDate,
        displayDate,
        dayName,
        selectedTime: appointmentTime,
        appointmentTime
      };

      if (webhookBody && image) {
        for (const [key, value] of Object.entries(messagePayload)) {
          webhookBody.set(key, typeof value === "string" ? value : JSON.stringify(value));
        }
        webhookBody.set("image", image, image.name);
      }

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        ...(webhookBody
          ? { body: webhookBody }
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(messagePayload)
            })
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      const responseData = (await response.json()) as {
        output?: string;
        response?: string;
        responseMessage?: string;
        text?: string;
        reply?: string;
        message?: string;
        doctors?: ChatDoctor[];
        bookingStep?: BookingStep;
        intent?: string;
        bookingConfirmed?: boolean;
        success?: boolean;
        appointmentId?: string | number;
        id?: string | number;
        doctorName?: string;
        selectedDate?: string;
        selectedTime?: string;
        timeSlots?: WebhookTimeSlot[] | string;
        availableTimeSlots?: WebhookTimeSlot[] | string;
      } | Array<{
        output?: string;
        response?: string;
        responseMessage?: string;
        text?: string;
        reply?: string;
        message?: string;
        doctors?: ChatDoctor[];
        bookingStep?: BookingStep;
        intent?: string;
        bookingConfirmed?: boolean;
        success?: boolean;
        appointmentId?: string | number;
        id?: string | number;
        doctorName?: string;
        selectedDate?: string;
        selectedTime?: string;
        timeSlots?: WebhookTimeSlot[] | string;
        availableTimeSlots?: WebhookTimeSlot[] | string;
      }>;
      const data = Array.isArray(responseData) ? responseData[0] : responseData;
      const doctors = Array.isArray(data.doctors) ? data.doctors : undefined;
      const rawTimeSlots = Array.isArray(data.timeSlots)
        ? data.timeSlots
        : typeof data.timeSlots === "string"
          ? JSON.parse(data.timeSlots) as WebhookTimeSlot[]
          : Array.isArray(data.availableTimeSlots)
          ? data.availableTimeSlots
          : typeof data.availableTimeSlots === "string"
            ? JSON.parse(data.availableTimeSlots) as WebhookTimeSlot[]
            : undefined;
      const timeSlots = rawTimeSlots
        ?.map((slot) => typeof slot === "string"
          ? { label: slot, booked: false }
          : {
              label: slot.label ?? slot.value ?? slot.time ?? "",
              booked: slot.booked === true || slot.isBooked === true || slot.available === false
            })
        .filter((slot) => Boolean(slot.label));
      const bookingStep = data.bookingStep ??
        (data.intent === "time_selection" || timeSlots?.length ? "time" : undefined);
      const bookingConfirmed = data.bookingConfirmed === true ||
        (bookingAction === "select_time_slot" && data.success === true) ||
        data.intent === "booking_confirmed" || data.intent === "appointment_booked";
      const rawReply = data.responseMessage ?? data.output ?? data.response ?? data.text ?? data.reply ?? data.message;
      let reply = rawReply;

      if (rawReply) {
        try {
          const parsedReply = JSON.parse(rawReply) as {
            responseMessage?: string;
            reply?: string;
            output?: string;
            text?: string;
            message?: string;
          };
          reply = parsedReply.responseMessage ?? parsedReply.reply ?? parsedReply.output ??
            parsedReply.text ?? parsedReply.message ?? rawReply;
        } catch {
          reply = rawReply;
        }
      }

      reply ??=
        (doctors?.length ? "Here are the doctors currently available:" : undefined) ??
        (bookingConfirmed
          ? `Your appointment with ${data.doctorName ?? (typeof selectedDoctorRecord?.doctorName === "string" ? selectedDoctorRecord.doctorName : "the selected doctor")} is confirmed for ${data.selectedDate ?? appointmentDate ?? "the selected date"} at ${data.selectedTime ?? appointmentTime ?? "the selected time"}.`
          : undefined);

      if (!reply) {
        throw new Error("Webhook response did not contain output text");
      }

      await logMessages(reply);
      return NextResponse.json({
        reply,
        doctors,
        bookingStep,
        timeSlots,
        bookingConfirmed,
        appointmentId: data.appointmentId ?? data.id
      });
    } catch (error) {
      console.error("n8n chat webhook failed:", error);
      return NextResponse.json(
        { reply: "I could not reach the assistant right now. Please try again shortly." },
        { status: 502 }
      );
    }
  }

  const bookingDraft: BookingDraft = context?.bookingDraft ?? { step: "none" };
  const rescheduleDraft: RescheduleDraft = context?.rescheduleDraft ?? { step: "none" };
  const cancelDraft: CancelDraft = context?.cancelDraft ?? { step: "none" };

  const respondWithLog = async (payload: {
    reply: string;
    nextContext?: ChatContext;
    doctors?: ChatDoctor[];
  }) => {
    await logMessages(payload.reply);
    return NextResponse.json(payload);
  };
  if (lastMessage?.role === "user" && isDoctorAvailabilityQuery(lastMessage.content)) {
    try {
      const response = await fetch(`${backendBaseUrl}/api/doctors/public`);
      if (!response.ok) {
        return NextResponse.json(
          { reply: "I could not retrieve the doctor list right now. Please try again shortly." },
          { status: 200 }
        );
      }
      const doctors = ((await response.json()) as PublicDoctor[]).map((doctor) => ({
        ...doctor,
        name: doctor.name ?? "Doctor"
      }));
      return respondWithLog({ reply: formatDoctorList(doctors), doctors });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { reply: `I could not reach the doctor directory (${message}). Please try again shortly.` },
        { status: 200 }
      );
    }
  }

  if (lastMessage?.role === "user" && (isBookingIntent(lastMessage.content) || bookingDraft.step !== "none")) {
    const requestedName = lastMessage.content.replace(/book\s+an?\s+appointment\s*(with|from)?/i, "").trim();
    try {
      const response = await fetch(`${backendBaseUrl}/api/doctors/public`);
      if (!response.ok) {
        return NextResponse.json({ reply: "I could not reach the doctor directory right now. Please try again." });
      }
      const doctors = (await response.json()) as PublicDoctor[];

      if (bookingDraft.step === "none") {
        const matches = matchDoctorsByName(doctors, requestedName);

        if (matches.length === 1) {
          const doctor = matches[0];
          const doctorName = doctor.name ?? "the selected doctor";
          const specialty = doctor.specialization ? ` (${doctor.specialization})` : "";
          const nextContext: ChatContext = {
            bookingDraft: {
              step: "datetime",
              doctorId: doctor.id,
              doctorName
            }
          };
          return respondWithLog({
            reply: `Great choice. I can schedule an appointment with ${doctorName}${specialty}. Please share your preferred date (YYYY-MM-DD) and time (HH:MM).`,
            nextContext
          });
        }

        if (matches.length > 1) {
          const options = matches
            .map((doctor, index) => {
              const name = doctor.name ?? "Doctor";
              const specialization = doctor.specialization ? ` — ${doctor.specialization}` : "";
              return `${index + 1}. ${name}${specialization}`;
            })
            .join("\n");
          return respondWithLog({
            reply: `I found multiple matches. Which doctor would you like?\n\n${options}`,
            nextContext: { bookingDraft }
          });
        }

        return respondWithLog({
          reply: "I could not find that doctor in the system. Please check the name or ask for the available doctors list."
        });
      }

      if (bookingDraft.step === "datetime") {
        const appointmentDate = parseDate(lastMessage.content);
        const appointmentTime = parseTime(lastMessage.content);
        if (!appointmentDate || !appointmentTime) {
          return respondWithLog({
            reply: "Please provide the date and time in this format: YYYY-MM-DD at HH:MM (e.g., 2026-02-20 at 14:30).",
            nextContext: { bookingDraft }
          });
        }

        const nextContext: ChatContext = {
          bookingDraft: {
            ...bookingDraft,
            step: "patient",
            appointmentDate,
            appointmentTime
          }
        };

        return respondWithLog({
          reply: "Thanks. Please share your full name, email, and phone number to confirm the booking.",
          nextContext
        });
      }

      if (bookingDraft.step === "patient") {
        const patientEmail = parseEmail(lastMessage.content) ?? bookingDraft.patientEmail;
        const patientPhone = parsePhone(lastMessage.content) ?? bookingDraft.patientPhone;
        const patientName = bookingDraft.patientName ?? lastMessage.content.replace(patientEmail ?? "", "").replace(patientPhone ?? "", "").trim();

        const missingFields = [] as string[];
        if (!patientName) missingFields.push("full name");
        if (!patientEmail) missingFields.push("email");
        if (!patientPhone) missingFields.push("phone number");

        if (missingFields.length > 0) {
          return respondWithLog({
            reply: `Please provide your ${missingFields.join(", ")} to confirm the booking.`,
            nextContext: {
              bookingDraft: {
                ...bookingDraft,
                patientName,
                patientEmail,
                patientPhone
              }
            }
          });
        }

        const response = await fetch(`${backendBaseUrl}/api/appointments/public`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: bookingDraft.doctorId,
            patientName,
            patientEmail,
            patientPhone,
            appointmentDate: bookingDraft.appointmentDate,
            appointmentTime: bookingDraft.appointmentTime
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return respondWithLog({
            reply: `I could not confirm the appointment. ${errorText || "Please try another time."}`,
            nextContext: { bookingDraft: { step: "none" } }
          });
        }

        const data = (await response.json()) as { appointmentId?: number | string };
        const doctorName = bookingDraft.doctorName ?? "the selected doctor";
        const confirmation = `Your appointment with ${doctorName} is requested for ${bookingDraft.appointmentDate} at ${bookingDraft.appointmentTime}. Your reference number is ${data.appointmentId}.`;
        return respondWithLog({
          reply: confirmation,
          nextContext: { bookingDraft: { step: "none" } }
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({
        reply: `I could not reach the doctor directory (${message}). Please try again shortly.`
      });
    }
  }

  if (lastMessage?.role === "user" && (isRescheduleIntent(lastMessage.content) || rescheduleDraft.step !== "none")) {
    if (rescheduleDraft.step === "none") {
      const appointmentId = parseAppointmentId(lastMessage.content);
      const patientEmail = parseEmail(lastMessage.content);
      if (!appointmentId || !patientEmail) {
        return respondWithLog({
          reply: "Please share your appointment reference number and the email used for booking.",
          nextContext: {
            rescheduleDraft: {
              step: "lookup",
              appointmentId: appointmentId ?? undefined,
              patientEmail: patientEmail ?? undefined
            }
          }
        });
      }
      return respondWithLog({
        reply: "Thanks. What new date (YYYY-MM-DD) and time (HH:MM) would you like?",
        nextContext: {
          rescheduleDraft: { step: "datetime", appointmentId, patientEmail }
        }
      });
    }

    if (rescheduleDraft.step === "lookup") {
      const appointmentId = rescheduleDraft.appointmentId ?? parseAppointmentId(lastMessage.content);
      const patientEmail = rescheduleDraft.patientEmail ?? parseEmail(lastMessage.content);
      if (!appointmentId || !patientEmail) {
        return respondWithLog({
          reply: "Please provide both your appointment reference number and booking email.",
          nextContext: {
            rescheduleDraft: {
              step: "lookup",
              appointmentId: appointmentId ?? undefined,
              patientEmail: patientEmail ?? undefined
            }
          }
        });
      }
      return respondWithLog({
        reply: "Got it. What new date (YYYY-MM-DD) and time (HH:MM) would you like?",
        nextContext: {
          rescheduleDraft: { step: "datetime", appointmentId, patientEmail }
        }
      });
    }

    if (rescheduleDraft.step === "datetime") {
      const appointmentDate = parseDate(lastMessage.content);
      const appointmentTime = parseTime(lastMessage.content);
      if (!appointmentDate || !appointmentTime) {
        return respondWithLog({
          reply: "Please provide the new date and time in this format: YYYY-MM-DD at HH:MM.",
          nextContext: { rescheduleDraft }
        });
      }

      const response = await fetch(`${backendBaseUrl}/api/appointments/public/${rescheduleDraft.appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientEmail: rescheduleDraft.patientEmail,
          appointmentDate,
          appointmentTime
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return respondWithLog({
          reply: `I could not reschedule the appointment. ${errorText || "Please try again."}`,
          nextContext: { rescheduleDraft: { step: "none" } }
        });
      }

      return respondWithLog({
        reply: `Your appointment has been rescheduled to ${appointmentDate} at ${appointmentTime}.`,
        nextContext: { rescheduleDraft: { step: "none" } }
      });
    }
  }

  if (lastMessage?.role === "user" && (isCancelIntent(lastMessage.content) || cancelDraft.step !== "none")) {
    if (cancelDraft.step === "none") {
      const appointmentId = parseAppointmentId(lastMessage.content);
      const patientEmail = parseEmail(lastMessage.content);
      if (!appointmentId || !patientEmail) {
        return respondWithLog({
          reply: "Please share your appointment reference number and the email used for booking.",
          nextContext: {
            cancelDraft: {
              step: "lookup",
              appointmentId: appointmentId ?? undefined,
              patientEmail: patientEmail ?? undefined
            }
          }
        });
      }
      return respondWithLog({
        reply: "Would you like to add a brief cancellation reason? If not, reply 'no'.",
        nextContext: {
          cancelDraft: { step: "reason", appointmentId, patientEmail }
        }
      });
    }

    if (cancelDraft.step === "lookup") {
      const appointmentId = cancelDraft.appointmentId ?? parseAppointmentId(lastMessage.content);
      const patientEmail = cancelDraft.patientEmail ?? parseEmail(lastMessage.content);
      if (!appointmentId || !patientEmail) {
        return respondWithLog({
          reply: "Please provide both your appointment reference number and booking email.",
          nextContext: {
            cancelDraft: {
              step: "lookup",
              appointmentId: appointmentId ?? undefined,
              patientEmail: patientEmail ?? undefined
            }
          }
        });
      }
      return respondWithLog({
        reply: "Would you like to add a brief cancellation reason? If not, reply 'no'.",
        nextContext: {
          cancelDraft: { step: "reason", appointmentId, patientEmail }
        }
      });
    }

    if (cancelDraft.step === "reason") {
      const cancellationReason = /^(no|none|skip)$/i.test(lastMessage.content.trim())
        ? "Cancelled by patient"
        : lastMessage.content.trim();

      const response = await fetch(`${backendBaseUrl}/api/appointments/public/${cancelDraft.appointmentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientEmail: cancelDraft.patientEmail,
          cancellationReason
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return respondWithLog({
          reply: `I could not cancel the appointment. ${errorText || "Please try again."}`,
          nextContext: { cancelDraft: { step: "none" } }
        });
      }

      return respondWithLog({
        reply: "Your appointment has been cancelled. If you need anything else, just let me know.",
        nextContext: { cancelDraft: { step: "none" } }
      });
    }
  }

  const model = process.env.OLLAMA_MODEL ?? "llama3.1:8b";
  const configuredBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const baseUrl = configuredBaseUrl.replace("localhost", "127.0.0.1");
  const geminiEnabled = (process.env.GEMINI_CHAT_ENABLED ?? "true") === "true";

  try {
    if (geminiEnabled) {
      const geminiResponse = await fetch(`${backendBaseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (geminiResponse.ok) {
        const data = (await geminiResponse.json()) as { reply?: string };
        return respondWithLog({ reply: data.reply ?? "" });
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "LLM request failed", details: errorText },
        { status: 500 }
      );
    }

    const data = (await response.json()) as { message?: { content?: string } };
    return respondWithLog({ reply: data.message?.content ?? "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Unable to reach the LLM server", details: message },
      { status: 500 }
    );
  }
}
