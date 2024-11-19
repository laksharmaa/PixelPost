import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '../components/Loader';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
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
      setPost((prev) => ({ ...prev, views: newViewCount }));
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

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/${hasLiked ? 'unlike' : 'like'}`, {
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
        console.error("Error toggling like status");
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

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <section 
      className="max-w-4xl mx-auto min-h-screen p-4 sm:p-8 rounded-xl transition-colors duration-300 ease-in-out 
                 bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex flex-col items-center justify-center"
    >
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : post ? (
        <>
          <div className="flex flex-col items-center w-full">
            <img 
              src={post.photo} 
              alt={post.prompt} 
              className="rounded-lg mb-4 w-full max-w-screen-md object-contain"
              style={{ maxHeight: '512px' }} // Reduce max height for smaller devices
            />
            <h2 className="text-base sm:text-lg font-mono mb-2 text-center px-2">{post.prompt}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
              Posted by: {post.name}
            </p>
  
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <button onClick={handleLike} className="flex items-center gap-1 text-sm sm:text-base">
                {hasLiked ? (
                  <FavoriteIcon style={{ color: 'red' }} />
                ) : (
                  <FavoriteBorderIcon className="text-gray-600 dark:text-white" />
                )}
                <span className="text-gray-900 dark:text-white">{likeCount}</span>
              </button>
  
              <div className="flex items-center gap-1 text-sm sm:text-base">
                <RemoveRedEyeOutlinedIcon className="text-gray-600 dark:text-white" />
                <span className="text-gray-900 dark:text-white">{post.views}</span>
              </div>
  
              <button 
                onClick={() => setShowComments(!showComments)} 
                className="flex items-center gap-1 text-gray-900 dark:text-white text-sm sm:text-base"
              >
                <ChatBubbleOutlineRoundedIcon />
                {post.commentCount}
              </button>
            </div>
          </div>
  
          <hr className="my-6 border-gray-300 dark:border-gray-700 w-full" />
  
          {showComments && (
            <div className="comments w-full">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-center sm:text-left">Comments ({post.comments.length})</h3>
              <ul className="px-2 sm:px-4">
                {post.comments.map((comment, index) => (
                  <li 
                    key={index} 
                    className="mb-2 text-gray-800 dark:text-gray-300 text-sm sm:text-base"
                  >
                    {comment.comment} - 
                    <small className="text-gray-500 dark:text-gray-400 ml-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
              {isAuthenticated && (
                <form onSubmit={handleCommentSubmit} className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-md mb-2 resize-none focus:outline-none text-sm sm:text-base"
                    placeholder="Add a comment..."
                    rows="3"
                  ></textarea>
                  <button 
                    type="submit" 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors w-full sm:w-auto"
                  >
                    Submit Comment
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-900 dark:text-white text-center">Post not found.</p>
      )}
    </section>
  );
  
  
};

export default PostDetail;
