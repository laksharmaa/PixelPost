// components/ContestCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTrophy,
} from "react-icons/fa";

const ContestCard = ({
  _id,
  title,
  theme,
  description,
  startDate,
  endDate,
  status,
  entries,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <FaCheckCircle className="mr-1" />
            Active
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <FaClock className="mr-1" />
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <FaTrophy className="mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getCardBorder = () => {
    switch (status) {
      case "active":
        return "border-green-500";
      case "upcoming":
        return "border-blue-500";
      case "completed":
        return "border-gray-500";
      default:
        return "border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 ${getCardBorder()}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          {getStatusBadge()}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Theme: {theme}
        </p>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
            <span>Start: {formatDate(startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
            <span>End: {formatDate(endDate)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <FaTrophy className="inline mr-1 text-yellow-500" />
            {entries?.length || 0} entries
          </div>

          <Link to={`/contests/${_id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm"
            >
              View Contest
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ContestCard;
