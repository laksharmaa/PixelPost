import React from "react";

const randomColorClasses = [
  "bg-pink-300 dark:bg-pink-400",
  "bg-blue-300 dark:bg-blue-400",
  "bg-yellow-300 dark:bg-yellow-400",
  "bg-green-300 dark:bg-green-400",
  "bg-gray-300 dark:bg-gray-400",
  "bg-red-300 dark:bg-red-400",
  "bg-indigo-300 dark:bg-indigo-400",
];

const SkeletonCard = () => {
  const randomColorClass =
    randomColorClasses[Math.floor(Math.random() * randomColorClasses.length)];

  return (
    <div
      className={`shadow-lg rounded-xl ${randomColorClass} animate-pulse group relative shadow-card transition-all duration-300 hover:scale-[1.02] card`}
    >
      {/* Card Body */}
      <div className="w-full h-64 rounded-lg">
         {/* Optional Loading Indicator */}
      <div className="absolute bottom-2 right-2 opacity-50 group-hover:opacity-70 transition-opacity">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="animate-spin"
        >
          <path d="M12 2v4" />
          <path d="m16.2 7.8 2.9-2.9" />
          <path d="M18 12h4" />
          <path d="m16.2 16.2 2.9 2.9" />
          <path d="M12 18v4" />
          <path d="m4.9 19.1 2.9-2.9" />
          <path d="M2 12h4" />
          <path d="m4.9 4.9 2.9 2.9" />
        </svg>
      </div>

      </div>
    </div>
  );
};

export default SkeletonCard;
