import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "../components/Loader";
import Card from "../components/Card";
import SkeletonCard from "../components/SkeletonCard";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import UserProfileCard from "../components/UserProfileCard"; // Import the new UserProfileCard component
import UserProfileCardSkeleton from "../components/UserProfileCardSkeleton"; // Import the skeleton loader
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const POSTS_PER_PAGE = 12;

const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [userPosts, setUserPosts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const queryClient = useQueryClient();

  // Add bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ postId, isBookmarked }) => {
      const token = await getAccessTokenSilently();
      const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/post/${postId}/${isBookmarked ? 'unbookmark' : 'bookmark'
        }`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.sub }),
      });
      if (!response.ok) throw new Error('Failed to toggle bookmark');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['bookmarks']);
    },
  });

  // Add handleBookmark function
  const handleBookmark = (postId) => {
    const post = userPosts.find((p) => p._id === postId);
    if (post) {
      bookmarkMutation.mutate({
        postId,
        isBookmarked: post.bookmarkedBy?.includes(user?.sub),
      });
    }
  };

  // Fetch user information
  const fetchUserInfo = async () => {
    try {
      const token = await getAccessTokenSilently();
      const userId = encodeURIComponent(user.sub); // Ensure the userId is encoded

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/${userId}`,  // Ensure the URL is correctly formatted
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUserInfo(result.data);
      } else {
        console.error("Error fetching user info:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/user/${encodeURIComponent(
          user.sub
        )}?page=${pageNumber}&limit=${POSTS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUserPosts((prevPosts) => {
          const newPosts = result.data.filter(
            (newPost) => !prevPosts.some((post) => post._id === newPost._id)
          );
          return [...prevPosts, ...newPosts];
        });
        setHasMore(result.hasMore);
      } else {
        console.error("Error fetching user posts:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect: Fetch user info and posts on mount
  useEffect(() => {
    fetchUserInfo();
    fetchUserPosts(page);
  }, [user, page]);

  // Infinite scrolling handler
  const handleScroll = useCallback(() => {
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.offsetHeight - 100;

    if (
      scrollPosition >= scrollThreshold &&
      hasMore &&
      !loading
    ) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, loading]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Delete post
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      if (!selectedPostId) return;

      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/${selectedPostId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUserPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== selectedPostId)
        );
        setIsModalOpen(false);
      } else {
        console.error("Error deleting post:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation modal
  const handleOpenModal = (postId) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  // Close delete confirmation modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-4 max-w-7xl mx-auto bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen p-8 rounded-lg shadow-md transition-colors duration-300 ease-in-out"
    >
      {/* User Profile Card with animation */}
      <AnimatePresence mode="wait">
        {userInfo ? (
          <motion.div
            key="profile-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-80 md:h-60 align-center mb-10"
          >
            <UserProfileCard userInfo={userInfo} auth0User={user} />
          </motion.div>
        ) : (
          <motion.div
            key="profile-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserProfileCardSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <p className="text-gray-500 text-lg">
          Below are your created posts. You can manage them here.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && page === 1 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3"
          >
            {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {userPosts.length ? (
              <motion.div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      {...post}
                      onDelete={handleOpenModal}
                      isUserProfile={true}
                      isBookmarked={post.bookmarkedBy?.includes(user?.sub)}
                      onBookmark={handleBookmark}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-10"
              >
                <h2 className="text-gray-100 text-xl">No posts found.</h2>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator with animation */}
      <AnimatePresence>
        {loading && page > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center mt-5"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeletePost}
        isDeleting={isDeleting}
      />
    </motion.section>
  );
};

export default Profile;