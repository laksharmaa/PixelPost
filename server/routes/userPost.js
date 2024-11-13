  // routes/userPost.js
import express from 'express';
import * as dotenv from 'dotenv';
import UserPost from '../mongodb/models/userPost.js';
import Post from '../mongodb/models/post.js';
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

export default router;