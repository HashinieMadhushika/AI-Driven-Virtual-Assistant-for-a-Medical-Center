// interface Props {
//   title: string;
//   description: string;
//   onClick: () => void;
// }

// export default function FeatureCard({ title, description, onClick }: Props) {
//   return (
//     <div
//       onClick={onClick}
//       className="p-4 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition border border-gray-100 hover:scale-[1.03]"
//     >
//       <h3 className="text-md font-semibold text-emerald-700">
//         {title}
//       </h3>
//       <p className="text-xs text-gray-500 mt-1">
//         {description}
//       </p>
//     </div>
//   );
// }

import React from "react";

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function FeatureCard({ title, description, icon, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-slate-200 hover:border-teal-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-100">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-teal-700 truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}