"use client";

import FeatureCard from "./FeatureCard";
import ChatInput from "./ChatInput";
import { useState } from "react";
import { CalendarCheck, Stethoscope, FileText } from "lucide-react";
import DoctorCards, { type Doctor } from "./DoctorCards";
import AppointmentStepPicker from "./AppointmentStepPicker";
import AppointmentConfirmationCard from "./AppointmentConfirmationCard";
import BookingConfirmationMessage from "./BookingConfirmationMessage";

type BookingStep = "date" | "time" | "patient" | "none";
type BookingAction = "start_booking" | "check_time_slots" | "select_time_slot";

interface Props {
  onSelect: (feature: string) => void;
  visitor: { firstName: string; email: string };
}

export default function FeatureSelectionScreen({ onSelect, visitor }: Props) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isSending, setIsSending] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [messages, setMessages] = useState<
    {
      role: "ai" | "user";
      text: string;
      imageName?: string;
      doctors?: Doctor[];
      bookingStep?: BookingStep;
      timeSlots?: Array<string | { label: string; booked?: boolean }>;
      appointmentPreview?: { doctor: Doctor; date: string; time: string };
      bookingConfirmed?: boolean;
      appointmentId?: string | number;
    }[]
  >([
    { role: "ai", text: "Hi! You can ask me anything, or choose one option above." },
  ]);

  const handleSend = async (
    text: string,
    image?: File,
    booking?: { action: BookingAction; doctor: Doctor; date?: string; time?: string }
  ) => {
    const t = text.trim();
    if ((!t && !image) || isSending) return;
    const messageText = t || "Please analyze the attached image.";

    const nextMessages = [
      ...messages,
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
        reply?: string;
        doctors?: Doctor[];
        bookingStep?: BookingStep;
        timeSlots?: Array<string | { label: string; booked?: boolean }>;
        bookingConfirmed?: boolean;
        appointmentId?: string | number;
      };
      if (!response.ok || !data.reply) throw new Error("Chat request failed");
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
        appointmentId: data.appointmentId
      }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I could not connect right now. Please try again." }
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
          onClick={() => onSelect("Book Appointment")}
        />
        <FeatureCard
          title="Find Doctor"
          description="Search by specialization"
          icon={<Stethoscope className="w-5 h-5" />}
          onClick={() => onSelect("Find Doctor")}
        />
        <FeatureCard
          title="Check Report"
          description="Access medical reports"
          icon={<FileText className="w-5 h-5" />}
          onClick={() => onSelect("Check Report")}
        />
      </div>

      {/* Chat terminal area */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-inner space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto max-w-[80%]" : "max-w-full"}>
            {!m.bookingConfirmed ? <div className={`w-fit max-w-full rounded-xl px-4 py-2 text-sm ${
              m.role === "ai" ? "bg-teal-100 text-slate-800" : "bg-teal-600 text-white"
            }`}>
              {m.role === "ai" ? `AI: ${m.text}` : (
                <>
                  {m.text}
                  {m.imageName ? <div className="mt-1 text-xs opacity-80">Image: {m.imageName}</div> : null}
                </>
              )}
            </div> : null}
            {m.role === "ai" && m.bookingConfirmed ? (
              <BookingConfirmationMessage message={m.text} appointmentId={m.appointmentId} />
            ) : null}
            {m.role === "ai" && m.doctors ? (
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
