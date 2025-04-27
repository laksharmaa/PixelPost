import express from 'express';
import * as dotenv from 'dotenv';
import Post from '../mongodb/models/post.js';
import Comment from '../mongodb/models/comment.js';
import User from '../mongodb/models/user.js';
import loginOrCreateUser from '../utils/loginOrCreateUser.js';
import { uploadImage } from '../services/azureBlobService.js';
import { deleteImage } from '../services/azureBlobService.js';
import { createNotification } from '../services/notificationService.js';
import { findSimilarPosts } from '../utils/tagSimilarity.js'; 

dotenv.config();
const router = express.Router();

// In postRoutes.js - CREATE A POST route
router.post('/', async (req, res) => {
  try {
    const { name, prompt, photo, userId, email, username, tags } = req.body;
    
    // Create the post with tags
    const photoUrl = await uploadImage(photo, `post-${Date.now()}.jpeg`);
    const newPost = await Post.create({ 
      name, 
      prompt, 
      photo: photoUrl, 
      userId, 
      username, 
      likedBy: [],
      tags: tags || [] // Save tags if provided, otherwise empty array
    });

    // Update user's post count
    await User.findOneAndUpdate(
      { userId },
      { $inc: { postCount: 1 } }
    );

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL POSTS WITH PAGINATION
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .sort({ createdAt: -1 }) // Latest posts first
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      data: posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    console.error('Error fetching posts:', error.stack);
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});

// GET ALL POSTS FOR A SPECIFIC USER WITH PAGINATION
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default values for pagination

    const userPosts = await Post.find({ userId })
      .sort({ createdAt: -1 }) // Sort by latest
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({ userId });

    if (!userPosts.length) {
      return res.status(404).json({ success: false, message: 'No posts found for this user' });
    }

    res.status(200).json({ 
      success: true, 
      data: userPosts,
      hasMore: page * limit < totalPosts // Check if there are more posts to load
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching user posts' });
  }
});


// GET A SPECIFIC POST BY ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments');
    if (post) {
      res.status(200).json({ success: true, data: post });
    } else {
      console.error(`Post not found for ID: ${req.params.id}`);
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Error fetching post' });
  }
});

// Optimized Like Route - Now with notifications
router.post('/:id/like', async (req, res) => {
  try {
    const { userId, username } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Only add to likedBy and increment likes if not already liked
    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likes += 1;
      await post.save();

      // Create a notification only if the liker is not the post owner
      if (userId !== post.userId) {
        await createNotification(req, {
          userId: post.userId, // Recipient
          type: 'like',
          message: `${username || userId} liked your post`,
          fromUser: {
            userId,
            username: username || userId
          },
          postId: post._id.toString(),
          postImage: post.photo
        });
      }
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error during like operation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during like operation' 
    });
  }
});

// Unlike route - Modified
router.post('/:id/unlike', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Only remove from likedBy and decrement likes if already liked
    const index = post.likedBy.indexOf(userId);
    if (index !== -1) {
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error during unlike operation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during unlike operation' 
    });
  }
});

// ADD A COMMENT TO A POST
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, comment } = req.body;
    await loginOrCreateUser(userId);

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Get the username from user schema
    const user = await User.findOne({ userId });
    if (!user || !user.username) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found or username not set' 
      });
    }
    const username = user.username; // Use username from user schema

    const newComment = await Comment.create({ 
      postId: req.params.id, 
      userId, 
      comment,
      username: username // Use username from user schema
    });
    
    post.comments.push(newComment._id);
    post.commentCount += 1;
    await post.save();

    // Create a notification if the commenter is not the post owner
    if (userId !== post.userId) {
      await createNotification(req, {
        userId: post.userId,
        type: 'comment',
        message: `${username} commented on your post: "${comment.substring(0, 30)}${comment.length > 30 ? '...' : ''}"`,
        fromUser: {
          userId,
          username: username // Use username from user schema
        },
        postId: post._id.toString(),
        postImage: post.photo
      });
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});

// Bookmark a post - Now with notifications
router.post('/:id/bookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Get the username from user schema
    const user = await User.findOne({ userId });
    if (!user || !user.username) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found or username not set' 
      });
    }
    const username = user.username; // Use username from user schema

    // Only add to bookmarks if not already bookmarked
    if (!post.bookmarkedBy.includes(userId)) {
      post.bookmarkedBy.push(userId);
      await post.save();
    }

    // Update user's bookmarks
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $addToSet: { bookmarks: req.params.id } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create a notification if the bookmarker is not the post owner
    if (userId !== post.userId) {
      await createNotification(req, {
        userId: post.userId,
        type: 'bookmark',
        message: `${username} bookmarked your post`,
        fromUser: {
          userId,
          username: username // Use username from user schema
        },
        postId: post._id.toString(),
        postImage: post.photo
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { post, bookmarks: updatedUser.bookmarks } 
    });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ success: false, message: 'Error bookmarking post' });
  }
});

// Remove bookmark
router.post('/:id/unbookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Update both Post and User models
    const [post, user] = await Promise.all([
      Post.findByIdAndUpdate(
        req.params.id,
        { $pull: { bookmarkedBy: userId } },
        { new: true }
      ),
      User.findOneAndUpdate(
        { userId },
        { $pull: { bookmarks: req.params.id } },
        { new: true }
      )
    ]);

    if (!post || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post or User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { post, bookmarks: user.bookmarks } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing bookmark' });
  }
});

