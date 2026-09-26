"use client";

import { useEffect, useRef } from "react";
import type { Message } from "./useChat";

interface Props {
  messages: Message[];
  isTyping: boolean;
  suggestions?: string[];
  onSuggestion?: (text: string) => void;
}

function BotAvatar() {
  return (
    <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
      <img src="/images/ai-assistant.png" alt="" className="w-6 h-6" />
    </div>
  );
}

export default function ChatMessages({ messages, isTyping, suggestions, onSuggestion }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const showSuggestions = !!suggestions?.length && messages.length === 1 && !isTyping;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white/80 p-4 overflow-y-auto space-y-4 [scrollbar-width:thin]">
      {messages.map((m, i) =>
        m.role === "ai" ? (
          <div key={i} className="flex items-end gap-2 max-w-[85%]">
            <BotAvatar />
            <div>
              <div className="rounded-2xl rounded-bl-sm bg-teal-50 border border-teal-100 px-4 py-2.5 text-sm text-slate-800">
                {m.text}
              </div>
              <p className="mt-1 ml-1 text-[11px] text-slate-400">{m.time}</p>
            </div>
          </div>
        ) : (
          <div key={i} className="flex flex-col items-end ml-auto max-w-[85%]">
            <div className="rounded-2xl rounded-br-sm bg-teal-600 px-4 py-2.5 text-sm text-white shadow-sm">
              {m.text}
            </div>
            <p className="mt-1 mr-1 text-[11px] text-slate-400">{m.time}</p>
          </div>
        )
      )}

      {/* Suggested questions (only before the user writes anything) */}
      {showSuggestions && (
        <div className="pl-10 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion?.(s)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-end gap-2">
          <BotAvatar />
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-teal-50 border border-teal-100 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
