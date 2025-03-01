// Pages/Contests/Contests.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ContestCard from "../../components/ContestCard";
import Loader from "../../components/Loader";
import { FaTrophy, FaFilter } from "react-icons/fa";

const Contests = () => {
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'upcoming', 'completed'

  // Fetch all contests
  const { data, isLoading, error } = useQuery({
    queryKey: ["contests", "all"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/contests/all`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch contests");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Error loading contests: {error.message}
        </div>
      </div>
    );
  }

  // Filter contests based on selected filter
  const filteredContests = data?.data.filter((contest) => {
    if (filter === "all") return true;
    return contest.status === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
              <FaTrophy className="text-yellow-500 mr-3" />
              Contests
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-3xl">
              Participate in our creative challenges, submit your best work, and
              vote for your favorites. Win recognition and showcase your talent!
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
              <FaFilter className="text-gray-500 dark:text-gray-400 mr-2" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="all">All Contests</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {filteredContests?.length === 0 ? (
        <div className="text-center py-12">
          <FaTrophy className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No contests found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter !== "all"
              ? `There are no ${filter} contests at the moment.`
              : "There are no contests available right now. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests?.map((contest, index) => (
            <motion.div
              key={contest._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ContestCard {...contest} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Contests;