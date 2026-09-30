// import ChatInput from "./ChatInput";

// interface Props {
//   feature: string;
// }

// export default function ChatScreen({ feature }: Props) {
//   return (
//     <div className="flex flex-col h-full">
//       <h2 className="text-xl font-bold text-teal-700 mb-4">
//         {feature}
//       </h2>

//       <div className="flex-1 bg-white rounded-2xl p-4 shadow-inner overflow-y-auto space-y-3">
//         <div className="bg-teal-100 text-sm p-2 rounded-lg w-fit max-w-[80%]">
//           AI: How can I assist you with {feature}?
//         </div>
//       </div>

//       <div className="mt-4">
//         <ChatInput />
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import ChatInput from "./ChatInput";
import { ArrowLeft } from "lucide-react";
import DoctorCards, { type Doctor } from "./DoctorCards";
import AppointmentStepPicker from "./AppointmentStepPicker";
import AppointmentConfirmationCard from "./AppointmentConfirmationCard";
import BookingConfirmationMessage from "./BookingConfirmationMessage";
import SymptomAnalysisCard, { type SymptomCardData } from "./SymptomAnalysisCard";

type BookingStep = "date" | "time" | "patient" | "none";
type BookingAction = "start_booking" | "check_time_slots" | "select_time_slot";

interface Props {
  feature: string;
  onBack: () => void;
  visitor: { firstName: string; email: string };
}

export default function ChatScreen({ feature, onBack, visitor }: Props) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<{
    role: "ai" | "user";
    text: string;
    imageName?: string;
    doctors?: Doctor[];
    bookingStep?: BookingStep;
    timeSlots?: Array<string | { label: string; booked?: boolean }>;
    appointmentPreview?: { doctor: Doctor; date: string; time: string };
    bookingConfirmed?: boolean;
    appointmentId?: string | number;
    historySaved?: boolean;
    symptomCard?: SymptomCardData;
  }[]>([
    { role: "ai", text: `How can I assist you with ${feature}?` }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const handleSend = async (
    text: string,
    image?: File,
    booking?: { action: BookingAction; doctor: Doctor; date?: string; time?: string }
  ) => {
    const trimmedText = text.trim();
    if ((!trimmedText && !image) || isSending) return;
    const messageText = trimmedText || "Please analyze the attached image.";

    const nextMessages = [...messages, {
      role: "user" as const,
      text: messageText,
      imageName: image?.name
    }];
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
        historySaved?: boolean;
        symptomCard?: SymptomCardData;
      };
      if (!response.ok || !data.reply) throw new Error("Chat request failed");
      const startsDoctorBooking = booking?.action === "start_booking";
      setMessages((current) => [...current, {
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
        symptomCard: data.symptomCard
      }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "ai", text: "I could not connect right now. Please try again." }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* Header with Back */}
      <div className="flex items-center gap-3 mb-4">

        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50"
          aria-label="Back to options"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-teal-700">
          {feature}
        </h2>

      </div>

      {/* Chat Area */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-inner space-y-3">

        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto flex max-w-[80%] justify-end" : "max-w-full"}>
            {message.role === "ai" && message.symptomCard ? (
              <SymptomAnalysisCard
                analysis={message.symptomCard}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);
                  void handleSend(`I would like to book an appointment with ${doctor.name}.`, undefined, {
                    action: "start_booking",
                    doctor
                  });
                }}
              />
            ) : null}
            {!message.bookingConfirmed && !message.symptomCard ? <div className={`w-fit max-w-full rounded-lg px-4 py-2 text-sm ${
              message.role === "ai" ? "bg-teal-100 text-slate-800" : "bg-teal-600 text-white"
            }`}>
              {message.role === "ai" ? `AI: ${message.text}` : (
                <>
                  {message.text}
                  {message.imageName ? <div className="mt-1 text-xs opacity-80">Image: {message.imageName}</div> : null}
                </>
              )}
            </div> : null}
            {message.role === "ai" && message.historySaved === false ? (
              <p className="mt-1 text-xs text-amber-700" role="status">
                This chat could not be saved. Your previous conversation may not be available next time.
              </p>
            ) : null}
            {message.role === "ai" && message.bookingConfirmed ? (
              <BookingConfirmationMessage message={message.text} appointmentId={message.appointmentId} />
            ) : null}
            {message.role === "ai" && message.doctors && !message.symptomCard ? (
              <DoctorCards
                doctors={message.doctors}
                onBook={(doctor) => {
                  setSelectedDoctor(doctor);
                  void handleSend(`I would like to book an appointment with ${doctor.name}.`, undefined, {
                    action: "start_booking",
                    doctor
                  });
                }}
              />
            ) : null}
            {message.role === "ai" && message.bookingStep ? (
              <AppointmentStepPicker
                step={message.bookingStep}
                timeSlots={message.timeSlots}
                onSubmit={(value) => {
                  if (message.bookingStep !== "date" || !selectedDoctor) return;
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
            {message.role === "ai" && message.appointmentPreview ? (
              <AppointmentConfirmationCard
                doctorName={message.appointmentPreview.doctor.name}
                date={message.appointmentPreview.date}
                time={message.appointmentPreview.time}
                onConfirm={() => {
                  void handleSend(
                    `I confirm the appointment with ${message.appointmentPreview!.doctor.name} on ${message.appointmentPreview!.date} at ${message.appointmentPreview!.time}.`,
                    undefined,
                    {
                      action: "select_time_slot",
                      doctor: message.appointmentPreview!.doctor,
                      date: message.appointmentPreview!.date,
                      time: message.appointmentPreview!.time
                    }
                  );
                }}
              />
            ) : null}
          </div>
        ))}

      </div>

      {/* Chat Input */}
      <div className="mt-4 shrink-0">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
