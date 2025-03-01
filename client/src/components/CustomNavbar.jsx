import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import logo from "../assets/logo.png";
import DarkModeToggle from "./DarkModeToggle";
import { useTheme } from "../context/ThemeContext";
import UserProfileDropdown from "./UserProfileDropdown";
import {
  FaHome,
  FaPlusCircle,
  FaUser,
  FaBell,
  FaBookmark,
  FaTrophy,
} from "react-icons/fa";

function CustomNavbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated, loginWithPopup, logout, user } = useAuth0();
  const location = useLocation();
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  const navItems = [
    { path: "/", icon: FaHome, label: "Home" },
    { path: "/create-post", icon: FaPlusCircle, label: "Create" },
    { path: "/notifications", icon: FaBell, label: "Notifications" },
    { path: "/bookmarks", icon: FaBookmark, label: "Bookmarks" },
    { path: "/contests", icon: FaTrophy, label: "Contests" },
    {
      path: "/profile",
      icon: FaUser,
      label: "Profile",
      authRequired: true,
    },
  ];

  // Move repeated logic to a separate function
  const renderDesktopIcon = (item) => {
    if (item.authRequired && !isAuthenticated) return null;
    const Icon = item.icon;
    const isActive =
      location.pathname === item.path ||
      (item.path === "/contests" && location.pathname.startsWith("/contests/"));

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group relative p-2 rounded-xl flex items-center justify-center
          ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-500/10"}`}
      >
        <Icon className="w-5 h-5" />
        <span
          className={`absolute left-full ml-2 px-2 py-1 text-sm rounded-md shadow-md
            transition-opacity duration-200 opacity-0 group-hover:opacity-100
            ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-900 text-white"
            }`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  // Desktop Floating Sidebar
  const FloatingSidebar = () => (
    <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-50">
      <div
        className={`flex flex-col items-center p-3 rounded-xl
        backdrop-blur-md shadow-lg
        ${
          isDarkMode ? "bg-gray-800/90 text-white" : "bg-white/90 text-gray-900"
        }`}
      >
        <Link to="/" className="mb-6">
          <img src={logo} alt="Logo" className="w-6 h-6" />
        </Link>

        <div className="flex flex-col gap-4">
          {navItems.map(renderDesktopIcon)}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <DarkModeToggle />
          {isAuthenticated ? (
            <UserProfileDropdown
              userName={user?.name}
              userEmail={user?.email}
              avatarSrc={user?.picture}
              onLogout={() => logout({ returnTo: window.location.origin })}
              includeProfileOption
              isDarkMode={isDarkMode}
              isMobile={false}
            />
          ) : (
            <button
              onClick={() => loginWithPopup({ connection: "google-oauth2" })}
              className="p-2 rounded-xl hover:bg-blue-500/10"
            >
              <FaUser className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Bottom Navigation
  const MobileNavigation = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-t-lg
        backdrop-blur-md shadow-lg
        ${
          isDarkMode ? "bg-gray-800/90 text-white" : "bg-white/90 text-gray-900"
        }`}
      >
        {/* Create a container for the navigation icons */}
        <div className="flex items-center justify-between flex-1">
          {/* Show 5 items in mobile nav, including Contests */}
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/contests" &&
                location.pathname.startsWith("/contests/"));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-lg flex items-center justify-center ${
                  isActive ? "text-blue-500" : ""
                }`}
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}

          {/* Profile button with consistent spacing */}
          {isAuthenticated ? (
            <div className="relative flex items-center justify-center p-2">
              <button
                onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                className="flex items-center justify-center"
              >
                <img
                  src={user?.picture}
                  alt="profile"
                  className="w-7 h-7 rounded-full border border-blue-500"
                />
              </button>

              {showMobileDropdown && (
                <div className="absolute bottom-full right-0 mb-2 w-64">
                  <div
                    className={`rounded-lg shadow-lg overflow-hidden
                    ${
                      isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.picture}
                          alt="profile"
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{user?.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowMobileDropdown(false)}
                      >
                        <div className="flex items-center">
                          <FaUser className="mr-2" />
                          My Profile
                        </div>
                      </Link>
                      <Link
                        to="/my-contest-entries"
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowMobileDropdown(false)}
                      >
                        <div className="flex items-center">
                          <FaTrophy className="mr-2" />
                          My Contest Entries
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setShowMobileDropdown(false);
                          toggleDarkMode();
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                      </button>
                      <button
                        onClick={() =>
                          logout({ returnTo: window.location.origin })
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => loginWithPopup({ connection: "google-oauth2" })}
              className="p-2 rounded-lg flex items-center justify-center"
            >
              <FaUser className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileDropdown && !event.target.closest(".relative")) {
        setShowMobileDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMobileDropdown]);

  return (
    <>
      <FloatingSidebar />
      <MobileNavigation />
    </>
  );
}

export default CustomNavbar;
