// userRoutes.js
import express from "express";
import loginOrCreateUser from "../utils/loginOrCreateUser.js";  // Import loginOrCreateUser function

const router = express.Router();

// GET USER INFO BY USER ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Decode the userId to handle special characters like '|'
    const decodedUserId = decodeURIComponent(userId);
    console.log("Fetching user info for userId:", decodedUserId);

    // Check if the user exists or create one if they don't
    const user = await loginOrCreateUser(decodedUserId, req.auth.name, req.auth.email);

    // Add follower and following counts
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    // Return the user info along with the follower and following counts
    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ success: false, message: "Error fetching user info" });
  }
});

export default router;