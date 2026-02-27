// import ChatInput from "./ChatInput";

// interface Props {
//   feature: string;
// }

// export default function ChatScreen({ feature }: Props) {
//   return (
//     <div className="flex flex-col h-full">
//       <h2 className="text-xl font-bold text-teal-700 mb-4">
//         {feature}
//       </h2>

//       <div className="flex-1 bg-white rounded-2xl p-4 shadow-inner overflow-y-auto space-y-3">
//         <div className="bg-teal-100 text-sm p-2 rounded-lg w-fit max-w-[80%]">
//           AI: How can I assist you with {feature}?
//         </div>
//       </div>

//       <div className="mt-4">
//         <ChatInput />
//       </div>
//     </div>
//   );
// }


import ChatInput from "./ChatInput";
import { ArrowLeft } from "lucide-react";

interface Props {
  feature: string;
  onBack: () => void;
}

export default function ChatScreen({ feature, onBack }: Props) {
  return (
    <div className="flex flex-col h-full">

      {/* Header with Back */}
      <div className="flex items-center gap-3 mb-4">

        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-teal-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-teal-700" />
        </button>

        <h2 className="text-xl font-bold text-teal-700">
          {feature}
        </h2>

      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-inner overflow-y-auto space-y-3">

        <div className="bg-teal-100 text-sm px-4 py-2 rounded-lg w-fit max-w-[80%]">
          AI: How can I assist you with {feature}?
        </div>

      </div>

      {/* Chat Input */}
      <div className="mt-4">
        <ChatInput />
      </div>
    </div>
  );
}