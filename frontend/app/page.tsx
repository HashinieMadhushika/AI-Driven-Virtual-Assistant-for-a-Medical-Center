

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Medical Center AI</h1>
        <p className="text-xl text-gray-600 mb-8">Providing intelligent healthcare solutions</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard</h2>
            <p className="text-gray-600">View your health metrics and appointment schedule</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Pharmacy</h2>
            <p className="text-gray-600">Manage prescriptions and medication inventory</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">AI Assistant</h2>
            <p className="text-gray-600">Chat with our intelligent medical assistant</p>
          </div>
        </div>
      </div>
    </div>
  );
}

