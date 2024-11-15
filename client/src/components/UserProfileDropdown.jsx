import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserProfileDropdown = ({ userName, userEmail, avatarSrc, onLogout, includeProfileOption }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent toggling unrelated actions like dark mode.
    setIsDropdownOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false); // Close dropdown after clicking.
    navigate("/profile");
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        id="avatarButton"
        type="button"
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-full cursor-pointer"
      >
        <img
          src={avatarSrc || "/default-avatar.png"}
          alt="User dropdown"
          className="w-full h-full rounded-full"
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          id="userDropdown"
          className="absolute right-0 z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
        >
          {/* User Info */}
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div>{userName || "User Name"}</div>
            <div className="font-medium truncate">{userEmail || "email@example.com"}</div>
          </div>

          {/* Menu Items */}
          {includeProfileOption && (
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  My Profile
                </button>
              </li>
            </ul>
          )}

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={onLogout}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
