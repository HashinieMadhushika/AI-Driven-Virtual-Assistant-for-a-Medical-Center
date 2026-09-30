"use client";

import FeatureCard from "./FeatureCard";
import ChatInput from "./ChatInput";
import { useState } from "react";
import { CalendarCheck, Stethoscope, FileText, Pill } from "lucide-react";
import DoctorCards, { type Doctor } from "./DoctorCards";
import AppointmentStepPicker from "./AppointmentStepPicker";
import AppointmentConfirmationCard from "./AppointmentConfirmationCard";
import BookingConfirmationMessage from "./BookingConfirmationMessage";
import SymptomAnalysisCard, { type SymptomCardData } from "./SymptomAnalysisCard";
import DocumentResultCard, { type DocumentResultData } from "./DocumentResultCard";
import type { PreviousChat } from "./UserInfoScreen";

type BookingStep = "date" | "time" | "patient" | "none";
type BookingAction = "start_booking" | "check_time_slots" | "select_time_slot";
type DocumentType = "MEDICAL_REPORT" | "PRESCRIPTION";
type ChatMessage = {
  role: "ai" | "user";
  text: string;
  imageName?: string;
  doctors?: Doctor[];
  bookingStep?: BookingStep;
  timeSlots?: Array<string | { label: string; booked?: boolean }>;
  appointmentPreview?: { doctor: Doctor; date: string; time: string };
  bookingConfirmed?: boolean;
  appointmentId?: string | number;
  bookingPrompt?: "pending" | "accepted" | "declined";
  historySaved?: boolean;
  symptomCard?: SymptomCardData;
  documentResult?: DocumentResultData;
  documentChoice?: "pending" | DocumentType;
};

interface Props {
  visitor: { firstName: string; email: string };
  previousChat: PreviousChat | null;
}

