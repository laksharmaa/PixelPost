import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import likeAnimation from "../assets/lottie/like.json";
import loveAnimation from "../assets/lottie/love.json";
import hahaAnimation from "../assets/lottie/haha.json";
import wowAnimation from "../assets/lottie/wow.json";
import fireAnimation from "../assets/lottie/fire.json";
import { useUser } from "../context/UserContext";

// Lottie-based reactions
const reactions = {
  like: {
    animation: likeAnimation,
    label: "Like",
    color: "text-yellow-100",
  },
  love: {
    animation: loveAnimation,
    label: "Love",
    color: "text-red-500",
  },
  haha: {
    animation: hahaAnimation,
    label: "Haha",
    color: "text-yellow-500",
  },
  wow: {
    animation: wowAnimation,
    label: "Wow",
    color: "text-purple-500",
  },
  fire: {
    animation: fireAnimation,
    label: "Fire",
    color: "text-orange-500",
  },
};

const ReactionButton = ({ post, userId }) => {
  const { isAuthenticated, user, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [hovering, setHovering] = useState(false);
  const { user: currentUser, isLoading: userLoading } = useUser();
  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState(post.reactions || {});
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0);

  // Update userReaction whenever currentUser or post.reactedBy changes
  useEffect(() => {
    if (currentUser && post.reactedBy) {
      const username = currentUser.username;
      const foundReaction = post.reactedBy.find(r => r.username === username);
      setUserReaction(foundReaction ? foundReaction.reactionType : null);
    }
  }, [currentUser, post.reactedBy]);

  const getCurrentReactionIcon = () => {
    return userReaction ? (
      <Lottie animationData={reactions[userReaction].animation} style={{ width: 32, height: 32 }} />
    ) : (
      <Lottie animationData={likeAnimation} style={{ width: 32, height: 32, opacity: 0.9 }} />
    );
  };

  const handleReact = async (reactionType) => {
    if (!isAuthenticated) {
      loginWithRedirect(); // Redirect to login if not authenticated
      return;
    }

    if (!currentUser) {
      console.log("User data not yet available");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const newReaction = userReaction === reactionType ? null : reactionType;

      // Optimistically update UI
      setUserReaction(newReaction);
      setReactionCounts((prev) => {
        const updatedCounts = { ...prev };
        if (userReaction) updatedCounts[userReaction] = Math.max(0, (updatedCounts[userReaction] || 0) - 1);
        if (newReaction) updatedCounts[newReaction] = (updatedCounts[newReaction] || 0) + 1;
        return updatedCounts;
      });

      setTotalReactions((prev) => {
        if (userReaction && !newReaction) return prev - 1;
        if (!userReaction && newReaction) return prev + 1;
        return prev;
      });

      // Send only userId and reactionType - the backend will fetch username from user schema
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${post._id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId, 
          reactionType: newReaction
        }),
      });

      if (!response.ok) throw new Error("Failed to update reaction");

      const data = await response.json();
      setReactionCounts(data.data.reactions);
      setTotalReactions(data.data.totalReactions);
      
      // Find the user's reaction in the updated reactedBy array
      if (currentUser && currentUser.username) {
        const userReactionData = data.data.reactedBy.find(r => r.username === currentUser.username);
        setUserReaction(userReactionData?.reactionType || null);
      }

    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <motion.div
        className="cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-full transition-colors"
        onClick={() => handleReact(userReaction || 'like')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          initial={{ scale: 1 }}
          animate={{ scale: userReaction ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.2 }}
        >
          {getCurrentReactionIcon()}
        </motion.span>
        <span className={`text-sm font-medium ${userReaction ? reactions[userReaction].color : 'text-gray-500'}`}>
          {totalReactions > 0 ? totalReactions : ""}
        </span>
      </motion.div>

      <AnimatePresence>
        {hovering && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg flex gap-1 border border-gray-200 dark:border-gray-700"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          >
            {Object.entries(reactions).map(([type, { animation, label }]) => (
              <motion.button
                key={type}
                onClick={() => handleReact(type)}
                className={`relative group p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all
                  ${userReaction === type ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Lottie animationData={animation} style={{ width: 32, height: 32 }} />
                <motion.span
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-black text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap"
                  initial={{ y: -4 }}
                  animate={{ y: 0 }}
                >
                  {label}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionButton;
