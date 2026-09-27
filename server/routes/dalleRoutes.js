import express from "express";
import User from "../mongodb/models/user.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello from backend");
});

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Get userId from Auth0 token
    const userId = req.auth.sub;

    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }

    // Check if user exists and has enough credits
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits < 1) {
      return res
        .status(400)
        .json({
          message:
            "Insufficient credits to generate an image. Each generation costs 1 credit.",
        });
    }

    // Generate image using Stability AI's Stable Image Core API
    // Create a FormData instance for multipart/form-data
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", "1:1");
    formData.append("output_format", "jpeg");
    formData.append("seed", "0"); // 0 means random seed

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          // Let FormData set the content-type with boundary automatically
          Accept: "image/*",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API error: ${response.status} - ${errorText}`);
    }

    // Check for NSFW classification
    const finishReason = response.headers.get("finish-reason");
    if (finishReason === "CONTENT_FILTERED") {
      throw new Error("Generation failed NSFW classifier");
    }

    // Get the generated image and seed
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Deduct 1 credit from user account
    user.credits -= 1;
    user.imageGenerationCount += 1; // Increment image generation count
    await user.save();
    // Return the image, tags, and updated credit information
    res.status(200).json({
      photo: base64Image,
      tags: [],
      credits: user.credits,
    });
  } catch (error) {
    console.error('Image generation failed:', error.name || 'Error');
    res.status(500).json({
      message: "Failed to process request",
      error: 'Image generation is temporarily unavailable',
    });
  }
});

export default router;
