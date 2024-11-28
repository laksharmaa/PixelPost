import { useAuth0 } from '@auth0/auth0-react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // Show a loading state while the authentication status is being determined
  if (isLoading) {
    return <div>Loading...</div>; // Or a more elaborate loader component
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }, // Ensure the user is redirected back after login
    });
    return null; // Return null to prevent rendering during redirect
  }

  // Render the protected component if authenticated
  return children;
};

export default PrivateRoute;
