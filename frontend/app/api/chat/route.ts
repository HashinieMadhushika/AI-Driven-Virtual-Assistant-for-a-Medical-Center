import { NextResponse } from "next/server";

type ChatMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

type ChatRequest = {
  messages: ChatMessage[];
  context?: ChatContext;
  sessionId?: string;
};

type PublicDoctor = {
  id: number | string;
  name?: string | null;
  specialization?: string | null;
  designation?: string | null;
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
  const { messages, context, sessionId } = (await request.json()) as ChatRequest;

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:5000";
  const bookingDraft: BookingDraft = context?.bookingDraft ?? { step: "none" };
  const rescheduleDraft: RescheduleDraft = context?.rescheduleDraft ?? { step: "none" };
  const cancelDraft: CancelDraft = context?.cancelDraft ?? { step: "none" };
  const logMessages = async (replyText: string) => {
    if (!sessionId || !lastMessage) {
      return;
    }

    try {
      await fetch(`${backendBaseUrl}/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: [
            { role: lastMessage.role, content: lastMessage.content },
            { role: "assistant", content: replyText }
          ]
        })
      });
    } catch (error) {
      console.error("Chat history log failed:", error);
    }
  };

  const respondWithLog = async (payload: { reply: string; nextContext?: ChatContext }) => {
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
      const doctors = (await response.json()) as PublicDoctor[];
      return respondWithLog({ reply: formatDoctorList(doctors) });
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
