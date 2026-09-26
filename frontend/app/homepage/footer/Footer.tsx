import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur text-slate-900 py-3 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-teal-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-slate-800">MediCare AI</span>
          <span className="hidden md:inline text-slate-500">· AI-powered healthcare coordination</span>
        </div>
        <div className="text-slate-600">
          Healthcare Avenue, Colombo, Sri Lanka ·{" "}
          <a href="mailto:medicareaicenter@gmail.com" className="hover:text-teal-600">medicareaicenter@gmail.com</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
