import { generateImageForUser } from '../services/imageGenerationService.js';

export const health = (req, res) => res.send('hello from backend');

export const generate = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const result = await generateImageForUser(userId, req.body.prompt);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    res.status(200).json({ ...result, tags: [] });
  } catch (error) {
    console.error('Image generation failed:', error.name || 'Error');
    res.status(500).json({
      message: 'Failed to process request',
      error: 'Image generation is temporarily unavailable'
    });
  }
};