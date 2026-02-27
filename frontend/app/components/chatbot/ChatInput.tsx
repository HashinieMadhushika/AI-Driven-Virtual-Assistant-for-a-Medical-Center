// "use client";

// import { FaMicrophone, FaPaperclip, FaPaperPlane } from "react-icons/fa";

// export default function ChatInput() {
//   return (
//     <div className="flex items-center gap-2 mt-3 border rounded-full px-3 py-2 bg-white shadow">
//       <FaPaperclip className="text-gray-500 cursor-pointer" />
//       <input
//         type="text"
//         placeholder="Type a message..."
//         className="flex-1 outline-none text-sm"
//       />
//       <FaMicrophone className="text-teal-600 cursor-pointer" />
//       <FaPaperPlane className="text-emerald-600 cursor-pointer" />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Paperclip, Mic, Send } from "lucide-react";

type Props = {
  onSend?: (text: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!onSend) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 border border-slate-300 rounded-full px-3 py-2 bg-white shadow">
      <button
        type="button"
        className="text-slate-500 hover:text-teal-700 transition"
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
        placeholder="Type a message..."
        className="flex-1 outline-none text-sm"
      />

      <button
        type="button"
        className="text-teal-700 hover:text-teal-800 transition"
        aria-label="Voice"
      >
        <Mic className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleSend}
        className="text-emerald-700 hover:text-emerald-800 transition"
        aria-label="Send"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}