import React from "react";
import { Calendar, Pill } from "lucide-react";

const Services = () => {
  return (
    <section id="services" className="scroll-mt-20 bg-white py-16">
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
  );
};

export default Services;
