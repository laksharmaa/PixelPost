  // routes/userPost.js
import express from 'express';
import * as dotenv from 'dotenv';
import UserPost from '../mongodb/models/userPost.js';
import Post from '../mongodb/models/post.js';
import Comment from '../mongodb/models/comment.js';
import User from '../mongodb/models/user.js';
import { uploadImage } from '../services/azureBlobService.js';
import loginOrCreateUser from '../utils/loginOrCreateUser.js';

dotenv.config();
const router = express.Router();

// CREATE A USER POST AND SHARE IT TO THE COMMUNITY
router.post('/', async (req, res) => {
  try {
    const { name, prompt, photo, userId, email } = req.body;
    await loginOrCreateUser(userId, name, email);

    const photoUrl = await uploadImage(photo, `userpost-${Date.now()}.jpeg`);
    const newUserPost = await UserPost.create({ name, prompt, photo: photoUrl, userId });

    res.status(201).json({ success: true, data: newUserPost });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// routes/userPost.js
router.get('/user-posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Aggregate posts and ensure uniqueness by grouping by _id
    const userPosts = await UserPost.aggregate([
      { $match: { userId } },
      { $group: { _id: "$_id", post: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$post" } } // Replace root to get the actual document structure
    ]);

    if (!userPosts.length) {
      return res.status(404).json({ success: false, message: 'No posts found for this user' });
    }

    res.status(200).json({ success: true, data: userPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching user posts' });
  }
});

// DELETE A USER POST AND CLEAN UP ASSOCIATED DATA
router.delete('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log("Received post ID for deletion:", postId);
    // Find the user post to delete
    const userPost = await UserPost.findById(postId);
    if (!userPost) {
      console.log("User post not found in UserPost collection");
      return res.status(404).json({ success: false, message: 'User post not found' });
    }

    const { userId } = userPost;

    // Delete associated comments
    await Comment.deleteMany({ postId });

    // Delete from Post collection if it exists
    await Post.findByIdAndDelete(postId);

    // Delete from UserPost collection
    await UserPost.findByIdAndDelete(postId);

    // Update the user's postCount, likeCount, and commentCount
    const user = await User.findOne({ userId });
    if (user) {
      user.postCount = Math.max(0, user.postCount - 1);
      user.likeCount = Math.max(0, user.likeCount - (userPost.likes || 0));
      user.commentCount = Math.max(0, user.commentCount - (userPost.commentCount || 0));
      await user.save();
    }

    res.status(200).json({ success: true, message: 'User post deleted successfully' });
  } catch (error) {
    console.error('Error deleting user post:', error);
    res.status(500).json({ success: false, message: 'Error deleting user post' });
  }
});


export default router;