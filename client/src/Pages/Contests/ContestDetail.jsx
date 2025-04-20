// Pages/Contests/ContestDetail.jsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTrophy,
  FaArrowLeft,
  FaVoteYea,
  FaUserAlt,
  FaTrash,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import ConfirmDialog from "../../components/ConfirmDialog";

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, user, getAccessTokenSilently } =
    useAuth0();
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [voteScore, setVoteScore] = useState(5);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    entryId: null,
    contestId: null,
  });

  // Fetch contest details
  const {
    data: contestData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contest", id],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/contests/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch contest details");
      }
      return response.json();
    },
  });

  // Fetch user posts for submission (only when needed)
  const fetchUserPosts = async () => {
    if (!isAuthenticated) return [];

    try {
      const token = await getAccessTokenSilently();
      const userId = user.sub;

      // Use the correct endpoint from postRoutes.js
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/user/${encodeURIComponent(
          userId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch your posts");
      }

      const data = await response.json();
      // Make sure we're setting an array, even if empty
      const posts = data.data && Array.isArray(data.data) ? data.data : [];
      setUserPosts(posts);
      return posts;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setUserPosts([]);
      return [];
    }
  };

  // Submit entry mutation
  const submitEntryMutation = useMutation({
    mutationFn: async (postId) => {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/contests/${id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contest", id]);
      setShowSubmitModal(false);
      setSelectedPost(null);
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ entryId, score }) => {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/contests/${id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ entryId, score }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit vote");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contest", id]);
      setSelectedEntry(null);
    },
  });

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
            <FaTrophy className="mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmitEntry = async () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
      return;
    }

    if (!selectedPost) {
      return;
    }

    submitEntryMutation.mutate(selectedPost);
  };

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
      queryClient.invalidateQueries(["contest", id]);
    },
  });

  // Add this handler function inside the component
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

  const handleVote = () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
      return;
    }

    voteMutation.mutate({
      entryId: selectedEntry._id,
      score: voteScore,
    });
  };

  const openSubmitModal = async () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
      return;
    }

    const posts = await fetchUserPosts();
    setShowSubmitModal(true);
  };

  // Check if user has already submitted an entry
  const hasSubmittedEntry = contestData?.data.entries.some(
    (entry) => entry.userId === user?.sub
  );

  // Check if contest is active
  const isContestActive = contestData?.data.status === "active";

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
          Error loading contest: {error.message}
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

  const contest = contestData?.data;

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {contest.title}
              </h1>
              <div className="flex items-center">
                {getStatusBadge(contest.status)}
                <span className="ml-4 text-gray-600 dark:text-gray-400">
                  Theme: {contest.theme}
                </span>
              </div>
            </div>

            {isContestActive && !hasSubmittedEntry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openSubmitModal}
                className="mt-4 md:mt-0 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md"
              >
                Submit Entry
              </motion.button>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {contest.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">Start Date</span>
              </div>
              <div className="text-gray-800 dark:text-white">
                {formatDate(contest.startDate)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">End Date</span>
              </div>
              <div className="text-gray-800 dark:text-white">
                {formatDate(contest.endDate)}
              </div>
            </div>
          </div>

          {/* Contest Entries Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Entries ({contest.entries.length})
            </h2>

            {contest.entries.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FaTrophy className="text-gray-400 text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No entries yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {contest.status === "upcoming"
                    ? "This contest has not started yet."
                    : contest.status === "active"
                    ? "Be the first to submit your entry!"
                    : "This contest ended with no entries."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contest.entries.map((entry) => (
                  <motion.div
                    key={entry._id}
                    whileHover={{ y: -5 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm"
                  >
                    {entry.postId ? (
                      <>
                        <div className="relative pb-[100%]">
                          <img
                            src={entry.postId.photo}
                            alt={entry.postId.prompt || "Contest entry"}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {entry.username}
                            </div>
                            <div className="flex items-center">
                              <div className="text-yellow-500 font-bold mr-1">
                                {entry.relevancyScore.toFixed(1)}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-sm">
                                ({entry.voters.length} votes)
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                            {entry.postId.prompt || "No prompt available"}
                          </p>

                          <div className="flex space-x-2">
                            {/* Add the "Remove Entry" button - only show if it's the user's entry and contest is active/upcoming */}
                            {isAuthenticated &&
                              user?.sub === entry.userId &&
                              (contest.status === "active" ||
                                contest.status === "upcoming") && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleRemoveEntry(contest._id, entry._id)
                                  }
                                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                                >
                                  <FaTrash className="inline mr-2" />
                                  Remove Entry
                                </motion.button>
                              )}

                            {/* Vote button - only show if it's not the user's entry and contest is active */}
                            {isContestActive &&
                              isAuthenticated &&
                              user?.sub !== entry.userId && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setSelectedEntry(entry)}
                                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium"
                                >
                                  <FaVoteYea className="inline mr-2" />
                                  {entry.voters.some(
                                    (voter) => voter.userId === user?.sub
                                  )
                                    ? "Update Vote"
                                    : "Vote"}
                                </motion.button>
                              )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          Post not available
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Winners Section (for completed contests) */}
          {contest.status === "completed" &&
            contest.winners &&
            contest.winners.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FaTrophy className="text-yellow-500 mr-3" />
                  Winners
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Vote Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Vote for this Entry
              </h3>

              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedEntry.postId?.photo}
                    alt={selectedEntry.postId?.prompt || "Contest entry"}
                    className="h-48 object-cover rounded-lg"
                  />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                  {selectedEntry.postId?.prompt || "No prompt available"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  By: {selectedEntry.username}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Rate this entry (1-10):
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={voteScore}
                    onChange={(e) => setVoteScore(parseInt(e.target.value))}
                    className="w-full mx-2 accent-purple-600"
                  />
                  <span className="text-gray-600 dark:text-gray-400">10</span>
                </div>
                <div className="text-center mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {voteScore}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVote}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg"
                  disabled={voteMutation.isLoading}
                >
                  {voteMutation.isLoading ? <Loader /> : "Submit Vote"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Entry Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Submit Entry to Contest
              </h3>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Select one of your posts to submit as an entry for "
                {contest.title}". Make sure your submission aligns with the
                theme: <span className="font-medium">{contest.theme}</span>
              </p>

              {!Array.isArray(userPosts) || userPosts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                  <FaUserAlt className="text-gray-400 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You need to create a post before you can submit an entry.
                  </p>
                  <Link to="/create-post">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md"
                    >
                      Create a Post
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {userPosts.map((post) => (
                    <motion.div
                      key={post._id}
                      whileHover={{ y: -5 }}
                      className={`bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm cursor-pointer border-2 ${
                        selectedPost === post._id
                          ? "border-purple-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedPost(post._id)}
                    >
                      <div className="relative pb-[100%]">
                        <img
                          src={post.photo}
                          alt={post.prompt || "User post"}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                          {post.prompt || "No prompt available"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitEntry}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg"
                  disabled={!selectedPost || submitEntryMutation.isLoading}
                >
                  {submitEntryMutation.isLoading ? <Loader /> : "Submit Entry"}
                </motion.button>
              </div>

              {submitEntryMutation.isError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {submitEntryMutation.error.message}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

export default ContestDetail;
