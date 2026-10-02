"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import ChatInput from "./ChatInput";
import DoctorCards, { type Doctor } from "./DoctorCards";
import AppointmentStepPicker from "./AppointmentStepPicker";
import AppointmentConfirmationCard from "./AppointmentConfirmationCard";
import BookingConfirmationMessage from "./BookingConfirmationMessage";
import SymptomAnalysisCard, {
  type SymptomCardData,
} from "./SymptomAnalysisCard";
import DocumentResultCard, {
  type DocumentResultData,
} from "./DocumentResultCard";

type BookingStep = "date" | "time" | "patient" | "none";

type BookingAction =
  | "start_booking"
  | "check_time_slots"
  | "select_time_slot";

interface Props {
  feature: string;
  onBack: () => void;
  visitor: {
    firstName: string;
    email: string;
  };
}

type ChatMessage = {
  role: "ai" | "user";
  text: string;

  imageName?: string;

  doctors?: Doctor[];

  bookingStep?: BookingStep;

  timeSlots?: Array<
    | string
    | {
        label: string;
        booked?: boolean;
      }
  >;

  appointmentPreview?: {
    doctor: Doctor;
    date: string;
    time: string;
  };

  bookingConfirmed?: boolean;

  appointmentId?: string | number;

  historySaved?: boolean;

  symptomCard?: SymptomCardData;

  documentResult?: DocumentResultData;
};

type ChatApiResponse = {
  error?: string;
  reply?: string;

  doctors?: Doctor[];
  cards?: Doctor[];

  bookingStep?: BookingStep;

  timeSlots?: Array<
    | string
    | {
        label: string;
        booked?: boolean;
      }
  >;

  bookingConfirmed?: boolean;

  appointmentId?: string | number;

  historySaved?: boolean;

  symptomCard?: SymptomCardData;

  documentResult?: DocumentResultData;

  intent?: string;
};

