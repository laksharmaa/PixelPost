import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '../components/Loader';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewUpdated, setViewUpdated] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    try {
      let headers = {};
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        headers = { Authorization: `Bearer ${token}` };
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}`, {
        headers,
      });
      const result = await response.json();

      if (result.success) {
        setPost(result.data);
        setLikeCount(result.data.likes);
        setViewCount(result.data.views);
        if (!viewUpdated) {
          updateViewCount(result.data.views + 1);
          setViewUpdated(true);
        }
        if (isAuthenticated && user) {
          setHasLiked(result.data.likedBy.includes(user.sub));
        }
      } else {
        console.error("Post not found.");
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateViewCount = async (newViewCount) => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ views: newViewCount }),
      });
      setViewCount(newViewCount);
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      alert("Please log in to like this post.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const userId = user.sub;

      const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/${hasLiked ? 'unlike' : 'like'}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
        setHasLiked(!hasLiked);
      } else {
        const errorData = await response.json();
        console.error("Error toggling like status:", errorData.message);
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to comment.");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const token = await getAccessTokenSilently();
      const userId = user?.sub;

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment, userId }),
      });

      if (response.ok) {
        const newCommentData = await response.json();

        setPost((prev) => ({
          ...prev,
          comments: [
            ...prev.comments,
            {
              ...newCommentData.data,
              createdAt: new Date().toISOString(),
            },
          ],
          commentCount: prev.commentCount + 1,
        }));
        setNewComment('');
      } else {
        console.error("Error adding comment");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
  };


  useEffect(() => {
    fetchPost();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto min-h-screen p-4 sm:p-8 rounded-xl transition-colors duration-300 ease-in-out bg-white dark:bg-gray-900 dark:text-white text-gray-900">
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : post ? (
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-6xl w-full">
          {/* Post Image */}
          <div className="md:w-2/3 mb-4 md:mb-0">
            <img
              src={post.photo}
              alt="Post Image"
              className="w-full h-96 object-contain rounded-md"
            />
          </div>

          {/* Post Content */}
          <div className="md:w-1/3 ml-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AccountCircleSharpIcon className="w-12 h-12 bg-gray-300 rounded-full flex justify-center items-center text-gray-800 dark:text-white" />
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold">{post.name}</p>
                  <p className="text-gray-500 text-sm dark:text-gray-300">Posted {new Date(post.createdAt).toLocaleString()}</p>
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
                <button onClick={handleLike} className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1">
                  {hasLiked ? (
                    <FavoriteIcon style={{ color: 'red' }} />
                  ) : (
                    <FavoriteBorderIcon className="text-gray-600 dark:text-white" />
                  )}
                  <span>{likeCount}</span>
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1">
                  <ChatBubbleOutlineRoundedIcon />
                  <span>{post.commentCount}</span>
                </button>
                <div className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1">
                  <RemoveRedEyeOutlinedIcon />
                  <span>{viewCount}</span>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mt-4">
              {/* Message container */}
              <div className="flex items-center rounded-full w-full max-w-md h-10 dark:bg-gray-800 shadow-sm transform translate-x-0 translate-y-0">
                {/* Input for the comment */}
                <textarea
                  value={newComment}
                  onChange={handleInputChange}
                  className="w-full p-2 dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-0"
                  rows={1}
                  placeholder="Add a comment..."
                  style={{ resize: 'none' }}
                />
                {/* Send Button */}
                <button type="submit" className="flex justify-center items-center p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 30.000000 30.000000" preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(0.000000,30.000000) scale(0.100000,-0.100000)" fill="#ffffff70" stroke="none">
                      <path d="M44 256 c-3 -8 -4 -29 -2 -48 3 -31 5 -33 56 -42 28 -5 52 -13 52 -16 0 -3 -24 -11 -52 -16 -52 -9 -53 -9 -56 -48 -2 -21 1 -43 6 -48 10 -10 232 97 232 112 0 7 -211 120 -224 120 -4 0 -9 -6 -12 -14z"></path>
                    </g>
                  </svg>
                </button>
              </div>
            </form>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-6 space-y-4">
                {post.comments.map((comment, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AccountCircleSharpIcon className="w-8 h-8 bg-gray-300 rounded-full" />
                      <p className="ml-3 font-semibold text-gray-800 dark:text-white">{comment.name}</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{comment.comment}</p>
                    <p className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>Post not found</div>
      )}
    </div>
  );
};

export default PostDetail;
