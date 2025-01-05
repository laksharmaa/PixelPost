import React from 'react';
import { motion } from 'framer-motion';

const CreatePostStepper = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Add Title' },
    { number: 2, title: 'Enter Prompt' },
    { number: 3, title: 'Generate Image' },
    { number: 4, title: 'Share Post' }
  ];

  return (
    <div className="flex justify-between mb-8">
      {steps.map((step) => (
        <motion.div 
          key={step.number} 
          className={`flex flex-col items-center ${
            currentStep >= step.number ? 'text-blue-500' : 'text-gray-400'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: step.number * 0.2 }}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${currentStep >= step.number ? 'bg-blue-500 text-white' : 'bg-gray-200'}
            transition-all duration-300
          `}>
            {step.number}
          </div>
          <span className="mt-2 text-sm">{step.title}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default CreatePostStepper;