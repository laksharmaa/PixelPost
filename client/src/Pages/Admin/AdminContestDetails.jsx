// Pages/Admin/AdminContestDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import AdminSidebar from "../../components/AdminSidebar";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrophy,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import Loader from "../../components/Loader";

const AdminContestDetails = () => {
  const { token } = useAdmin();
  const navigate = useNavigate();
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContest();
  }, [id, token]);

  const fetchContest = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/admin/contests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contest");
      }

      const { data } = await response.json();
      setContest(data);
    } catch (error) {
      console.error("Error fetching contest:", error);
      setError("Failed to load contest data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWinners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/admin/contests/${id}/calculate-winners`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate winners");
      }

      // Refresh contest data
      fetchContest();
    } catch (error) {
      console.error("Error calculating winners:", error);
      setError("Failed to calculate winners");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <FaCheckCircle className="mr-1" />
            Active
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <FaClock className="mr-1" />
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <FaCalendarAlt className="mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <AdminSidebar />
        </div>
        <div className="md:col-span-3">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
          <button
            onClick={() => navigate("/admin/contests")}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <AdminSidebar />
      </div>

      <div className="md:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">
              Contest Details
            </h1>
            <div className="flex space-x-3">
              <Link to={`/admin/contests/edit/${id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md"
                >
                  <FaEdit className="mr-2" />
                  <span>Edit</span>
                </motion.button>
              </Link>

              {contest?.status === "completed" &&
                contest?.winners.length === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={calculateWinners}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md"
                  >
                    <FaTrophy className="mr-2" />
                    <span>Calculate Winners</span>
                  </motion.button>
                )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {contest?.title}
                </h2>
                <div className="mt-2">{getStatusBadge(contest?.status)}</div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Theme
                </div>
                <div className="text-lg font-medium text-gray-800 dark:text-white">
                  {contest?.theme}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <FaCalendarAlt className="mr-2" />
                  <span className="font-medium">Start Date</span>
                </div>
                <div className="text-gray-800 dark:text-white">
                  {formatDate(contest?.startDate)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <FaCalendarAlt className="mr-2" />
                  <span className="font-medium">End Date</span>
                </div>
                <div className="text-gray-800 dark:text-white">
                  {formatDate(contest?.endDate)}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Description
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-700 dark:text-gray-300">
                {contest?.description}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Entries ({contest?.entries.length || 0})
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <FaUsers className="inline mr-1" />
                  {contest?.entries.length} participants
                </div>
              </div>

              {contest?.entries.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No entries yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Post
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Relevancy Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Votes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {contest?.entries.map((entry) => (
                        <tr
                          key={entry._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {entry.userId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.postId ? (
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={entry.postId.photo}
                                    alt={entry.postId.prompt || "Contest entry"}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                    {entry.postId.prompt || "No prompt"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                Post not available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(entry.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.relevancyScore.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {entry.voters.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {contest?.winners && contest.winners.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaTrophy className="text-yellow-500 mr-2" />
                  Winners
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contest.winners.map((winner) => (
                    <div
                      key={winner.rank}
                      className={`bg-gradient-to-r ${
                        winner.rank === 1
                          ? "from-yellow-400 to-yellow-300"
                          : winner.rank === 2
                          ? "from-gray-400 to-gray-300"
                          : "from-amber-700 to-amber-600"
                      } p-1 rounded-lg`}
                    >
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-md h-full">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-2xl font-bold">
                            #{winner.rank}
                          </div>
                          <div className="text-lg font-medium">
                            {winner.relevancyScore.toFixed(1)}
                          </div>
                        </div>
                        <div className="mb-2 font-medium">
                          {winner.username}
                        </div>
                        {winner.postId && (
                          <div className="mt-2">
                            <img
                              src={
                                typeof winner.postId === "object"
                                  ? winner.postId.photo
                                  : ""
                              }
                              alt={`Winner #${winner.rank}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/contests")}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
            >
              Back to Contests
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContestDetails;
