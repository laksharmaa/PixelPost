// components/ConfirmDialog.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning" // warning, success, error
}) => {
  if (!isOpen) return null;
  
  const getIcon = () => {
    switch (type) {
      case "success": 
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case "error":
        return <FaTimesCircle className="text-red-500 text-4xl" />;
      default: // warning
        return <FaExclamationTriangle className="text-yellow-500 text-4xl" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bgGradient: "from-green-500 to-emerald-600",
          confirmBg: "bg-green-500 hover:bg-green-600",
          ring: "ring-green-500/50"
        };
      case "error":
        return {
          bgGradient: "from-red-500 to-rose-600",
          confirmBg: "bg-red-500 hover:bg-red-600",
          ring: "ring-red-500/50"
        };
      default: // warning
        return {
          bgGradient: "from-amber-500 to-orange-600",
          confirmBg: "bg-amber-500 hover:bg-amber-600",
          ring: "ring-amber-500/50"
        };
    }
  };
  
  const colors = getColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300 
          }}
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${colors.bgGradient} p-4 flex items-center justify-center`}>
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ 
                type: "spring", 
                damping: 10,
                delay: 0.2
              }}
            >
              {getIcon()}
            </motion.div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
              {message}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium"
                onClick={onClose}
              >
                {cancelText}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 ${colors.confirmBg} text-white rounded-lg font-medium ring-4 ${colors.ring}`}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
