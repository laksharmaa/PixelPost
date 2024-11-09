import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})
router.route('/').get((req, res) => {
    res.send('hello from backend');
});

router.route('/').post(async (req, res) => {
    try {
        // console.log("Request Body: ", req.body);
        const { prompt } = req.body;

        const aiResponse = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
        });
        console.log(aiResponse);

        const image = aiResponse.data[0].b64_json;
        res.status(200).json({ photo: image });
    } catch (error) {
        console.error('Error generating image:', error); // Log the entire error for debugging
        res.status(500).json({
            message: 'Failed to generate image',
            error: error.response?.data?.error?.message || error.message,
        });
    }
});


export default router; 