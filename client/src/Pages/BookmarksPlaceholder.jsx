// Pages/BookmarksPlaceholder.jsx
import React from 'react';
import { motion } from 'framer-motion';

const BookmarksPlaceholder = () => {
  return (
    <div className="max-w-2xl mx-auto pt-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold mb-6 dark:text-white"
      >
        Bookmarks
      </motion.h1>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center py-16"
      >
        <div className="inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2 dark:text-white">No bookmarks yet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Save interesting posts to read them later!
        </p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-blue-500"
        >
          Feature coming soon! 🚀
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookmarksPlaceholder;