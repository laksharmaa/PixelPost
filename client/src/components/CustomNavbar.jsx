import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Typography, Button } from "@material-tailwind/react";
import { useAuth0 } from "@auth0/auth0-react";
import logo from "../assets/logo.png";
import DarkModeToggle from "./DarkModeToggle";
import { useTheme } from "../context/ThemeContext";
import UserProfileDropdown from "./UserProfileDropdown";

function CustomNavbar() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, loginWithPopup, logout, user, isLoading } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `font-medium px-4 py-2 rounded-full transition-colors duration-300 ${
      isActive
        ? "bg-blue-500 text-white"
        : "hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-500 dark:hover:text-white"
    }`;
  };

  const handleCreatePostClick = () => {
    if (!isAuthenticated) {
      loginWithPopup();
    } else {
      navigate("/create-post");
    }
  };

  return (
    <Navbar
      className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-10/12 max-w-4xl p-2 rounded-full shadow-lg backdrop-blur-lg bg-opacity-30 ${
        isDarkMode ? "bg-gray-800 text-white border-none" : "bg-white text-gray-900"
      }`}
    >
      <div className="relative flex items-center justify-between">
        {/* Logo */}
        <Typography as={Link} to="/" className="mr-4 ml-2 flex items-center">
          <img src={logo} alt="Logo" className="max-h-12  mr-2" />
        </Typography>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-4">
          <Link to="/" className={linkStyle("/")}>
            Home
          </Link>
          <button
            onClick={handleCreatePostClick}
            className={`font-medium px-4 py-2 rounded-full transition-colors duration-300 ${
              location.pathname === "/create-post"
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-500 dark:hover:text-white"
            }`}
          >
            Create Post
          </button>
        </div>

        {/* Dark Mode Toggle and User Profile */}
        <div className="hidden lg:flex items-center space-x-4">
          <DarkModeToggle />
          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : isAuthenticated ? (
            <UserProfileDropdown
              userName={user?.name}
              userEmail={user?.email}
              avatarSrc={user?.picture}
              onLogout={() => logout({ returnTo: window.location.origin })}
              includeProfileOption
            />
          ) : (
            <Button
              size="sm"
              variant="gradient"
              color="blue"
              onClick={() => loginWithPopup({ connection: "google-oauth2" })}
              className={`rounded-full ${
                isDarkMode ? "text-white" : "text-gray-900"
              } hover:bg-blue-500 hover:text-white`}
            >
              Login / Signup
            </Button>
          )}
        </div>

        {/* Mobile Dark Mode Toggle */}
        <div className="flex items-center space-x-2 lg:hidden">
          <DarkModeToggle />
          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : isAuthenticated && (
            <UserProfileDropdown
              userName={user?.name}
              userEmail={user?.email}
              avatarSrc={user?.picture}
              onLogout={() => logout({ returnTo: window.location.origin })}
              includeProfileOption
            />
          )}
          {!isAuthenticated && (
            <Button
              size="sm"
              variant="gradient"
              color="blue"
              onClick={() => loginWithPopup({ connection: "google-oauth2" })}
              className={`rounded-full ${
                isDarkMode ? "text-white" : "text-gray-900"
              } hover:bg-blue-500 hover:text-white`}
            >
              Login / Signup
            </Button>
          )}
        </div>
      </div>
    </Navbar>
  );
}

export default CustomNavbar;
