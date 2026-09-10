// import FeatureCard from "./FeatureCard";
// import ChatInput from "./ChatInput";
// import { CalendarCheck, Stethoscope, FileText } from "lucide-react";

// interface Props {
//   onSelect: (feature: string) => void;
// }

// export default function FeatureSelectionScreen({ onSelect }: Props) {
//   return (
//     <div className="flex flex-col h-full">
//       {/* Title */}
//       <h2 className="text-xl font-bold text-teal-700 text-center mb-4">
//         How can I help you?
//       </h2>

//       {/* Cards Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <FeatureCard
//           title="Book Appointment"
//           description="Schedule visit with specialist"
//           icon={<CalendarCheck className="w-5 h-5" />}
//           onClick={() => onSelect("Book Appointment")}
//         />

//         <FeatureCard
//           title="Find Doctor"
//           description="Search by specialization"
//           icon={<Stethoscope className="w-5 h-5" />}
//           onClick={() => onSelect("Find Doctor")}
//         />

//         <FeatureCard
//           title="Check Report"
//           description="Access medical reports"
//           icon={<FileText className="w-5 h-5" />}
//           onClick={() => onSelect("Check Report")}
//         />
//       </div>

//       {/* Spacer */}
//       <div className="flex-1" />

//       {/* Chat Bar */}
//       <div className="pt-4">
//         <ChatInput />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import FeatureCard from "./FeatureCard";
import ChatInput from "./ChatInput";
import { CalendarCheck, Stethoscope, FileText } from "lucide-react";

interface Props {
  onSelect: (feature: string) => void;
}

export default function FeatureSelectionScreen({ onSelect }: Props) {
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string }[]
  >([
    { role: "ai", text: "Hi! You can ask me anything, or choose one option above." },
  ]);

  const handleSend = (text: string) => {
    const t = text.trim();
    if (!t) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: t },
      { role: "ai", text: "Thanks! I received your message. (Next: connect backend AI)" },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
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
      <div className="flex-1 mt-4 bg-white rounded-2xl border border-slate-200 shadow-inner p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm px-4 py-2 rounded-xl max-w-[80%] ${
              m.role === "ai"
                ? "bg-teal-100 text-slate-800"
                : "bg-teal-600 text-white ml-auto"
            }`}
          >
            {m.role === "ai" ? `AI: ${m.text}` : m.text}
          </div>
        ))}
      </div>

      {/* Chat bar */}
      <div className="mt-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}