import express from 'express';
import * as dotenv from 'dotenv';
import Post from '../mongodb/models/post.js';
import Comment from '../mongodb/models/comment.js';
import { uploadImage } from '../services/azureBlobService.js';

dotenv.config();
const router = express.Router();

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

// GET A SPECIFIC POST BY ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('comments');
    
    if (post) {
      res.status(200).json({ success: true, data: post });
    } else {
      res.status(404).json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Error fetching post' });
  }
});


// GET ALL POSTS FOR A SPECIFIC USER
router.get('/user-posts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userPosts = await Post.find({ userId });
    res.status(200).json({ success: true, data: userPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching user posts' });
  }
});

// LIKE A POST
router.post('/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Error liking post' });
  }
});

// ADD A COMMENT TO A POST
router.post('/:id/comment', async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, comment } = req.body;

    // Create new comment
    const newComment = await Comment.create({ postId, userId, comment });

    // Update post with new comment and increment commentCount
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment._id }, $inc: { commentCount: 1 } },
      { new: true }
    );

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});


// CREATE A POST
router.post('/', async (req, res) => {
  try {
    const { name, prompt, photo, userId } = req.body;
    const photoUrl = await uploadImage(photo, `post-${Date.now()}.jpeg`);

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl,
      userId,
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: error });
  }
});

export default router;
