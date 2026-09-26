"use client";

import { useState } from "react";
import { Paperclip, Mic, SendHorizontal } from "lucide-react";

type Props = {
  onSend?: (text: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [text, setText] = useState("");
  const canSend = !!onSend && !disabled && text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 pl-2 shadow-sm transition focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-100">
      <button
        type="button"
        className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
        aria-label="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        type="text"
        placeholder="Type your message..."
        className="flex-1 min-w-0 bg-transparent px-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
      />

      <button
        type="button"
        className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
        aria-label="Voice input"
      >
        <Mic className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        aria-label="Send message"
      >
        <SendHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
