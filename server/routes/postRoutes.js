import express from 'express';
import * as dotenv from 'dotenv';
import Post from '../mongodb/models/post.js';
import Comment from '../mongodb/models/comment.js';
import User from '../mongodb/models/user.js';
import loginOrCreateUser from '../utils/loginOrCreateUser.js';
import { uploadImage } from '../services/azureBlobService.js';
import { deleteImage } from '../services/azureBlobService.js';

dotenv.config();
const router = express.Router();

// In postRoutes.js - CREATE A POST route
router.post('/', async (req, res) => {
  try {
    const { name, prompt, photo, userId, email,username } = req.body;
    
    // Create the post
    const photoUrl = await uploadImage(photo, `post-${Date.now()}.jpeg`);
    const newPost = await Post.create({ name, prompt, photo: photoUrl, userId, likedBy: [],username });

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

// Optimized Like/Unlike Routes
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        $addToSet: { likedBy: userId }, // Prevents duplicate entries
        $inc: { likes: 1 } 
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during like operation' 
    });
  }
});

router.post('/:id/unlike', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        $pull: { likedBy: userId },
        $inc: { likes: -1 } 
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
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

    const newComment = await Comment.create({ postId: req.params.id, userId, comment });
    await Post.findByIdAndUpdate(req.params.id, { $push: { comments: newComment._id }, $inc: { commentCount: 1 } });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
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


// Bookmark a post
router.post('/:id/bookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Update both Post and User models
    const [post, user] = await Promise.all([
      Post.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { bookmarkedBy: userId } },
        { new: true }
      ),
      User.findOneAndUpdate(
        { userId },
        { $addToSet: { bookmarks: req.params.id } },
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

    const existingReactionIndex = post.reactedBy.findIndex(r => r.username === userId);
    let updateQuery = {};

    if (existingReactionIndex !== -1) {
      const prevReaction = post.reactedBy[existingReactionIndex].reactionType;

      if (!reactionType || prevReaction === reactionType) {
        // ✅ Remove reaction if same one is clicked again
        post.reactedBy.splice(existingReactionIndex, 1);
        post.reactions[prevReaction] = Math.max(0, (post.reactions[prevReaction] || 0) - 1);
        post.totalReactions = Math.max(0, post.totalReactions - 1);
      } else {
        // ✅ Change reaction type
        post.reactedBy[existingReactionIndex].reactionType = reactionType;
        post.reactions[prevReaction] = Math.max(0, (post.reactions[prevReaction] || 0) - 1);
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      }
    } else {
      // ✅ Add new reaction
      post.reactedBy.push({ username: userId, reactionType });
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      post.totalReactions += 1;
    }

    // ✅ Save updated post
    await post.save();
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ success: false, message: 'Server error during reaction operation' });
  }
});

export default router;

