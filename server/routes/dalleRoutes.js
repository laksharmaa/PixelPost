import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get('/', (req, res) => {
  res.send('hello from backend');
});

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    const aiResponse = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const image = aiResponse.data[0].b64_json;
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
