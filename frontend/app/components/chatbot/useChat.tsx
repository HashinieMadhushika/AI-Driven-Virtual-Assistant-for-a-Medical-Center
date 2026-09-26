"use client";

import { useState } from "react";

export type Message = {
  role: "ai" | "user";
  text: string;
  time: string;
};

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function useChat(greeting: string) {
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: "ai", text: greeting, time: now() },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", text: t, time: now() }]);
    setIsTyping(true);

    // Placeholder reply until the backend AI is connected
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Thanks! I received your message. (Next: connect backend AI)",
          time: now(),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return { messages, isTyping, send };
}
