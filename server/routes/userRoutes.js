// userRoutes.js
import express from "express";
import loginOrCreateUser from "../utils/loginOrCreateUser.js";  // Import loginOrCreateUser function

const router = express.Router();

/// userRoutes.js
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const decodedUserId = decodeURIComponent(userId);
    
    const user = await loginOrCreateUser(decodedUserId, req.auth.name, req.auth.email);

    // Create a userInfo object with the required counts
    const userInfo = {
      followers: user.followers,
      following: user.following,
      postCount: user.postCount,
      name: user.name,
      email: user.email
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