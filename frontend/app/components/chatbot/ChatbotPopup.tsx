"use client";

import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

import WelcomeScreen from "./WelcomeScreen";
import UserInfoScreen from "./UserInfoScreen";
import FeatureSelectionScreen from "./FeatureSelectionScreen";
import ChatScreen from "./ChatScreen";

type Screen = "welcome" | "userinfo" | "features" | "chat";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type Visitor = {
  firstName: string;
  email: string;
};

export default function ChatbotPopup({ open, setOpen }: Props) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [visitor, setVisitor] = useState<Visitor>({ firstName: "", email: "" });

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    setScreen("welcome");
    setSelectedFeature("");
  };

  return (
    <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 z-50">
      <div className="w-full sm:w-[900px] sm:max-w-[calc(100vw-3rem)] h-[80vh] max-h-[min(740px,calc(100vh_-_6rem))] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <img
                src="/images/ai-assistant.png"
                alt=""
                className="w-7 h-7"
              />
            </div>
            <div className="leading-tight">
              <h2 className="font-semibold">MediCare AI Assistant</h2>
              <p className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                Online · Usually replies instantly
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/20 transition"
            aria-label="Close chatbot"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
          {screen === "welcome" && (
            <WelcomeScreen onNext={() => setScreen("userinfo")} />
          )}

          {screen === "userinfo" && (
            <UserInfoScreen
              onNext={(details) => {
                setVisitor(details);
                setScreen("features");
              }}
            />
          )}

          {screen === "features" && (
            <FeatureSelectionScreen
              visitor={visitor}
              onSelect={(feature) => {
                setSelectedFeature(feature);
                setScreen("chat");
              }}
            />
          )}

          {screen === "chat" && (
            <ChatScreen
              feature={selectedFeature}
              visitor={visitor}
              onBack={() => setScreen("features")}
            />
          )}
        </div>
      </div>
    </div>
  );
}