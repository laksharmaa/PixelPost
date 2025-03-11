// userRoutes.js
import express from "express";
import loginOrCreateUser from "../utils/loginOrCreateUser.js";  // Import loginOrCreateUser function
import User from "../mongodb/models/user.js";

const router = express.Router();

/// userRoutes.js
router.post("/", async (req, res) => {
  try {
    const { userId, name, email, profilePicture } = req.body;
    
    const user = await loginOrCreateUser(userId, name, email, profilePicture);

    // Create a userInfo object with the required counts
    const userInfo = {
      userId: user.userId,
      followers: user.followers,
      following: user.following,
      postCount: user.postCount,
      name: user.name,
      email: user.email,
      credits : user.credits,
      profilePicture: user.profilePicture,
    };

    res.status(200).json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ success: false, message: "Error fetching user info" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const decodedUserId = decodeURIComponent(userId);
    
    const user = await User.findOne({ userId: decodedUserId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create a userInfo object with the required counts
    const userInfo = {
      userId: user.userId,
      followers: user.followers,
      following: user.following,
      postCount: user.postCount,
      name: user.name,
      email: user.email,
      credits : user.credits,
      profilePicture: user.profilePicture,
    };

    res.status(200).json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ success: false, message: "Error fetching user info" });
  }
});
export default router;