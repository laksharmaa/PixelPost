// Pages/Contests/MyContestEntries.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import {
  FaTrophy,
  FaArrowLeft,
  FaTrash,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import ConfirmDialog from "../../components/ConfirmDialog";

const MyContestEntries = () => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    entryId: null,
    contestId: null,
  });
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  // Fetch user's contest entries
  const { data, isLoading, error } = useQuery({
    queryKey: ["userContestEntries"],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/contests/user/entries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch your contest entries");
      }

      return response.json();
    },
  });

  // Remove entry mutation
  const removeEntryMutation = useMutation({
    mutationFn: async ({ contestId, entryId }) => {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/contests/${contestId}/entries/${entryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userContestEntries"]);
    },
  });

  const handleRemoveEntry = (contestId, entryId) => {
    setConfirmDialog({
      isOpen: true,
      entryId,
      contestId,
      title: "Remove Entry",
      message:
        "Are you sure you want to remove this entry from the contest? This action cannot be undone.",
    });
  };

  const confirmRemoveEntry = () => {
    const { contestId, entryId } = confirmDialog;
    if (contestId && entryId) {
      removeEntryMutation.mutate({ contestId, entryId });
    }
  };

  const getStatusBadge = (status) => {
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
          Error loading your entries: {error.message}
        </div>
        <button
          onClick={() => navigate("/contests")}
          className="flex items-center text-purple-600 dark:text-purple-400"
        >
          <FaArrowLeft className="mr-2" />
          Back to Contests
        </button>
      </div>
    );
  }

  const userEntries = data?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-6">
        <button
          onClick={() => navigate("/contests")}
          className="flex items-center text-purple-600 dark:text-purple-400 hover:underline"
        >
          <FaArrowLeft className="mr-2" />
          Back to Contests
        </button>
      </div>

      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
          <FaTrophy className="text-yellow-500 mr-3" />
          My Contest Entries
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-3xl">
          View and manage all your contest submissions in one place.
        </p>
      </motion.div>

      {userEntries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <FaTrophy className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No contest entries yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't submitted any entries to contests yet.
          </p>
          <Link to="/contests">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md"
            >
              Browse Contests
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEntries.map((item, index) => (
            <motion.div
              key={item.entry._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              {item.entry.postId ? (
                <div className="relative pb-[70%]">
                  <img
                    src={item.entry.postId.photo}
                    alt={item.entry.postId.prompt || "Contest entry"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Image not available
                  </p>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {item.contestTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Theme: {item.contestTheme}
                    </p>
                  </div>
                  {getStatusBadge(item.contestStatus)}
                </div>

                <div className="mt-3 mb-4">
                  {item.entry.postId && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {item.entry.postId.prompt || "No prompt available"}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="text-yellow-500 font-bold text-lg">
                      {item.entry.relevancyScore.toFixed(1)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      ({item.entry.voters.length} votes)
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/contests/${item.contestId}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"
                      >
                        View Contest
                      </motion.button>
                    </Link>

                    {(item.contestStatus === "active" ||
                      item.contestStatus === "upcoming") && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleRemoveEntry(item.contestId, item.entry._id)
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm flex items-center"
                        disabled={removeEntryMutation.isLoading}
                      >
                        <FaTrash className="mr-1" />
                        Remove
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {removeEntryMutation.isError && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
          Error removing entry: {removeEntryMutation.error.message}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmRemoveEntry}
        title={confirmDialog.title || "Remove Entry"}
        message={
          confirmDialog.message || "Are you sure you want to remove this entry?"
        }
        type="warning"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </motion.div>
  );
};

export default MyContestEntries;
