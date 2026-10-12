import User from '../mongodb/models/user.js';

export const generateImageForUser = async (userId, prompt) => {
  const user = await User.findOne({ userId });
  if (!user) return { error: { status: 404, message: 'User not found' } };
  if (user.credits < 1) {
    return {
      error: {
        status: 400,
        message: 'Insufficient credits to generate an image. Each generation costs 1 credit.'
      }
    };
  }

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('aspect_ratio', '1:1');
  formData.append('output_format', 'jpeg');
  formData.append('seed', '0');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      Accept: 'image/*',
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Stability API returned status ${response.status}`);
  }
  if (response.headers.get('finish-reason') === 'CONTENT_FILTERED') {
    throw new Error('Generation failed NSFW classifier');
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  user.credits -= 1;
  user.imageGenerationCount += 1;
  await user.save();

  return { photo: imageBuffer.toString('base64'), credits: user.credits };
};