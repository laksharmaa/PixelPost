// UserProfileDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTrophy, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";

const UserProfileDropdown = ({
  userName,
  userEmail,
  username,
  avatarSrc,
  onLogout,
  includeProfileOption,
  isDarkMode,
  toggleDarkMode,
  isMobile = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" style={{ margin: "auto" }} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-8 h-8 rounded-full"
      >
        <img
          src={avatarSrc}
          alt="User"
          className="w-full h-full rounded-full border border-blue-500"
        />
      </button>

      {isDropdownOpen && (
        <div
          className={`absolute ${isMobile ? "bottom-full" : "bottom-full"} 
          left-14 w-64 rounded-2xl shadow-xl overflow-hidden
          ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{userName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  @{username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            {includeProfileOption && (
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaUser className="w-5 h-5" />
                My Profile
              </button>
            )}

            <button
              onClick={() => {
                navigate("/contests/myentries");
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaTrophy className="w-5 h-5" />
              My Contest Entries
            </button>

            {toggleDarkMode && (
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <>
                    <FaSun className="w-5 h-5" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FaMoon className="w-5 h-5" />
                    Dark Mode
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            >
              <FaSignOutAlt className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
