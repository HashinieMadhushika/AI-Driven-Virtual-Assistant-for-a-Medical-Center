"use client";
import { useState } from "react";
import { User, Mail } from "lucide-react";

interface Props {
  onNext: (visitor: Visitor, previousChat: PreviousChat | null) => void;
}

type Visitor = { firstName: string; email: string };

export type PreviousChat = {
  sessionId: string;
  messages: Array<{ role: "assistant" | "user"; content: string }>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserInfoScreen({ onNext }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const nameError = name.trim() ? "" : "Please enter your name";
  const emailError = !email.trim()
    ? "Please enter your email address"
    : EMAIL_PATTERN.test(email.trim())
      ? ""
      : "Please enter a valid email address";

  const requestVerificationCode = async () => {
    if (nameError || emailError || isLoading) return;
    setIsLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-code",
          firstName: name.trim(),
          email: email.trim().toLowerCase()
        })
      });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not send a verification code.");
      setVerificationSent(true);
      setNotice(data.message ?? "Check your email for a verification code.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send a verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || emailError) return;
    void requestVerificationCode();
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (verificationCode.length !== 6 || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-code",
          firstName: name.trim(),
          email: email.trim().toLowerCase(),
          code: verificationCode
        })
      });
      const data = await response.json() as { history?: PreviousChat | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "That code is invalid or expired.");
      onNext(
        { firstName: name.trim(), email: email.trim().toLowerCase() },
        data.history ?? null
      );
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "Could not verify that code.");
    } finally {
      setIsLoading(false);
    }
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
        onSubmit={verificationSent ? handleVerify : handleSubmit}
        noValidate
        className="max-w-md rounded-3xl border border-teal-100 bg-white/90 px-6 py-5 sm:px-8 sm:py-6 shadow-xl shadow-teal-900/5"
      >
        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto -mt-2 mb-2 w-12 h-12 rounded-2xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
            <User className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {verificationSent ? "Verify your email" : "Let&apos;s get to know you"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {verificationSent
              ? "Enter the six-digit code we sent to your email to continue."
              : "Verify your email to continue and securely restore your previous chat."}
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
              disabled={verificationSent || isLoading}
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
              disabled={verificationSent || isLoading}
              className={inputClass(submitted && !!emailError)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {submitted && emailError && (
            <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
          )}
        </div>

        {verificationSent ? (
          <div className="mt-4">
            <label htmlFor="chat-verification-code" className="mb-1.5 block text-sm font-medium text-slate-700">
              Verification code
            </label>
            <input
              id="chat-verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm tracking-[0.3em] text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
        ) : null}

        {notice ? <p className="mt-3 text-sm text-emerald-700" role="status">{notice}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          {verificationSent ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setVerificationSent(false);
                setVerificationCode("");
                setNotice("");
                setError("");
              }}
              className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-teal-700"
            >
              Change details
            </button>
          ) : <span />}
          <button
            type="submit"
            disabled={isLoading || (verificationSent && verificationCode.length !== 6)}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Please wait..."
              : verificationSent
                ? "Verify and continue"
                : "Send verification code"}
          </button>
        </div>
      </form>
    </div>
  );
}
