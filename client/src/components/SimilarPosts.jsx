// components/SimilarPosts.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';

const SimilarPosts = ({ postId }) => {
  const [similarPosts, setSimilarPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { getAccessTokenSilently } = useAuth0();

  const fetchSimilarPosts = useCallback(async (currentPage = 1) => {
    if (!postId) return;

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/${postId}/similar?page=${currentPage}&limit=6&threshold=0.01`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch similar posts');
      }

      const data = await response.json();
      console.log('Fetched similar posts:', data);

      setSimilarPosts((prevPosts) =>
        currentPage === 1 ? data.data : [...prevPosts, ...data.data]
      );
      setHasMore(data.pagination?.hasMore ?? false);
      setError(null);
    } catch (err) {
      console.error('Error fetching similar posts:', err);
      setError('Failed to load similar posts');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [postId, getAccessTokenSilently]);

  useEffect(() => {
    setPage(1);
    setSimilarPosts([]);
    fetchSimilarPosts(1);
  }, [postId, fetchSimilarPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSimilarPosts(nextPage);
  };

  if (error) {
    return <div className="text-red-500 text-center my-8">{error}</div>;
  }

  if (!loading && similarPosts.length === 0) {
    return <div className="text-gray-500 text-center my-8">No similar posts found.</div>;
  }

  return (
    <div className="mt-12 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          More Posts Like This
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 mb-4"
            >
              <Link to={`/post-detail/${post._id}`} className="block">
                <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
                  <img
                    src={post.photo}
                    alt={post.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg">{post.name}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-white/80 text-xs">@{post.username}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {post.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags?.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>{post.totalReactions || 0} reactions</span>
                      <span>•</span>
                      <span>{post.commentCount || 0} comments</span>
                    </div>
                    {post.similarityScore && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {Math.round(post.similarityScore * 100)}% similar
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SimilarPosts;
