import React from "react";

const Vision = () => {
  return (
    <section id="vision" className="scroll-mt-20 py-16 bg-linear-to-br from-teal-50 via-cyan-50 to-white">
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
  );
};

export default Vision;
