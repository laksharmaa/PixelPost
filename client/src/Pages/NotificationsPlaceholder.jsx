// Pages/NotificationsPlaceholder.jsx
import React from 'react';
import { motion } from 'framer-motion';

const NotificationsPlaceholder = () => {
  return (
    <div className="max-w-2xl mx-auto pt-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold mb-6 dark:text-white"
      >
        Notifications
      </motion.h1>
      
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border dark:border-gray-700
              ${index === 1 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center text-gray-500 dark:text-gray-400"
      >
        Feature coming soon! 🚀
      </motion.div>
    </div>
  );
};

export default NotificationsPlaceholder;