import { useAuth0 } from "@auth0/auth0-react";

function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 NEBULA AI</h1>
          <p className="text-xl text-blue-400 mb-8">Mission Control Center</p>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-white">Loading...</div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <span className="mr-2">🔐</span>
                Login to Mission Control
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 