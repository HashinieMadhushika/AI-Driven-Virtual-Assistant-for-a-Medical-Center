import React from "react";

const About = () => {
  return (
    <section id="about" className="scroll-mt-20 py-16 bg-white">
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
  );
};

export default About;
