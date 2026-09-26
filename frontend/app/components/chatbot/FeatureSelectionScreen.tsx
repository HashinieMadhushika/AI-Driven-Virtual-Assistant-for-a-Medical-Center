"use client";

import FeatureCard from "./FeatureCard";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { useChat } from "./useChat";
import { CalendarCheck, Stethoscope, FileText } from "lucide-react";

interface Props {
  onSelect: (feature: string) => void;
}

const features = [
  {
    title: "Book Appointment",
    description: "Schedule a visit with a specialist",
    icon: CalendarCheck,
  },
  {
    title: "Find Doctor",
    description: "Search by specialization",
    icon: Stethoscope,
  },
  {
    title: "Check Report",
    description: "Access your medical reports",
    icon: FileText,
  },
];

const suggestions = [
  "What are your opening hours?",
  "Which doctors are available today?",
  "How do I get my lab results?",
];

export default function FeatureSelectionScreen({ onSelect }: Props) {
  const { messages, isTyping, send } = useChat(
    "Hi! 👋 I'm your MediCare assistant. Ask me anything, or pick one of the options above to get started."
  );

  const hasConversation = messages.length > 1;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Feature options: full cards at the start, compact chips once chatting */}
      {hasConversation ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {features.map(({ title, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => onSelect(title)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-50 hover:border-teal-300"
            >
              <Icon className="w-3.5 h-3.5" />
              {title}
            </button>
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-3">
            How can I <span className="text-teal-600">help</span> you today?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {features.map(({ title, description, icon: Icon }) => (
              <FeatureCard
                key={title}
                title={title}
                description={description}
                icon={<Icon className="w-5 h-5" />}
                onClick={() => onSelect(title)}
              />
            ))}
          </div>
        </>
      )}

      {/* Conversation */}
      <div className="flex-1 min-h-0 mt-3 flex flex-col">
        <ChatMessages
          messages={messages}
          isTyping={isTyping}
          suggestions={suggestions}
          onSuggestion={send}
        />
      </div>

      {/* Chat bar */}
      <div className="mt-3">
        <ChatInput onSend={send} disabled={isTyping} />
      </div>
    </div>
  );
}
