// BookmarksPlaceholder.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

const BookmarksPage = () => {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  // Fetch bookmarks query
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks', user?.sub],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/bookmarks/${user?.sub}`);
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      return response.json();
    },
    enabled: !!user?.sub,
  });

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
      queryClient.invalidateQueries(['bookmarks', user?.sub]);
    },
  });

  const handleBookmark = (postId) => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
      return;
    }

    bookmarkMutation.mutate({
      postId,
      isBookmarked: true, // Since we're in bookmarks page, the post is already bookmarked
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <h2 className="text-xl font-semibold mb-4">Sign in to view your bookmarks</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => loginWithRedirect()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Sign In
        </motion.button>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen"
      >
        <Loader />
      </motion.div>
    );
  }

  const bookmarks = data?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Your Bookmarks
      </motion.h1>

      <AnimatePresence mode="wait">
        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16"
          >
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-gray-600">Save interesting posts to see them later!</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {bookmarks.map((post) => (
              <motion.div
                key={post._id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Card
                  {...post}
                  isBookmarked={true}
                  onBookmark={handleBookmark}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookmarksPage;