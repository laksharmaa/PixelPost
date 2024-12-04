import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../components/Loader";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";

// Fetch Post Function
const fetchPost = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}`);
  if (!response.ok) throw new Error("Failed to fetch post");
  return response.json();
};

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, getAccessTokenSilently, user, loginWithRedirect } = useAuth0();
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  const likeMutation = useMutation({
    mutationFn: async ({ liked }) => {
      const token = await getAccessTokenSilently();
      const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/${liked ? "unlike" : "like"}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user?.sub }),
      });
      if (!response.ok) throw new Error("Failed to toggle like");
      return response.json();
    },
    onMutate: async ({ liked }) => {
      setIsLiking(true);
      const prevData = queryClient.getQueryData(["post", id]);
      queryClient.setQueryData(["post", id], (old) => ({
        ...old,
        data: {
          ...old.data,
          likes: liked ? old.data.likes - 1 : old.data.likes + 1,
          likedBy: liked
            ? old.data.likedBy.filter((uid) => uid !== user?.sub)
            : [...old.data.likedBy, user?.sub],
        },
      }));
      return { prevData };
    },
    onError: (error, { liked }, context) => {
      queryClient.setQueryData(["post", id], context.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["post", id]);
      setIsLiking(false);
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      alert("Please log in to like this post.");
      loginWithRedirect();
      return;
    }
    likeMutation.mutate({ liked: postQuery.data?.data?.likedBy.includes(user?.sub) });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to comment.");
      loginWithRedirect();
      return;
    }
    if (!newComment.trim()) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment, userId: user?.sub }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        queryClient.setQueryData(["post", id], (old) => ({
          ...old,
          data: {
            ...old.data,
            comments: [...old.data.comments, newCommentData.data],
            commentCount: old.data.commentCount + 1,
          },
        }));
        setNewComment("");
      } else {
        console.error("Error adding comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (postQuery.isLoading) return <Loader />;
  if (postQuery.isError) return <p>Error loading post.</p>;

  const post = postQuery.data?.data || {};
  const hasLiked = post.likedBy?.includes(user?.sub);

  return (
    <div className="max-w-5xl mx-auto min-h-screen p-4 sm:p-8 rounded-2xl transition-colors ease-out duration-300 bg-white dark:bg-gray-900 dark:text-white text-gray-900">
      {post ? (
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-md">
          {/* Post Image */}
          <div className="md:w-2/3 mb-4 md:mb-0">
            <img
              src={post.photo}
              alt="Post"
              className="w-full h-96 object-cover rounded-2xl md:rounded-2xl-md md:rounded-r-none"
            />
          </div>

          {/* Post Content */}
          <div className="md:w-1/3 py-10 ml-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AccountCircleSharpIcon className="w-12 h-12 bg-gray-300 rounded-full text-gray-800 dark:text-white" />
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold">{post.name}</p>
                  <p className="text-gray-500 text-sm dark:text-gray-300">
                    Posted {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Prompt */}
            <div className="mb-4">
              <p className="text-gray-800 dark:text-white">{post.prompt}</p>
            </div>

            {/* Like, Comment & View Count Section */}
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1"
                >
                  {hasLiked ? <FavoriteIcon style={{ color: "red" }} /> : <FavoriteBorderIcon />}
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1"
                >
                  <ChatBubbleOutlineRoundedIcon />
                  <span>{post.commentCount}</span>
                </button>
                <div className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1">
                  <RemoveRedEyeOutlinedIcon />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            {showComments && (
              <div>
                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-0"
                    rows={1}
                    placeholder="Add a comment..."
                  />
                  <button
                    type="submit"
                    className="flex justify-center items-center p-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-gray-700 dark:text-gray-300"
                      viewBox="0 0 30.000000 30.000000"
                    >
                      <g
                        transform="translate(0.000000,30.000000) scale(0.100000,-0.100000)"
                        fill="currentColor"
                        stroke="none"
                      >
                        <path d="M44 256 c-3 -8 -4 -29 -2 -48 3 -31 5 -33 56 -42 28 -5 52 -13 52 -16 0 -3 -24 -11 -52 -16 -52 -9 -53 -9 -56 -48 -2 -21 1 -43 6 -48 10 -10 232 97 232 112 0 7 -211 120 -224 120 -4 0 -9 -6 -12 -14z"></path>
                      </g>
                    </svg>
                  </button>
                </form>

                <div className="mt-4 h-64 overflow-y-auto">
                  {showComments && (
                    <div className="mt-6 space-y-4">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="border-b p-2">
                          <div className="flex items-center mb-2">
                            <AccountCircleSharpIcon className="w-8 h-8 bg-gray-300 rounded-full" />
                            <p className="ml-3 font-semibold text-gray-800 dark:text-white">User</p>
                          </div>
                          <p className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleString()}</p>
                          <p className="text-gray-600 dark:text-gray-300">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>No post found.</p>
      )}
    </div>
  );
};

export default PostDetail;