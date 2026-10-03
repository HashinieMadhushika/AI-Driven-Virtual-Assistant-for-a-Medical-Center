export const inputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600';

export const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';

export const primaryButtonClass =
  'bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800 transition-all shadow-sm flex items-center space-x-2 disabled:opacity-60';

export const secondaryButtonClass =
  'bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all';

export function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return <div className={`animate-spin rounded-full border-b-2 border-teal-600 ${className}`} />;
}
