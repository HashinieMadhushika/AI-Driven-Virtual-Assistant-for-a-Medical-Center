"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Pill,
  ChevronRight,
  ShieldCheck,
  Clock,
  HeartPulse,
} from "lucide-react";

const HomePage = () => {
  const router = useRouter();
  const [chatbotAnimated, setChatbotAnimated] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setChatbotAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChatbotClick = () => {
    router.push("/chatbot");
  };

  const handleJoinClick = () => {
    router.push("/login");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ type: "success", text: data.message });
        setContactForm({ name: "", email: "", message: "" });
      } else {
        setSubmitMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setSubmitMessage({ 
        type: "error", 
        text: "Failed to send message. Please try again later." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-linear-to-b from-teal-50 to-white text-slate-900"
      style={{ fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}
    >
      <header className="bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-linear-to-br from-teal-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="leading-tight">
              <span className="text-xl font-bold text-slate-800">MediCare AI</span>
              <div className="text-xs text-slate-500">Medical Center Platform</div>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-teal-600">Services</a>
            <a href="#vision" className="hover:text-teal-600">Vision</a>
            <a href="#about" className="hover:text-teal-600">About</a>
            <a href="#contact" className="hover:text-teal-600">Contact us</a>
          </nav>

          <button
            onClick={handleJoinClick}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Join with us
          </button>
        </div>
      </header>

      <main>
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
                  onClick={() => router.push("/chatbot")}
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

        <section id="services" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
              Everything you need for modern care
            </h2>
            <p className="text-center text-slate-600 mb-12">
              From AI chatbot to pharmacy pickups, streamline every visit with confidence.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-linear-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-4">
                  <img
                    src="/images/ai-assistant.png"
                    alt="AI assistant"
                    className="w-7 h-7"
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Health Assistant</h3>
                <p className="text-slate-600">Get quick answers, guidance, and appointment help 24/7.</p>
              </div>

              <div className="bg-linear-to-br from-cyan-50 to-white p-8 rounded-xl border border-cyan-100">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Doctor Appointments</h3>
                <p className="text-slate-600">Book, reschedule, and manage visits in seconds.</p>
              </div>

              <div className="bg-linear-to-br from-sky-50 to-white p-8 rounded-xl border border-sky-100">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-4">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pharmacy Integration</h3>
                <p className="text-slate-600">Coordinate prescriptions, refills, and pickups smoothly.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="vision" className="py-16 bg-linear-to-br from-teal-50 via-cyan-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Our vision</h2>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  We create a seamless healthcare experience by connecting patients with the right care quickly, while supporting providers with intelligent automation.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span className="text-slate-700">Empower patients with clear guidance and next steps</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span className="text-slate-700">Simplify appointment scheduling and reminders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">✓</span>
                    <span className="text-slate-700">Secure records and coordinated pharmacy services</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xl">
                <div className="rounded-xl bg-linear-to-br from-teal-50 to-cyan-50 p-5 border border-teal-100">
                  <p className="text-xs uppercase tracking-wide text-teal-700 font-semibold">Our vision</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    Care that feels effortless for patients and sustainable for teams.
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    We want every patient to feel supported from the first question to the final follow-up. Our
                    platform blends compassionate communication with reliable automation so clinicians can focus
                    on care, not coordination.
                  </p>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-teal-600 font-semibold">01</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Access without friction</p>
                      <p className="text-xs text-slate-500">Clear guidance, fast booking, and proactive reminders.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-teal-600 font-semibold">02</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Care team confidence</p>
                      <p className="text-xs text-slate-500">Unified workflows that reduce noise and handoffs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-teal-600 font-semibold">03</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Trust and transparency</p>
                      <p className="text-xs text-slate-500">Secure, explainable AI that keeps patients informed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  About MediCare AI Center
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  MediCare AI Center unifies scheduling, clinical coordination, and patient communication in one
                  calm, modern workspace. We help clinics reduce admin load while patients get clear, timely
                  guidance before, during, and after every visit.
                </p>
                <div className="space-y-4">
                  <div className="rounded-xl border border-teal-100 bg-linear-to-br from-teal-50 to-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Trusted care teams</h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Credentialed clinicians supported by smart tools for faster handoffs and better follow-up.
                    </p>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-linear-to-br from-teal-50 to-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Responsible AI guidance</h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Patient-friendly explanations, clear next steps, and alerts that keep everyone aligned.
                    </p>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-linear-to-br from-teal-50 to-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Operational clarity</h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Unified calendars, messaging, and pharmacy workflows that reduce delays and missed care.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=600&fit=crop"
                  alt="Healthcare professionals"
                  className="rounded-2xl shadow-2xl border border-black/5"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 bg-linear-to-br from-teal-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Contact us</h2>
            <p className="text-center text-slate-600 mb-12">
              Questions about MediCare AI? We respond within one business day.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Write to us</h3>
                
                {submitMessage && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    submitMessage.type === "success" 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {submitMessage.text}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    placeholder="Message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600 text-center">
                    Or email us directly at:{" "}
                    <a href="mailto:medicareaicenter@gmail.com" className="text-teal-600 hover:text-teal-700 font-medium">
                      medicareaicenter@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white/90 text-slate-900 py-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-slate-800">MediCare AI</span>
              </div>
              <p className="text-slate-500 max-w-md">
                MediCare AI delivers trusted, AI-powered healthcare coordination for patients and clinics.
              </p>
            </div>

            <div className="text-right">
              <h4 className="font-semibold mb-2 text-slate-800">GET IN TOUCH</h4>
              <p className="text-slate-600">123 Healthcare Avenue</p>
              <p className="text-slate-600">Colombo, Sri Lanka</p>
              <p className="text-slate-600 mt-2">medicareaicenter@gmail.com</p>
            </div>
          </div>
        </div>
      </footer>

      <div
        className={`fixed cursor-pointer transition-all duration-1000 ease-out ${
          chatbotAnimated
            ? "bottom-8 right-8 opacity-100"
            : "bottom-0 right-8 opacity-0 translate-y-20"
        }`}
        onClick={handleChatbotClick}
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
    </div>
  );
};

export default HomePage;