export default function ChatScreen({
  feature,
  onBack,
  visitor,
}: Props) {
  const [sessionId] = useState(() => crypto.randomUUID());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: `How can I assist you with ${feature}?`,
    },
  ]);

  const [isSending, setIsSending] = useState(false);

  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);

  const [selectedDate, setSelectedDate] = useState("");

  const handleSend = async (
    text: string,
    image?: File,
    booking?: {
      action: BookingAction;
      doctor: Doctor;
      date?: string;
      time?: string;
    }
  ) => {
    const trimmedText = text.trim();

    if ((!trimmedText && !image) || isSending) {
      return;
    }

    /*
     * We are connecting text + booking first.
     * Image/prescription support will be restored after
     * this path is confirmed working with n8n.
     */
    if (image) {
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text:
            "Prescription/image analysis is temporarily unavailable while the new assistant workflow is being connected.",
        },
      ]);

      return;
    }

    const messageText = trimmedText;

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        text: messageText,
      },
    ];

    setMessages(nextMessages);
    setIsSending(true);

    try {
      const requestBody = {
        messages: nextMessages.map((message) => ({
          role: message.role === "ai" ? "assistant" : "user",
          content: message.text,
        })),

        sessionId,

        firstName: visitor.firstName,

        email: visitor.email,

        bookingAction: booking?.action,

        selectedDoctor: booking?.doctor,

        appointmentDate: booking?.date,

        appointmentTime: booking?.time,

        displayDate: booking?.date
          ? new Date(
              `${booking.date}T12:00:00`
            ).toLocaleDateString()
          : undefined,

        dayName: booking?.date
          ? new Date(`${booking.date}T12:00:00`)
              .toLocaleDateString("en-US", {
                weekday: "long",
              })
              .toLowerCase()
          : undefined,
      };

      console.log("[ChatScreen] Sending JSON to /api/chat", {
        sessionId,
        email: visitor.email,
        bookingAction: booking?.action,
        doctor: booking?.doctor?.name,
        date: booking?.date,
        time: booking?.time,
      });

      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as ChatApiResponse;

      console.log("[ChatScreen] /api/chat response", {
        status: response.status,
        intent: data.intent,
        bookingStep: data.bookingStep,
        bookingConfirmed: data.bookingConfirmed,
      });

      if (!response.ok) {
        throw new Error(
          data.reply || data.error || "Assistant request failed"
        );
      }

      if (!data.reply) {
        throw new Error("Assistant returned an empty response");
      }

      const returnedDoctors = data.doctors ?? data.cards;

      let resolvedBookingStep = data.bookingStep;

      /*
       * After the user clicks Book, show the date picker
       * even if n8n does not explicitly return bookingStep.
       */
      if (
        booking?.action === "start_booking" &&
        (!resolvedBookingStep || resolvedBookingStep === "none")
      ) {
        resolvedBookingStep = "date";
      }

      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: data.reply as string,

          doctors: returnedDoctors,

          bookingStep: resolvedBookingStep,

          timeSlots: data.timeSlots,

          bookingConfirmed: data.bookingConfirmed,

          appointmentId: data.appointmentId,

          historySaved: data.historySaved,

          symptomCard: data.symptomCard,

          documentResult: data.documentResult,
        },
      ]);

      if (data.bookingConfirmed) {
        setSelectedDoctor(null);
        setSelectedDate("");
      }
    } catch (error) {
      console.error("[ChatScreen] assistant request failed:", error);

      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text:
            error instanceof Error
              ? error.message
              : "I could not connect to the assistant. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          aria-label="Back to options"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-bold text-teal-700">
          {feature}
        </h2>
      </div>

      {/* Chat messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-inner">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-auto flex max-w-[80%] justify-end"
                : "max-w-full"
            }
          >
            {/* Symptom card */}
            {message.role === "ai" && message.symptomCard ? (
              <SymptomAnalysisCard
                analysis={message.symptomCard}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);

                  void handleSend(
                    `I would like to book an appointment with ${doctor.name}.`,
                    undefined,
                    {
                      action: "start_booking",
                      doctor,
                    }
                  );
                }}
              />
            ) : null}

            {/* Document result */}
            {message.role === "ai" && message.documentResult ? (
              <DocumentResultCard result={message.documentResult} />
            ) : null}

            {/* Normal message */}
            {!message.bookingConfirmed &&
            !message.symptomCard &&
            !message.documentResult ? (
              <div
                className={`w-fit max-w-full rounded-lg px-4 py-2 text-sm ${
                  message.role === "ai"
                    ? "bg-teal-100 text-slate-800"
                    : "bg-teal-600 text-white"
                }`}
              >
                {message.role === "ai"
                  ? `AI: ${message.text}`
                  : message.text}
              </div>
            ) : null}

            {/* History save warning */}
            {message.role === "ai" &&
            message.historySaved === false ? (
              <p
                className="mt-1 text-xs text-amber-700"
                role="status"
              >
                This chat could not be saved.
              </p>
            ) : null}

            {/* Booking confirmation */}
            {message.role === "ai" &&
            message.bookingConfirmed ? (
              <BookingConfirmationMessage
                message={message.text}
                appointmentId={message.appointmentId}
              />
            ) : null}

            {/* Doctor cards */}
            {message.role === "ai" &&
            message.doctors &&
            message.doctors.length > 0 &&
            !message.symptomCard ? (
              <DoctorCards
                doctors={message.doctors}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);

                  void handleSend(
                    `I would like to book an appointment with ${doctor.name}.`,
                    undefined,
                    {
                      action: "start_booking",
                      doctor,
                    }
                  );
                }}
              />
            ) : null}

            {/* Date / time picker */}
            {message.role === "ai" &&
            message.bookingStep ? (
              <AppointmentStepPicker
                step={message.bookingStep}
                timeSlots={message.timeSlots}
                onSubmit={(value) => {
                  if (
                    message.bookingStep !== "date" ||
                    !selectedDoctor
                  ) {
                    return;
                  }

                  setSelectedDate(value);

                  void handleSend(
                    `My preferred appointment date is ${value}. Please check available times.`,
                    undefined,
                    {
                      action: "check_time_slots",
                      doctor: selectedDoctor,
                      date: value,
                    }
                  );
                }}
                onSelectTime={(time) => {
                  if (!selectedDoctor || !selectedDate) {
                    return;
                  }

                  setMessages((current) => [
                    ...current,
                    {
                      role: "ai",
                      text: "Please review your appointment details:",
                      appointmentPreview: {
                        doctor: selectedDoctor,
                        date: selectedDate,
                        time,
                      },
                    },
                  ]);
                }}
              />
            ) : null}

            {/* Appointment review before final confirm */}
            {message.role === "ai" &&
            message.appointmentPreview ? (
              <AppointmentConfirmationCard
                doctorName={
                  message.appointmentPreview.doctor.name
                }
                date={message.appointmentPreview.date}
                time={message.appointmentPreview.time}
                onConfirm={() => {
                  const preview =
                    message.appointmentPreview;

                  if (!preview) {
                    return;
                  }

                  void handleSend(
                    `I confirm the appointment with ${preview.doctor.name} on ${preview.date} at ${preview.time}.`,
                    undefined,
                    {
                      action: "select_time_slot",
                      doctor: preview.doctor,
                      date: preview.date,
                      time: preview.time,
                    }
                  );
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="mt-4 shrink-0">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}