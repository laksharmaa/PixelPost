import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import Card from "../components/Card";
import Loader from "../components/Loader";
import FormField from "../components/FormField";
import SkeletonCard from "../components/SkeletonCard";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";

const RenderCards = ({
  data,
  title,
  onDelete,
  isUserProfile,
  onBookmark,
  user,
}) => {
  if (data?.length > 0) {
    return data.map((post, index) => (
      <motion.div
        key={post._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card
          {...post}
          onDelete={onDelete}
          isUserProfile={isUserProfile}
          isBookmarked={post.bookmarkedBy?.includes(user?.sub)}
          onBookmark={onBookmark}
        />
      </motion.div>
    ));
  }

  return (
    <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-5 font-bold text-[#6449ff] text-xl uppercase"
    >
      {title}
    </motion.h2>
  );
};

const Home = () => {
  const [searchText, setSearchText] = useState("");
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const queryClient = useQueryClient();


  useEffect(() => {
    const getUser = async () => {
      const token = await getAccessTokenSilently();
      if (!user) return;
      await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/${user.sub}`,  // Ensure the URL is correctly formatted
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.sub,
            name: user.name,
            email: user.email,
            profilePicture: user.picture,
          }),
        }
      );
    };

    if (isAuthenticated) {
      getUser();
    }
  }, [isAuthenticated]);

  // Fetch posts with infinite scroll
  const fetchPosts = async ({ pageParam = 1 }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/v1/post?page=${pageParam}&limit=9`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    console.log(user);
    return response.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.data.length < 9) return undefined;
      return pages.length + 1;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/post/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete post");
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.setQueryData(["posts"], (old) => ({
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((post) => post._id !== postId),
        })),
      }));
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ postId, isBookmarked }) => {
      const token = await getAccessTokenSilently();
      const endpoint = `${
        import.meta.env.VITE_BASE_URL
      }/api/v1/post/${postId}/${isBookmarked ? "unbookmark" : "bookmark"}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.sub }),
      });
      if (!response.ok) throw new Error("Failed to toggle bookmark");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the posts query to get updated bookmark status
      queryClient.invalidateQueries(["posts"]);
    },
  });

  // Update the handleBookmark function:
  const handleBookmark = (postId) => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
      return;
    }

    const post = data?.pages
      .flatMap((page) => page.data)
      .find((p) => p._id === postId);

    if (post) {
      bookmarkMutation.mutate({
        postId,
        isBookmarked: post.bookmarkedBy?.includes(user?.sub), // Fix: Check current user's ID
      });
    }
  };

  if (status === "loading") return <Loader />;
  if (status === "error") return <div>Error loading posts</div>;

  const filteredPosts = data?.pages
    .flatMap((page) => page.data)
    .filter((post) =>
      searchText
        ? post.name.toLowerCase().includes(searchText.toLowerCase()) ||
          post.prompt.toLowerCase().includes(searchText.toLowerCase())
        : true
    );

  // Add this useEffect for infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 && // Load more when 100px from bottom
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: activeContests } = useQuery({
    queryKey: ["activeContests"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/contests`
      );
      if (!response.ok) throw new Error("Failed to fetch contests");
      return response.json();
    },
  });

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-extrabold text-[#222328] dark:text-white text-[32px]">
          The Community Showcase
        </h1>
        <p className="mt-2 text-[#666e75] dark:text-gray-400 text-[16px] max-w-[500px]">
          Browse through a collection of visually stunning images built with
          your imagination
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-16"
      >
        <FormField
          labelName="Search posts"
          type="text"
          name="text"
          placeholder="Search posts"
          value={searchText}
          handleChange={(e) => setSearchText(e.target.value)}
        />
      </motion.div>

      {activeContests?.data &&
        activeContests.data.length > 0 &&
        activeContests.data.some((contest) => contest.status === "active") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 mb-12"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaTrophy className="text-yellow-500 mr-2" />
                Active Contests
              </h2>
              <Link to="/contests">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-md"
                >
                  View All Contests
                </motion.button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.data
                .filter((contest) => contest.status === "active")
                .slice(0, 3)
                .map((contest, index) => (
                  <motion.div
                    key={contest._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-green-500"
                  >
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                        {contest.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Theme: {contest.theme}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {contest.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <FaTrophy className="inline mr-1 text-yellow-500" />
                          {contest.entries?.length || 0} entries
                        </div>
                        <Link to={`/contests/${contest._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium"
                          >
                            Join Contest
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

      <div className="mt-10">
        {searchText && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium text-[#666e75] dark:text-gray-400 text-xl mb-3"
          >
            Showing results for{" "}
            <span className="text-[#222328] dark:text-white">{searchText}</span>
          </motion.h2>
        )}

        <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3">
          <AnimatePresence>
            {isLoading ? (
              // Show skeleton cards while loading
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            ) : (
              <RenderCards
                data={filteredPosts}
                title="No posts found"
                onDelete={(id) => deleteMutation.mutate(id)}
                onBookmark={handleBookmark}
                user={user}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-10"
        >
          <Loader />
        </motion.div>
      )}
    </motion.section>
  );
};

export default Home;
