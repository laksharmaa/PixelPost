// userRoutes.js
import express from "express";
import User from "../mongodb/models/user.js";

const router = express.Router();

// GET USER INFO BY USER ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching user info for userId:", userId);

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ success: false, message: "Error fetching user info" });
  }
});

export default router;
