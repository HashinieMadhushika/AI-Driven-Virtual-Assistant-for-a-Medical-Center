"use client";

import React, { useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

type SubmitMessage = {
  type: "success" | "error";
  text: string;
};

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch(`${API}/api/contact`, {
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
    <section id="contact" className="scroll-mt-20 py-16 bg-linear-to-br from-teal-50 to-cyan-50">
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
  );
};

export default Contact;
