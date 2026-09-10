// "use client";

// import React, { useState } from "react";
// import { FaTimes } from "react-icons/fa";

// import WelcomeScreen from "./WelcomeScreen";
// import UserInfoScreen from "./UserInfoScreen";
// import FeatureSelectionScreen from "./FeatureSelectionScreen";
// import ChatScreen from "./ChatScreen";

// type Screen = "welcome" | "userinfo" | "features" | "chat";

// type Props = {
//   open: boolean;
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
// };

// export default function ChatbotPopup({ open, setOpen }: Props) {
//   const [screen, setScreen] = useState<Screen>("welcome");
//   const [selectedFeature, setSelectedFeature] = useState("");

//   // ✅ If not open, render nothing
//   if (!open) return null;

//   const handleClose = () => {
//     setOpen(false);
//     setScreen("welcome");
//     setSelectedFeature("");
//   };

//   return (
//     <div className="fixed bottom-20 right-6 z-50">
//       <div className="w-[95vw] max-w-[800px] h-[80vh] max-h-[750px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

//         {/* Header */}
//         <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-8 flex justify-between items-center">
//           <h2 className="font-semibold text-xl">MediCare AI Assistant</h2>

//           <button
//             onClick={handleClose}
//             className="p-2 rounded-lg hover:bg-white/20 transition"
//             aria-label="Close chatbot"
//           >
//             <FaTimes />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-teal-50 via-white to-emerald-50">
//           {screen === "welcome" && (
//             <WelcomeScreen onNext={() => setScreen("userinfo")} />
//           )}

//           {screen === "userinfo" && (
//             <UserInfoScreen onNext={() => setScreen("features")} />
//           )}

//           {screen === "features" && (
//             <FeatureSelectionScreen
//               onSelect={(feature) => {
//                 setSelectedFeature(feature);
//                 setScreen("chat");
//               }}
//             />
//           )}

//          {screen === "chat" && (
//   <ChatScreen
//     feature={selectedFeature}
//     onBack={() => setScreen("features")}
//   />
// )}

//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

import WelcomeScreen from "./WelcomeScreen";
import UserInfoScreen from "./UserInfoScreen";
import FeatureSelectionScreen from "./FeatureSelectionScreen";
import ChatScreen from "./ChatScreen";

type Screen = "welcome" | "userinfo" | "features" | "chat";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ChatbotPopup({ open, setOpen }: Props) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedFeature, setSelectedFeature] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    setScreen("welcome");
    setSelectedFeature("");
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="w-[900px] max-w-[900px] h-[80vh] max-h-[740px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 flex justify-between items-center">
          <h2 className="font-semibold">MediCare AI Assistant</h2>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/20 transition"
            aria-label="Close chatbot"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
          {screen === "welcome" && (
            <WelcomeScreen onNext={() => setScreen("userinfo")} />
          )}

          {screen === "userinfo" && (
            <UserInfoScreen onNext={() => setScreen("features")} />
          )}

          {screen === "features" && (
            <FeatureSelectionScreen
              onSelect={(feature) => {
                setSelectedFeature(feature);
                setScreen("chat");
              }}
            />
          )}

          {screen === "chat" && (
            <ChatScreen
              feature={selectedFeature}
              onBack={() => setScreen("features")}
            />
          )}
        </div>
      </div>
    </div>
  );
}