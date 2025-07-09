import { useAuth0 } from "@auth0/auth0-react";

function AuthButtons() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <div className="flex items-center gap-4">
      {!isAuthenticated ? (
        <button
          onClick={() => loginWithRedirect()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Login with GitHub
        </button>
      ) : (
        <>
          <p className="text-sm">Welcome {user?.name}</p>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

export default AuthButtons; 