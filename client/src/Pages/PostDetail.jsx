import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '../components/Loader';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';

const PostDetail = () => {
  const { id } = useParams(); // Get post ID from URL
  const { getAccessTokenSilently } = useAuth0();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false); // Toggle comments
  const [hasLiked, setHasLiked] = useState(false); // Track if user has liked

  const fetchPost = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPost(result.data);
        setLikeCount(result.data.likes);
        setHasLiked(result.data.hasLiked); // Track if user has already liked
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (hasLiked) return; // Prevent multiple likes from same user

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setLikeCount((prev) => prev + 1);
        setHasLiked(true); // Update to indicate user has liked
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment) return;

    try {
      const token = await getAccessTokenSilently();
      const userInfo = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { sub: userId } = await userInfo.json();

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment, userId }),
      });

      if (response.ok) {
        setPost((prev) => ({
          ...prev,
          comments: [...prev.comments, { comment: newComment, createdAt: new Date() }],
        }));
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <section className="max-w-4xl mx-auto bg-gray-900 text-white min-h-screen p-8 rounded-xl">
      {loading ? (
        <Loader />
      ) : post ? (
        <>
          <div className="flex flex-col items-center">
            <img src={post.photo} alt={post.prompt} className="rounded-lg mb-4 w-full max-h-96 object-cover" />
            <h2 className="text-lg font-mono mb-2">{post.prompt}</h2>
            <p className="text-gray-400 mb-4">Posted by: {post.name}</p>

            <div className="flex gap-6 mb-6">
              {/* Like button with icon */}
              <button onClick={handleLike} className="text-white flex items-center gap-1">
                {hasLiked ? (
                  <FavoriteIcon style={{ color: 'red' }} /> // Filled heart icon if liked
                ) : (
                  <FavoriteBorderIcon />
                )}
                {likeCount}
              </button>

              {/* Views with icon */}
              <div className="text-white flex items-center gap-1">
                <RemoveRedEyeOutlinedIcon />
                {post.views}
              </div>

              {/* Comments toggle button */}
              <button onClick={() => setShowComments(!showComments)} className="text-white flex items-center gap-1">
                <ChatBubbleOutlineRoundedIcon />
                {post.commentCount}
              </button>
            </div>
          </div>

          <hr className="my-6" />

          {/* Comments Section */}
          {showComments && (
            <div className="comments">
              <h3 className="text-xl font-bold mb-4">Comments ({post.comments.length})</h3>
              <ul>
                {post.comments.map((comment, index) => (
                  <li key={index} className="mb-2 text-gray-300">
                    {comment.comment} - <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 text-white bg-gray-800 rounded-md mb-2 resize-none focus:outline-none"
                  placeholder="Add a comment..."
                  rows="3"
                ></textarea>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">
                  Submit Comment
                </button>
              </form>
            </div>
          )}
        </>
      ) : (
        <p>Post not found.</p>
      )}
    </section>
  );
};

export default PostDetail;
