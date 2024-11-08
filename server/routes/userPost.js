import express from 'express';
import * as dotenv from 'dotenv';
import UserPost from '../mongodb/models/userPost.js';
import Post from '../mongodb/models/post.js';
import { uploadImage } from '../services/azureBlobService.js';

dotenv.config();
const router = express.Router();

// CREATE A USER POST AND SHARE IT TO THE COMMUNITY
router.route('/').post(async (req, res) => {
  try {
    const { name, prompt, photo } = req.body;
    const userId = req.auth.sub // Auth0 user ID

    const photoUrl = await uploadImage(photo, `userpost-${Date.now()}.jpeg`);

    const newUserPost = await UserPost.create({
      name,
      prompt,
      photo: photoUrl,
      userId,
    });

    const newCommunityPost = await Post.create({
      name,
      prompt,
      photo: photoUrl,
    });

    res.status(201).json({ success: true, data: { newUserPost, newCommunityPost } });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL POSTS FOR A SPECIFIC USER
router.route('/').get(async (req, res) => {
  try {
    const userId = req.auth && req.auth.sub; // Extract user ID from token

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userPosts = await UserPost.find({ userId });  // Find posts associated with the user ID
    res.status(200).json({ success: true, data: userPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching user posts' });
  }
});

export default router;
