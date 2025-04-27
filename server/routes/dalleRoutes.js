import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI1 = new GoogleGenerativeAI(process.env.GEMINI_EXTRACT_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: "You are an expert in image prompt engineering. Your task is to refine and enhance the given user input to make it more detailed, descriptive, and grammatically correct for an AI image generation model. Improve clarity, add relevant details, and correct any mistakes while maintaining the original intent. Ensure that the final prompt includes specific attributes like colors, lighting, environment, perspective, style, and subject details if applicable. Keep it concise yet vivid and only include the enhanced prompt in the response. Here is the user's input: "
});

const model1 = genAI1.getGenerativeModel({ 
  model: "gemini-2.0-flash"
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

    // Step 2: Generate image using Stability AI's Stable Image Ultra API
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('aspect_ratio', '1:1'); // Default square aspect ratio
    formData.append('output_format', 'jpeg');
    
    // Optional parameters
    const negativePrompt = ''; // You can make this configurable
    if (negativePrompt) {
      formData.append('negative_prompt', negativePrompt);
    }
    
    formData.append('seed', '0'); // 0 means random seed
    
    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      {
        method: "POST",
        headers: {
          "Accept": "image/*",
          "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API error: ${response.status} - ${errorText}`);
    }

    // Check for NSFW classification
    const finishReason = response.headers.get('finish-reason');
    if (finishReason === 'CONTENT_FILTERED') {
      throw new Error('Generation failed NSFW classifier');
    }

    // Get the generated image and seed
    const imageBuffer = await response.buffer();
    const seed = response.headers.get('seed');
    console.log(`Image Generated Successfully with seed: ${seed}`);

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Step 3: Extract tags from the generated image using Gemini API
    let tags = [];
    try {
      // Convert base64 image to Gemini-compatible Part object
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      };

      // Define the prompt and include the image part
      const tagPrompt = "Analyze the provided image and provide 10 relevant tags that best describe its content. Only return the tags in an array format.";
      const tagResponse = await model1.generateContent([tagPrompt, imagePart]);
      tags = JSON.parse(tagResponse.response.text());
      console.log("Generated Tags:", tags);
    } catch (error) {
      console.error('Error extracting tags:', error);
    }

    // Return the image and tags
    res.status(200).json({ 
      photo: base64Image,
      tags: tags
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      message: 'Failed to process request',
      error: error.message,
    });
  }
});

export default router;
