import express from 'express';
import * as dotenv from 'dotenv';
import Post from '../mongodb/models/post.js'; // Update as needed
import { uploadImage } from '../services/azureBlobService.js'; // Update as needed

dotenv.config();
const router = express.Router();

// GET ALL POSTS
router.route('/').get(async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});

// CREATE A POST
router.route('/').post(async (req, res) => {
  try {
    const { name, prompt, photo } = req.body;
    const photoUrl = await uploadImage(photo, `post-${Date.now()}.jpeg`); // Upload image to Blob storage

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl,
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: error });
  }
});

export default router;
