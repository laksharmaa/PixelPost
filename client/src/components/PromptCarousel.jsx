import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { surpriseMePrompts } from '../constant';

const PromptCarousel = ({ onSelect }) => {
  const [currentPrompt, setCurrentPrompt] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt((prev) => (prev + 1) % surpriseMePrompts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 overflow-hidden relative mb-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPrompt}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="cursor-pointer hover:text-blue-500 text-sm text-gray-500 dark:text-gray-400"
          onClick={() => onSelect(surpriseMePrompts[currentPrompt])}
        >
          {surpriseMePrompts[currentPrompt]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PromptCarousel;