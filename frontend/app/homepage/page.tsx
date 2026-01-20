// "use client";

// import React, { useState, useEffect } from 'react';
// import { MessageCircle, Calendar, UserPlus, Pill, ChevronRight } from 'lucide-react';

// const homepage = () => {
//   const [chatbotVisible, setChatbotVisible] = useState(false);
//   const [chatbotAnimated, setChatbotAnimated] = useState(false);

//   useEffect(() => {
//     // Trigger chatbot float animation after component mounts
//     const timer = setTimeout(() => {
//       setChatbotAnimated(true);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleChatbotClick = () => {
//     // Navigate to chatbot page (blank for now)
//     window.location.href = '/chatbot';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-lg">M</span>
//             </div>
//             <span className="text-xl font-bold text-gray-800">MediCare AI</span>
//           </div>
//           <nav className="hidden md:flex space-x-8">
//             <a href="#" className="text-gray-600 hover:text-teal-600">Contact us</a>
//           </nav>
//           <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
//             Join with us
//           </button>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="grid md:grid-cols-2 gap-12 items-center">
//           <div>
//             <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
//               Your AI Health Assistant for Simplified Care
//             </h1>
//             <p className="text-gray-600 text-lg mb-8">
//               From doctor appointments to pharmacy pickups, streamline your healthcare journey with the power of intelligent AI.
//             </p>
//             <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
//               Create an Account
//             </button>
//           </div>
          
//           {/* Chat Interface Preview */}
//           <div className="relative">
//             <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
//               <div className="flex items-center space-x-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
//                   <MessageCircle className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-800">AI Assistant</h3>
//                   <p className="text-sm text-gray-500">Always here to help</p>
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 <div className="bg-gray-100 rounded-lg p-4">
//                   <p className="text-gray-700 text-sm">Hello! How can I help you today?</p>
//                 </div>
//                 <div className="bg-teal-500 text-white rounded-lg p-4 ml-auto max-w-xs">
//                   <p className="text-sm">I need to book an appointment</p>
//                 </div>
//                 <div className="bg-gray-100 rounded-lg p-4">
//                   <p className="text-gray-700 text-sm">I can help you schedule an appointment. What type of doctor would you like to see?</p>
//                 </div>
//               </div>
              
//               <div className="mt-6 flex items-center space-x-2">
//                 <input 
//                   type="text" 
//                   placeholder="Type your message..." 
//                   className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 />
//                 <button className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 transition-colors">
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="bg-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
//             Everything you need for modern care
//           </h2>
//           <p className="text-center text-gray-600 mb-12">
//             From AI chatbot to pharmacy pickups, streamline your healthcare journey
//           </p>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100">
//               <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mb-4">
//                 <MessageCircle className="w-6 h-6 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Health Assistant</h3>
//               <p className="text-gray-600">Get instant answers to your health questions with our intelligent AI assistant</p>
//             </div>
            
//             <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
//               <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
//                 <Calendar className="w-6 h-6 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Appointment</h3>
//               <p className="text-gray-600">Book appointments with healthcare professionals quickly and easily</p>
//             </div>
            
//             <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border border-purple-100">
//               <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
//                 <Pill className="w-6 h-6 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">Pharmacy Integration</h3>
//               <p className="text-gray-600">Manage prescriptions and connect with pharmacies seamlessly</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Vision Section */}
//       <section className="py-16 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-2 gap-12 items-center">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-6">Our vision</h2>
//               <p className="text-gray-700 mb-6 leading-relaxed">
//                 Our mission is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers by leveraging AI and smart tools. Our tools make appointments easier, prescriptions smoother, and healthcare more accessible—helping everyone manage their health with clarity.
//               </p>
              
//               <ul className="space-y-3">
//                 <li className="flex items-start">
//                   <span className="text-teal-500 mr-2">✓</span>
//                   <span className="text-gray-700">Empower patients with understandable insights</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-teal-500 mr-2">✓</span>
//                   <span className="text-gray-700">Simplify appointment scheduling and management</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-teal-500 mr-2">✓</span>
//                   <span className="text-gray-700">Secure, transparent records and pharmacy integration</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div className="relative">
//               <img 
//                 src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop" 
//                 alt="Healthcare professionals" 
//                 className="rounded-2xl shadow-2xl"
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* About Section */}
//       <section className="py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
//             About MediCare AI Center
//           </h2>
//           <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
//             Welcome to MediCare AI, your trusted partner in revolutionizing healthcare management. Our platform combines cutting-edge artificial intelligence with user-friendly design to provide a comprehensive healthcare companion that works with you at every step. MediCare AI Smart centralizes comprehensive care with comfort at home you.
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-8">
//             <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100">
//               <h3 className="text-xl font-semibold text-gray-900 mb-3">Trusted Clinicians</h3>
//               <p className="text-gray-600">
//                 Meet certified doctors and healthcare providers ready to serve when you need expert medical guidance most.
//               </p>
//             </div>
            
//             <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
//               <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Driven Insights</h3>
//               <p className="text-gray-600">
//                 Get quick answers to health questions and symptom checking powered by advanced artificial intelligence.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Contact Section */}
//       <section className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Contact us</h2>
//           <p className="text-center text-gray-600 mb-12">
//             Questions about MediCare AI Quick Contact? Reach out we will very soon will respond within one business day.
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
//             <div className="bg-white p-8 rounded-xl shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Write to us</h3>
//               <div className="space-y-4">
//                 <input 
//                   type="text" 
//                   placeholder="Name" 
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 />
//                 <input 
//                   type="email" 
//                   placeholder="Email" 
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 />
//                 <textarea 
//                   placeholder="Message" 
//                   rows={4}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 ></textarea>
//               </div>
//             </div>
            
//             <div className="bg-white p-8 rounded-xl shadow-lg">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Your email</h3>
//               <div className="space-y-4">
//                 <input 
//                   type="email" 
//                   placeholder="Email" 
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 />
//                 <button 
//                   className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium transition-colors"
//                 >
//                   Subscribe now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-2 gap-8">
//             <div>
//               <div className="flex items-center space-x-2 mb-4">
//                 <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
//                   <span className="text-white font-bold text-lg">M</span>
//                 </div>
//                 <span className="text-xl font-bold">MediCare AI</span>
//               </div>
//               <p className="text-gray-400 max-w-md">
//                 MediCare AI is a trusted AI-powered care services that helps revolutionize health. Through our support, AI-patient friendly, qualified health programs, and efficient, quality health medical care.
//               </p>
//             </div>
            
//             <div className="text-right">
//               <h4 className="font-semibold mb-2">GET IN TOUCH</h4>
//               <p className="text-gray-400">123 Healthcare, Delivery City</p>
//               <p className="text-gray-400">Sri Lanka 10250</p>
//               <p className="text-gray-400 mt-2">info@medicareai.com</p>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* Floating Chatbot */}
//       <div
//         className={`fixed cursor-pointer transition-all duration-1000 ease-out ${
//           chatbotAnimated 
//             ? 'bottom-8 right-8 opacity-100' 
//             : 'bottom-0 right-8 opacity-0 translate-y-20'
//         }`}
//         onClick={handleChatbotClick}
//       >
//         <div className="relative group">
//           <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
//             <MessageCircle className="w-8 h-8 text-white" />
//           </div>
//           <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          
//           {/* Tooltip */}
//           <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
//             Chat with AI Assistant
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default homepage;

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Calendar, Pill, ChevronRight } from 'lucide-react';

const homepage = () => {
  const router = useRouter();

  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [chatbotAnimated, setChatbotAnimated] = useState(false);

  useEffect(() => {
    // Trigger chatbot float animation after component mounts
    const timer = setTimeout(() => {
      setChatbotAnimated(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChatbotClick = () => {
    // Navigate to chatbot page (blank for now)
    router.push('/chatbot');
  };

  const handleJoinClick = () => {
    // ✅ Navigate to login page
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gray-800">MediCare AI</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-teal-600">Contact us</a>
          </nav>

          {/* ✅ Updated Button */}
          <button
            onClick={handleJoinClick}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Join with us
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your AI Health Assistant for Simplified Care
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              From doctor appointments to pharmacy pickups, streamline your healthcare journey with the power of intelligent AI.
            </p>
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Create an Account
            </button>
          </div>

          {/* Chat Interface Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                  <p className="text-sm text-gray-500">Always here to help</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Hello! How can I help you today?</p>
                </div>
                <div className="bg-teal-500 text-white rounded-lg p-4 ml-auto max-w-xs">
                  <p className="text-sm">I need to book an appointment</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">I can help you schedule an appointment. What type of doctor would you like to see?</p>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything you need for modern care
          </h2>
          <p className="text-center text-gray-600 mb-12">
            From AI chatbot to pharmacy pickups, streamline your healthcare journey
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Health Assistant</h3>
              <p className="text-gray-600">Get instant answers to your health questions with our intelligent AI assistant</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Appointment</h3>
              <p className="text-gray-600">Book appointments with healthcare professionals quickly and easily</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pharmacy Integration</h3>
              <p className="text-gray-600">Manage prescriptions and connect with pharmacies seamlessly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our vision</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our mission is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers by leveraging AI and smart tools. Our tools make appointments easier, prescriptions smoother, and healthcare more accessible—helping everyone manage their health with clarity.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">✓</span>
                  <span className="text-gray-700">Empower patients with understandable insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">✓</span>
                  <span className="text-gray-700">Simplify appointment scheduling and management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">✓</span>
                  <span className="text-gray-700">Secure, transparent records and pharmacy integration</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"
                alt="Healthcare professionals"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            About MediCare AI Center
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Welcome to MediCare AI, your trusted partner in revolutionizing healthcare management. Our platform combines cutting-edge artificial intelligence with user-friendly design to provide a comprehensive healthcare companion that works with you at every step. MediCare AI Smart centralizes comprehensive care with comfort at home you.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trusted Clinicians</h3>
              <p className="text-gray-600">
                Meet certified doctors and healthcare providers ready to serve when you need expert medical guidance most.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Driven Insights</h3>
              <p className="text-gray-600">
                Get quick answers to health questions and symptom checking powered by advanced artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Contact us</h2>
          <p className="text-center text-gray-600 mb-12">
            Questions about MediCare AI Quick Contact? Reach out we will very soon will respond within one business day.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write to us</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your email</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Subscribe now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold">MediCare AI</span>
              </div>
              <p className="text-gray-400 max-w-md">
                MediCare AI is a trusted AI-powered care services that helps revolutionize health. Through our support, AI-patient friendly, qualified health programs, and efficient, quality health medical care.
              </p>
            </div>

            <div className="text-right">
              <h4 className="font-semibold mb-2">GET IN TOUCH</h4>
              <p className="text-gray-400">123 Healthcare, Delivery City</p>
              <p className="text-gray-400">Sri Lanka 10250</p>
              <p className="text-gray-400 mt-2">info@medicareai.com</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <div
        className={`fixed cursor-pointer transition-all duration-1000 ease-out ${
          chatbotAnimated
            ? 'bottom-8 right-8 opacity-100'
            : 'bottom-0 right-8 opacity-0 translate-y-20'
        }`}
        onClick={handleChatbotClick}
      >
        <div className="relative group">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with AI Assistant
          </div>
        </div>
      </div>
    </div>
  );
};

export default homepage;
