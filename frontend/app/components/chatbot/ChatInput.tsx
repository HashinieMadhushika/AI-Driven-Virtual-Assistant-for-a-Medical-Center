"use client";

import { useRef, useState } from "react";
import { Paperclip, Mic, Send } from "lucide-react";

type Props = {
  onSend?: (text: string, image?: File) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (disabled || !onSend || (!text.trim() && !image)) return;
    onSend(text, image);
    setText("");
    setImage(undefined);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {image ? (
        <div className="mb-2 flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <span className="truncate text-slate-700">Image: {image.name}</span>
          <button
            type="button"
            onClick={() => {
              setImage(undefined);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="ml-3 text-slate-500 hover:text-rose-600"
            aria-label="Remove attached image"
          >
            Remove
          </button>
        </div>
      ) : null}
      {error ? <p className="mb-2 text-xs text-rose-600">{error}</p> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Choose an image"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (!selected) return;
          if (!selected.type.startsWith("image/")) {
            setError("Choose an image file.");
            event.target.value = "";
            return;
          }
          if (selected.size > 10 * 1024 * 1024) {
            setError("Image must be 10 MB or smaller.");
            event.target.value = "";
            return;
          }
          setError("");
          setImage(selected);
        }}
      />
      <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 shadow">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-slate-500 hover:text-teal-700 transition"
        aria-label="Attach image"
        title="Attach image"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
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
        disabled={disabled || !onSend || (!text.trim() && !image)}
        className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
      </div>
    </div>
  );
}
