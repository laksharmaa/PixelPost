import { useAuth0 } from '@auth0/auth0-react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }, // Ensure the user is redirected back after login
    });
    return null; // Return null to prevent rendering during redirect
  }

  return children; // Render the protected component if authenticated
};

export default PrivateRoute;
