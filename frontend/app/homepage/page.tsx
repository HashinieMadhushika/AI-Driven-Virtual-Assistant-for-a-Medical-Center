"use client";

import React, { useState } from "react";

import ChatbotPopup from "../components/chatbot/ChatbotPopup";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Hero from "./sections/Hero";
import Services from "./sections/Services";
import Vision from "./sections/Vision";
import About from "./sections/About";
import Contact from "./sections/Contact";
import ChatbotButton from "./sections/ChatbotButton";

const HomePage = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-linear-to-b from-teal-50 to-white text-slate-900"
      style={{ fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}
    >
      <ChatbotPopup open={chatbotOpen} setOpen={setChatbotOpen} />

      <Header />

      <main className="pb-16">
        <Hero onOpenChat={() => setChatbotOpen(true)} />
        <Services />
        <Vision />
        <About />
        <Contact />
      </main>

      <Footer />

      <ChatbotButton onClick={() => setChatbotOpen(true)} />
    </div>
  );
};

export default HomePage;