// Backend route to handle view increment
router.post('/:id/view', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Increment views by 1
      { new: true }
    );

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ success: false, message: 'Error updating view count' });
  }
});

// DELETE A POST AND CLEAN UP ASSOCIATED DATA
router.delete('/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post to delete
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const { userId, photo } = post; // Get userId and photo URL

    // Delete the image from Azure Blob Storage
    try {
      await deleteImage(photo);
    } catch (blobError) {
      console.error("Failed to delete image from Azure Blob Storage:", blobError.message);
      // Continue with post deletion even if image deletion fails
    }

    // Delete associated comments
    await Comment.deleteMany({ postId });

    // Remove the post
    await Post.findByIdAndDelete(postId);

    // Update the user's postCount, likeCount, and commentCount
    const user = await User.findOne({ userId });
    if (user) {
      user.postCount = Math.max(0, user.postCount - 1);
      user.likeCount = Math.max(0, user.likeCount - post.likes);
      user.commentCount = Math.max(0, user.commentCount - post.commentCount);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Post and associated image deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
});


// Get user's bookmarked posts
router.get('/bookmarks/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ 
      bookmarkedBy: req.params.userId 
    });

    res.status(200).json({ 
      success: true, 
      data: posts 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookmarks' 
    });
  }
});


// Reaction handling route
router.post('/:id/react', async (req, res) => {
  try {
    const { userId, reactionType } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Get the username from user schema
    const user = await User.findOne({ userId });
    if (!user || !user.username) {
      return res.status(400).json({ success: false, message: 'User not found or username not set' });
    }
    const username = user.username; // Use username from user schema

    const existingReactionIndex = post.reactedBy.findIndex(r => r.username === username);
    let previousReaction = null;

    // Helper function to create emoji for reactions
    const getReactionEmoji = (type) => {
      switch(type) {
        case 'like': return '👍';
        case 'love': return '❤️';
        case 'haha': return '😂';
        case 'wow': return '😮';
        case 'fire': return '🔥';
        default: return '';
      }
    };
    
    if (existingReactionIndex !== -1) {
      previousReaction = post.reactedBy[existingReactionIndex].reactionType;

      if (!reactionType || previousReaction === reactionType) {
        // Remove reaction if same one is clicked again
        post.reactedBy.splice(existingReactionIndex, 1);
        post.reactions[previousReaction] = Math.max(0, (post.reactions[previousReaction] || 0) - 1);
        post.totalReactions = Math.max(0, post.totalReactions - 1);
      } else {
        // Change reaction type - store username from user schema
        post.reactedBy[existingReactionIndex] = { 
          username: username, // Store actual username from user schema
          reactionType: reactionType 
        };
        post.reactions[previousReaction] = Math.max(0, (post.reactions[previousReaction] || 0) - 1);
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
        
        // Create notification for reaction change if the reactor is not the post owner
        if (userId !== post.userId) {
          const emoji = getReactionEmoji(reactionType);
          await createNotification(req, {
            userId: post.userId,
            type: 'reaction',
            reactionType: reactionType,
            message: `${username} changed their reaction to ${emoji} on your post`,
            fromUser: {
              userId,
              username: username // Use username from user schema
            },
            postId: post._id.toString(),
            postImage: post.photo
          });
        }
      }
    } else if (reactionType) {
      // Add new reaction with username from user schema
      post.reactedBy.push({ 
        username: username, // Use username from user schema
        reactionType 
      });
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      post.totalReactions += 1;
      
      // Create notification for new reaction if the reactor is not the post owner
      if (userId !== post.userId) {
        const emoji = getReactionEmoji(reactionType);
        await createNotification(req, {
          userId: post.userId,
          type: 'reaction',
          reactionType: reactionType,
          message: `${username} reacted with ${emoji} to your post`,
          fromUser: {
            userId,
            username: username // Use username from user schema
          },
          postId: post._id.toString(),
          postImage: post.photo
        });
      }
    }

    // Save updated post
    await post.save();
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ success: false, message: 'Server error during reaction operation' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1, threshold = 0.1 } = req.query;
    
    // Find the current post
    const currentPost = await Post.findById(id);
    if (!currentPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // If no tags, return empty result
    if (!currentPost.tags || currentPost.tags.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [], 
        message: 'No tags available for similarity matching'
      });
    }
    
    // Calculate how many posts to skip based on page
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);
    
    // Fetch all posts (we'll filter to the limit later based on similarity)
    // In a production environment, you might need pagination for large collections
    const allPosts = await Post.find({ _id: { $ne: id } });
    
    // Find similar posts using the utility function
    const similarPosts = findSimilarPosts(
      currentPost, 
      allPosts, 
      Number.MAX_SAFE_INTEGER, // Get all similar posts first
      parseFloat(threshold)
    );
    
    // Apply pagination manually after similarity sorting
    const paginatedResults = similarPosts.slice(skip, skip + pageLimit);
    
    // Return the results
    return res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: similarPosts.length,
        page: parseInt(page),
        limit: pageLimit,
        totalPages: Math.ceil(similarPosts.length / pageLimit),
        hasMore: skip + pageLimit < similarPosts.length
      }
    });
  } catch (error) {
    console.error('Error finding similar posts:', error);
    return res.status(500).json({ success: false, message: 'Error finding similar posts' });
  }
});

export default router;

