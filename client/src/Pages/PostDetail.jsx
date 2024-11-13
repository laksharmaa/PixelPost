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

        // Increment the view count when the post is loaded
        updateViewCount(result.data.views + 1);

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
    if (!isAuthenticated) {
      alert("Please log in to like this post.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const userId = user?.sub;

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/post/${id}/${hasLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setLikeCount((prev) => hasLiked ? prev - 1 : prev + 1);
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
  
        // Add new comment directly to the post's comments in the UI
        setPost((prev) => ({
          ...prev,
          comments: [
            ...prev.comments,
            {
              ...newCommentData.data, // use newCommentData.data to access the new comment details
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
    <section className="max-w-4xl mx-auto bg-gray-900 text-white min-h-screen p-8 rounded-xl">
      {loading ? (
        <Loader />
      ) : post ? (
        <>
          <div className="flex flex-col items-center">
            <img 
              src={post.photo} 
              alt={post.prompt} 
              className="rounded-lg mb-4 w-full max-w-screen-md object-contain"
              style={{ maxHeight: '1024px' }}
            />
            <h2 className="text-lg font-mono mb-2">{post.prompt}</h2>
            <p className="text-gray-400 mb-4">Posted by: {post.name}</p>

            <div className="flex gap-6 mb-6">
              <button onClick={handleLike} className="text-white flex items-center gap-1">
                {hasLiked ? (
                  <FavoriteIcon style={{ color: 'red' }} />
                ) : (
                  <FavoriteBorderIcon />
                )}
                {likeCount}
              </button>

              <div className="text-white flex items-center gap-1">
                <RemoveRedEyeOutlinedIcon />
                {post.views}
              </div>

              <button onClick={() => setShowComments(!showComments)} className="text-white flex items-center gap-1">
                <ChatBubbleOutlineRoundedIcon />
                {post.commentCount}
              </button>
            </div>
          </div>

          <hr className="my-6" />

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
              {isAuthenticated && (
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
              )}
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
