"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, Clock, HeartPulse } from "lucide-react";

type HeroProps = {
  onOpenChat: () => void;
};

const Hero = ({ onOpenChat }: HeroProps) => {
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-800 text-xs font-semibold">
            <img
              src="/images/ai-assistant.png"
              alt="AI assistant"
              className="w-4 h-4"
            /> AI-first medical operations
          </div>
          <h1 className="mt-6 text-4xl font-extrabold text-slate-900 leading-tight">
            A seamless care hub for admins, doctors, and AI-led patient journeys.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Centralize appointments, calendars, and pharmacy workflows while the AI assistant handles patient requests end-to-end.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onOpenChat}
              className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Talk to the AI Assistant
            </button>
            <button
              onClick={() => router.push("/login")}
              className="border border-black/10 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
              Access Your Portal
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Role-based access control
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              Real-time scheduling
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-700" />
              AI-guided patient intake
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-black/5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <img
                  src="/images/ai-assistant.png"
                  alt="AI assistant"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">AI Assistant</h3>
                <p className="text-sm text-slate-500">Always available</p>
              </div>
              <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Online</span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-100 rounded-lg p-4">
                <p className="text-slate-700 text-sm">Hello! How can I help you today?</p>
              </div>
              <div className="bg-teal-600 text-white rounded-lg p-4 ml-auto max-w-xs">
                <p className="text-sm">I need to book an appointment</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-4">
                <p className="text-slate-700 text-sm">What type of doctor would you like to see?</p>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
