"use client";

import React, { useState } from "react";

import ChatbotPopup from "./components/chatbot/ChatbotPopup";
import Header from "./homepage/header/Header";
import Footer from "./homepage/footer/Footer";
import Hero from "./homepage/sections/Hero";
import Services from "./homepage/sections/Services";
import Vision from "./homepage/sections/Vision";
import About from "./homepage/sections/About";
import Contact from "./homepage/sections/Contact";
import ChatbotButton from "./homepage/sections/ChatbotButton";

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
