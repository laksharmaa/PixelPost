// import express from 'express';
// import * as dotenv from 'dotenv';
// import OpenAI from 'openai';

// dotenv.config();
// const router = express.Router();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// router.get('/', (req, res) => {
//   res.send('hello from backend');
// });

// router.post('/', async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     const aiResponse = await openai.images.generate({
//       prompt,
//       n: 1,
//       size: '1024x1024',
//       response_format: 'b64_json',
//     });

//     const image = aiResponse.data[0].b64_json;
//     res.status(200).json({ photo: image });
//   } catch (error) {
//     console.error('Error generating image:', error);
//     res.status(500).json({
//       message: 'Failed to generate image',
//       error: error.response?.data?.error?.message || error.message,
//     });
//   }
// });

// export default router;


import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: "You are an expert in image prompt engineering. Your task is to refine and enhance the given user input to make it more detailed, descriptive, and grammatically correct for an AI image generation model. Improve clarity, add relevant details, and correct any mistakes while maintaining the original intent. Ensure that the final prompt includes specific attributes like colors, lighting, environment, perspective, style, and subject details if applicable. Keep it concise yet vivid and only include the enhanced prompt in the response. Here is the user’s input: "
});

router.get('/', (req, res) => {
  res.send('hello from backend');
});

router.post('/', async (req, res) => {
  try {
    let { prompt } = req.body;
    
    // Step 1: Enhance prompt using Gemini API
    const geminiResponse = await model.generateContent(prompt);
    const enhancedPrompt = geminiResponse.response.text();
    console.log("Enhanced Prompt:", enhancedPrompt);

    // Step 2: Generate image using OpenAI API
    const aiResponse = await openai.images.generate({
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const image = aiResponse.data[0].b64_json;
    console.log("Image Generated Successfully");
    try{// Step 3: Extract tags from the generated image using Gemini API
      const tagPrompt = `Analyze the following image and provide 10 relevant tags that best describe its content. Only return the tags in an array format: \n\n[IMAGE_DATA]`;
      const tagResponse = await model.generateContent(tagPrompt.replace("[IMAGE_DATA]", image));
      const tags = JSON.parse(tagResponse.response.text());
      console.log("Generated Tags:", tags);
    } catch (error) {
      console.error('Error extracting tags:', error);
    }
    res.status(200).json({ photo: image});
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      message: 'Failed to process request',
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

export default router;

