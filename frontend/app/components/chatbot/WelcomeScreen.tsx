interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-2xl font-bold text-teal-700 pt-40">
        Welcome to MediCare AI
      </h1>

      <p className="text-gray-600 text-sm">
        Your AI-powered healthcare assistant.
      </p>

      <button
        onClick={onNext}
        className="w-50 bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
      >
        Get Started
      </button>
    </div>
  );
}