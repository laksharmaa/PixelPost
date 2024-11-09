import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import User from '../mongodb/models/user.js';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.route('/').post(async (req, res) => {
    try {
        const { prompt, userId } = req.body; // Assume `userId` is passed from the frontend

        // Retrieve user data
        const user = await User.findOne({ userId });

        // Check if user has reached the image generation limit
        if (user && user.imageGenerationCount >= 2) {
            return res.status(403).json({
                success: false,
                message: "You have reached the limit of 2 generated images. This feature will be available in upcoming updates.",
            });
        }

        // Proceed with generating the image if limit is not reached
        const aiResponse = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
        });

        const image = aiResponse.data[0].b64_json;

        // Increment the user's image generation count
        await User.findByIdAndUpdate(user._id, { $inc: { imageGenerationCount: 1 } });

        res.status(200).json({ photo: image });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            message: 'Failed to generate image',
            error: error.response?.data?.error?.message || error.message,
        });
    }
});

export default router;