export default function FeatureSelectionScreen({ visitor, previousChat }: Props) {
  const [sessionId] = useState(() => previousChat?.sessionId ?? crypto.randomUUID());
  const [isSending, setIsSending] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (previousChat?.messages.length) {
      return previousChat.messages.map((message) => ({
        role: message.role === "assistant" ? "ai" as const : "user" as const,
        text: message.content
      }));
    }

    return [
      { role: "ai" as const, text: "Hi! You can ask me anything, or choose one option above." }
    ];
  });
  const handleSend = async (
    text: string,
    image?: File,
    booking?: { action: BookingAction; doctor: Doctor; date?: string; time?: string },
    messageHistory: typeof messages = messages
  ) => {
    const t = text.trim();
    if ((!t && !image) || isSending) return;
    const messageText = t || "Please analyze the attached image.";

    const nextMessages = [
      ...messageHistory,
      { role: "user" as const, text: messageText, imageName: image?.name }
    ];
    setMessages(nextMessages);

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      formData.set("firstName", visitor.firstName);
      formData.set("email", visitor.email);
      if (booking) {
        formData.set("bookingAction", booking.action);
        formData.set("selectedDoctor", JSON.stringify(booking.doctor));
        if (booking.date) {
          formData.set("appointmentDate", booking.date);
          formData.set("displayDate", new Date(`${booking.date}T12:00:00`).toLocaleDateString());
          formData.set("dayName", new Date(`${booking.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase());
        }
        if (booking.time) formData.set("appointmentTime", booking.time);
      }
      if (image) formData.set("documentType", selectedDocumentType ?? "PRESCRIPTION");
      formData.set("messages", JSON.stringify(nextMessages.map((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text
      }))));
      if (image) formData.set("image", image, image.name);

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as {
        error?: string;
        reply?: string;
        doctors?: Doctor[];
        bookingStep?: BookingStep;
        timeSlots?: Array<string | { label: string; booked?: boolean }>;
        bookingConfirmed?: boolean;
        appointmentId?: string | number;
        historySaved?: boolean;
        symptomCard?: SymptomCardData;
        documentResult?: DocumentResultData;
      };
      if (!response.ok || !data.reply) throw new Error(data.error ?? "Chat request failed");
      const startsDoctorBooking = booking?.action === "start_booking";
      setMessages((prev) => [...prev, {
        role: "ai",
        text: data.reply!,
        doctors: data.doctors,
        bookingStep: startsDoctorBooking && (!data.bookingStep || data.bookingStep === "none")
          ? "date"
          : data.bookingStep,
        timeSlots: data.timeSlots,
        bookingConfirmed: data.bookingConfirmed,
        appointmentId: data.appointmentId,
        historySaved: data.historySaved,
        symptomCard: data.symptomCard,
        documentResult: data.documentResult
      }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: error instanceof Error ? error.message : "I could not connect right now. Please try again."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Title */}
      <h2 className="text-xl font-bold text-teal-700 text-center mb-4">
        How can I help you?
      </h2>

      {/* Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FeatureCard
          title="Book Appointment"
          description="Schedule visit with specialist"
          icon={<CalendarCheck className="w-5 h-5" />}
          onClick={() => setMessages((current) => [
            ...current,
            { role: "ai", text: "Do you want to book an appointment?", bookingPrompt: "pending" }
          ])}
        />
        <FeatureCard
          title="Find Doctor"
          description="Search by specialization"
          icon={<Stethoscope className="w-5 h-5" />}
          onClick={() => void handleSend("Who are the available doctors?")}
        />
        <FeatureCard
          title="Check Report"
          description="Access medical reports"
          icon={<FileText className="w-5 h-5" />}
          onClick={() => setMessages((current) => [
            ...current,
            { role: "ai", text: "What type of document would you like to check?", documentChoice: "pending" }
          ])}
        />
      </div>

      {/* Chat terminal area */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-inner space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto flex max-w-[80%] justify-end" : "max-w-full"}>
            {m.role === "ai" && m.symptomCard ? (
              <SymptomAnalysisCard
                analysis={m.symptomCard}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);
                  void handleSend(`I would like to book an appointment with ${doctor.name}.`, undefined, {
                    action: "start_booking",
                    doctor
                  });
                }}
              />
            ) : null}
            {m.role === "ai" && m.documentResult ? <DocumentResultCard result={m.documentResult} /> : null}
            {!m.bookingConfirmed && !m.symptomCard && !m.documentResult ? <div className={`w-fit max-w-full rounded-xl px-4 py-2 text-sm ${
              m.role === "ai" ? "bg-teal-100 text-slate-800" : "bg-teal-600 text-white"
            }`}>
              {m.role === "ai" ? `AI: ${m.text}` : (
                <>
                  {m.text}
                  {m.imageName ? <div className="mt-1 text-xs opacity-80">Image: {m.imageName}</div> : null}
                </>
              )}
            </div> : null}
            {m.documentChoice === "pending" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDocumentType("MEDICAL_REPORT");
                    setMessages((current) => [
                      ...current.map((message, index) => index === i
                        ? { ...message, documentChoice: "MEDICAL_REPORT" as const }
                        : message),
                      { role: "ai", text: "Medical report selected. Attach an image of the report; you can add a question too." }
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <FileText className="h-4 w-4" />
                  Medical report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDocumentType("PRESCRIPTION");
                    setMessages((current) => [
                      ...current.map((message, index) => index === i
                        ? { ...message, documentChoice: "PRESCRIPTION" as const }
                        : message),
                      { role: "ai", text: "Prescription selected. Attach an image of the prescription; you can add a question too." }
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-3.5 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <Pill className="h-4 w-4" />
                  Prescription
                </button>
              </div>
            ) : null}
            {m.role === "ai" && m.historySaved === false ? (
              <p className="mt-1 text-xs text-amber-700" role="status">
                This chat could not be saved. Your previous conversation may not be available next time.
              </p>
            ) : null}
            {m.bookingPrompt === "pending" ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => {
                    const answeredMessages = messages.map((message, index) =>
                      index === i ? { ...message, bookingPrompt: "accepted" as const } : message
                    );
                    setMessages(answeredMessages);
                    void handleSend("Who are the available doctors?", undefined, undefined, answeredMessages);
                  }}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => {
                    const answeredMessages = messages.map((message, index) =>
                      index === i ? { ...message, bookingPrompt: "declined" as const } : message
                    );
                    setMessages([
                      ...answeredMessages,
                      { role: "ai", text: "No problem. Let me know if you need anything else." }
                    ]);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  No
                </button>
              </div>
            ) : null}
            {m.role === "ai" && m.bookingConfirmed ? (
              <BookingConfirmationMessage message={m.text} appointmentId={m.appointmentId} />
            ) : null}
            {m.role === "ai" && m.doctors && !m.symptomCard ? (
              <DoctorCards
                doctors={m.doctors}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);
                  void handleSend(`I would like to book an appointment with ${doctor.name}.`, undefined, {
                    action: "start_booking",
                    doctor
                  });
                }}
              />
            ) : null}
            {m.role === "ai" && m.bookingStep ? (
              <AppointmentStepPicker
                step={m.bookingStep}
                timeSlots={m.timeSlots}
                onSubmit={(value) => {
                  if (m.bookingStep !== "date" || !selectedDoctor) return;
                  setSelectedDate(value);
                  void handleSend(
                    `My preferred appointment date is ${value}. Please check available times.`,
                    undefined,
                    { action: "check_time_slots", doctor: selectedDoctor, date: value }
                  );
                }}
                onSelectTime={(time) => {
                  if (!selectedDoctor || !selectedDate) return;
                  setMessages((current) => [...current, {
                    role: "ai",
                    text: "Please review your appointment details:",
                    appointmentPreview: { doctor: selectedDoctor, date: selectedDate, time }
                  }]);
                }}
              />
            ) : null}
            {m.role === "ai" && m.appointmentPreview ? (
              <AppointmentConfirmationCard
                doctorName={m.appointmentPreview.doctor.name}
                date={m.appointmentPreview.date}
                time={m.appointmentPreview.time}
                onConfirm={() => {
                  void handleSend(
                    `I confirm the appointment with ${m.appointmentPreview!.doctor.name} on ${m.appointmentPreview!.date} at ${m.appointmentPreview!.time}.`,
                    undefined,
                    {
                      action: "select_time_slot",
                      doctor: m.appointmentPreview!.doctor,
                      date: m.appointmentPreview!.date,
                      time: m.appointmentPreview!.time
                    }
                  );
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Chat bar */}
      <div className="mt-4 shrink-0">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
