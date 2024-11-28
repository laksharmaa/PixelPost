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
      className={`shadow-lg rounded-xl ${randomColorClass} animate-pulse group relative shadow-card transition-all duration-300 card`}
    >
      {/* Card Body */}
      <div className="w-full h-48 rounded-lg mb-4"></div>
    </div>
  );
};

export default SkeletonCard;
