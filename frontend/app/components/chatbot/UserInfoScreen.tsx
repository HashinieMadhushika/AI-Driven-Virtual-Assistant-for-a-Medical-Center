"use client";
import { useState } from "react";

interface Props {
  onNext: () => void;
}

export default function UserInfoScreen({ onNext }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-teal-700 text-center pt-20">
        Enter Your Details
      </h2>

      <div className="ml-65 space-y-6">
      <h1>Enter Your Name</h1>
      <input
        type="text"
        placeholder="Name"
        className="w-100 p-2 rounded-xl border focus:outline-teal-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <h1>Enter Your Email Address</h1>
      <input
        type="email"
        placeholder="Email Address"
        className="w-100 p-2 rounded-xl border focus:outline-teal-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      </div>

      <button
        onClick={onNext}
        className="w-50 mt-10 text-center ml-90 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition"
      >
        Start Chat
      </button>
    </div>
  );
}