// UserProfileDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const UserProfileDropdown = ({ 
  userName, 
  userEmail, 
  avatarSrc, 
  onLogout, 
  includeProfileOption,
  isDarkMode,
  toggleDarkMode,
  isMobile = false
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex justify-center" ref={dropdownRef}>
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
        <div className={`fixed ml-2 bottom-1
          left-14  w-max rounded-2xl shadow-xl overflow-hidden
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img src={avatarSrc} alt="profile" className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-medium">{userName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</div>
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
                <UserCircleIcon className="w-5 h-5" />
                My Profile
              </button>
            )}
            
            {isMobile && (
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                    </svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                    </svg>
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
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;