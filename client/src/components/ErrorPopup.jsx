// src/components/ErrorPopup.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiErrorWarningLine } from "react-icons/ri";

const ErrorPopup = ({ isVisible, message, onClose, type = "error" }) => {
  // Prevent background scrolling when popup is visible
  useEffect(() => {
    if (isVisible) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body to prevent scrolling and add blur
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Add blur to main content
      const mainContent = document.querySelector('main') || document.getElementById('root');
      if (mainContent) {
        mainContent.classList.add('popup-blur');
      }
      
      return () => {
        // Restore scrolling when component unmounts or popup closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        // Remove blur
        if (mainContent) {
          mainContent.classList.remove('popup-blur');
        }
      };
    }
  }, [isVisible]);

  // Determine styles based on type (error, warning, info)
  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          icon: <RiErrorWarningLine className="text-red-500 text-xl" />,
          title: "Error",
        };
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
          icon: <RiErrorWarningLine className="text-amber-500 text-xl" />,
          title: "Warning",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          icon: <RiErrorWarningLine className="text-blue-500 text-xl" />,
          title: "Information",
        };
      default:
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          icon: <RiErrorWarningLine className="text-red-500 text-xl" />,
          title: "Error",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`max-w-md w-full rounded-xl ${styles.bg} ${styles.border} border shadow-lg overflow-hidden`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {styles.icon}
                  <h3 className="ml-2 text-lg font-bold">{styles.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RiCloseLine className="text-gray-500 text-xl" />
                </button>
              </div>
              
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
              </div>
              
              <div className="mt-5 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-[#6469ff] hover:bg-[#5258e4] text-white rounded-lg text-sm font-medium shadow-sm"
                  onClick={onClose}
                >
                  Got it
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorPopup;
