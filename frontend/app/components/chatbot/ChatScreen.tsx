import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { useChat } from "./useChat";
import {
  ArrowLeft,
  CalendarCheck,
  Stethoscope,
  FileText,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

interface Props {
  feature: string;
  onBack: () => void;
}

type FeatureConfig = {
  icon: LucideIcon;
  subtitle: string;
  greeting: string;
  suggestions: string[];
};

const featureConfig: Record<string, FeatureConfig> = {
  "Book Appointment": {
    icon: CalendarCheck,
    subtitle: "Schedule a visit with a specialist",
    greeting:
      "I can help you book an appointment. 📅 Which specialty or doctor would you like to see, and when suits you?",
    suggestions: [
      "Book with a cardiologist",
      "Earliest available slot",
      "Reschedule my appointment",
    ],
  },
  "Find Doctor": {
    icon: Stethoscope,
    subtitle: "Search by specialization or symptoms",
    greeting:
      "Let's find the right doctor for you. 🩺 Tell me a specialty, a doctor's name, or describe your symptoms.",
    suggestions: [
      "Show all pediatricians",
      "Doctors available today",
      "I have a skin rash",
    ],
  },
  "Check Report": {
    icon: FileText,
    subtitle: "Access your medical reports",
    greeting:
      "I can help you check your medical reports. 📄 Please share your report reference number, or ask me a question.",
    suggestions: [
      "Are my blood test results ready?",
      "How do I download my report?",
      "Explain my latest report",
    ],
  },
};

const fallbackConfig: FeatureConfig = {
  icon: MessageCircle,
  subtitle: "MediCare AI Assistant",
  greeting: "How can I help you today?",
  suggestions: [],
};

export default function ChatScreen({ feature, onBack }: Props) {
  const config = featureConfig[feature] ?? fallbackConfig;
  const Icon = config.icon;
  const { messages, isTyping, send } = useChat(config.greeting);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50"
          aria-label="Back to options"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {feature}
          </h2>
          <p className="text-xs text-slate-500 truncate">{config.subtitle}</p>
        </div>
      </div>

      {/* Conversation */}
      <ChatMessages
        messages={messages}
        isTyping={isTyping}
        suggestions={config.suggestions}
        onSuggestion={send}
      />

      {/* Chat input */}
      <div className="mt-3">
        <ChatInput onSend={send} disabled={isTyping} />
      </div>
    </div>
  );
}
