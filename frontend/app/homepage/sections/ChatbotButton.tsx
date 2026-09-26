"use client";

import React, { useEffect, useState } from "react";

type ChatbotButtonProps = {
  onClick: () => void;
};

const ChatbotButton = ({ onClick }: ChatbotButtonProps) => {
  const [chatbotAnimated, setChatbotAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChatbotAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed cursor-pointer transition-all duration-1000 ease-out ${
        chatbotAnimated
          ? "bottom-20 right-8 opacity-100"
          : "bottom-0 right-8 opacity-0 translate-y-20"
      }`}
      onClick={onClick}
    >
      <div className="relative group">
        <div className="w-16 h-16 bg-linear-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
          <img
            src="/images/ai-assistant.png"
            alt="AI assistant"
            className="w-14 h-14"
          />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />

        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with AI Assistant
        </div>
      </div>
    </div>
  );
};

export default ChatbotButton;
