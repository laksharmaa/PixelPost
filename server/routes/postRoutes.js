import express from 'express';
import * as dotenv from 'dotenv';
import Post from '../mongodb/models/post.js';
import Comment from '../mongodb/models/comment.js';
import loginOrCreateUser from '../utils/loginOrCreateUser.js';
import { uploadImage } from '../services/azureBlobService.js';

dotenv.config();
const router = express.Router();

// CREATE A POST
router.post('/', async (req, res) => {
  try {
    const { name, prompt, photo, userId, email } = req.body;
    await loginOrCreateUser(userId, name, email);

    const photoUrl = await uploadImage(photo, `post-${Date.now()}.jpeg`);
    const newPost = await Post.create({ name, prompt, photo: photoUrl, userId, likedBy: [] });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});

// GET ALL POSTS FOR A SPECIFIC USER
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userPosts = await Post.find({ userId });
    
    if (!userPosts.length) {
      return res.status(404).json({ success: false, message: 'No posts found for this user' });
    }

    res.status(200).json({ success: true, data: userPosts });
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

// LIKE A POST
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Ensure userId is present
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required to like a post' });
    }

    await loginOrCreateUser(userId);

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (!post.likedBy.includes(userId)) {
      post.likes += 1;
      post.likedBy.push(userId);
      await post.save();
      res.status(200).json({ success: true, data: post });
    } else {
      res.status(400).json({ success: false, message: 'User has already liked this post' });
    }
  } catch (error) {
    console.error('Error in like route:', error);
    res.status(500).json({ success: false, message: 'Error liking post' });
  }
});

// UNLIKE A POST
router.post('/:id/unlike', async (req, res) => {
  try {
    const { userId } = req.body;
    await loginOrCreateUser(userId);

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.likedBy.includes(userId)) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(id => id !== userId);
      await post.save();
      res.status(200).json({ success: true, data: post });
    } else {
      res.status(400).json({ success: false, message: 'User has not liked this post' });
    }
  } catch (error) {
    console.error('Error in unlike route:', error);
    res.status(500).json({ success: false, message: 'Error unliking post' });
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

export default router;
