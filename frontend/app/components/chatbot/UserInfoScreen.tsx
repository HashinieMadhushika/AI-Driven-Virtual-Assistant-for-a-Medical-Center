"use client";
import { useState } from "react";
import { User, Mail, ArrowRight, Lock } from "lucide-react";

interface Props {
  onNext: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserInfoScreen({ onNext }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameError = name.trim() ? "" : "Please enter your name";
  const emailError = !email.trim()
    ? "Please enter your email address"
    : EMAIL_PATTERN.test(email.trim())
      ? ""
      : "Please enter a valid email address";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || emailError) return;
    onNext();
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-4 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-teal-500 focus:ring-teal-100"
    }`;

  return (
    <div className="min-h-full flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-md rounded-3xl border border-teal-100 bg-white/90 px-6 py-5 sm:px-8 sm:py-6 shadow-xl shadow-teal-900/5"
      >
        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto -mt-2 mb-2 w-12 h-12 rounded-2xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
            <User className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Let&apos;s get to know you
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            So we can personalise your care and send you updates.
          </p>
        </div>

        {/* Name */}
        <div className="mt-5">
          <label htmlFor="chat-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input
              id="chat-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Kasun Perera"
              className={inputClass(submitted && !!nameError)}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {submitted && nameError && (
            <p className="mt-1.5 text-xs text-red-600">{nameError}</p>
          )}
        </div>

        {/* Email */}
        <div className="mt-4">
          <label htmlFor="chat-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input
              id="chat-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass(submitted && !!emailError)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {submitted && emailError && (
            <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="group mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2 font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
        >
          Start Chat
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Privacy note */}
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          Your details are kept private and never shared.
        </p>
      </form>
    </div>
  );
}
