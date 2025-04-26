// // userRoutes.js
// import express from "express";
// import loginOrCreateUser from "../utils/loginOrCreateUser.js";  // Import loginOrCreateUser function
// import User from "../mongodb/models/user.js";

// const router = express.Router();

// /// userRoutes.js
// router.post("/", async (req, res) => {
//   try {
//     const { userId, name, email, profilePicture } = req.body;
    
//     const user = await loginOrCreateUser(userId, name, email, profilePicture);

//     // Create a userInfo object with the required counts
//     const userInfo = {
//       userId: user.userId,
//       followers: user.followers,
//       following: user.following,
//       postCount: user.postCount,
//       name: user.name,
//       email: user.email,
//       credits : user.credits,
//       profilePicture: user.profilePicture,
//     };

//     res.status(200).json({
//       success: true,
//       data: userInfo
//     });
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     res.status(500).json({ success: false, message: "Error fetching user info" });
//   }
// });

// router.get("/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const decodedUserId = decodeURIComponent(userId);
    
//     const user = await User.findOne({ userId: decodedUserId });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Create a userInfo object with the required counts
//     const userInfo = {
//       userId: user.userId,
//       followers: user.followers,
//       following: user.following,
//       postCount: user.postCount,
//       name: user.name,
//       email: user.email,
//       credits : user.credits,
//       profilePicture: user.profilePicture,
//     };

//     res.status(200).json({
//       success: true,
//       data: userInfo
//     });
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     res.status(500).json({ success: false, message: "Error fetching user info" });
//   }
// });
// export default router;
// routes/userRoutes.js
import express from "express";
import User from "../mongodb/models/user.js";
import loginOrCreateUser from "../utils/loginOrCreateUser.js";
import generateUsername from "../utils/usernameGenerator.js";
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const decodedUserId = decodeURIComponent(userId);
    const user = await loginOrCreateUser(decodedUserId, req.body.name, req.body.email, req.body.profilePicture);

    // Create a userInfo object with the required counts
    const userInfo = {
      followers: user.followers,
      following: user.following,
      postCount: user.postCount,
      name: user.name,
      email: user.email,
      username: user.username,
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

// Get user profile information
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const decodedUserId = decodeURIComponent(userId);
    let user = await User.findOne({ decodedUserId });


    // Create a userInfo object with the required counts
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
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

// Follow a user
router.post("/:userId/follow", async (req, res) => {
  try {
    const { followerUserId, followerUsername } = req.body;
    const userToFollowId = req.params.userId;

    // Check they are not the same user
    if (followerUserId === userToFollowId) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot follow yourself" 
      });
    }

    // Update the followers list of the user being followed
    const userToFollow = await User.findOneAndUpdate(
      { userId: userToFollowId },
      { $addToSet: { followers: followerUserId } },
      { new: true }
    );

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User to follow not found"
      });
    }

    // Update the following list of the follower
    const follower = await User.findOneAndUpdate(
      { userId: followerUserId },
      { $addToSet: { following: userToFollowId } },
      { new: true }
    );

    if (!follower) {
      return res.status(404).json({
        success: false,
        message: "Follower user not found"
      });
    }

    // Create a notification for the followed user
    await createNotification(req, {
      userId: userToFollowId,
      type: 'follow',
      message: `${followerUsername || followerUserId} started following you`,
      fromUser: {
        userId: followerUserId,
        username: followerUsername || followerUserId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        followers: userToFollow.followers,
        following: follower.following
      }
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ success: false, message: "Error following user" });
  }
});

// Unfollow a user
router.post("/:userId/unfollow", async (req, res) => {
  try {
    const { unfollowerUserId } = req.body;
    const userToUnfollowId = req.params.userId;

    // Check they are not the same user
    if (unfollowerUserId === userToUnfollowId) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot unfollow yourself" 
      });
    }

    // Update the followers list of the user being unfollowed
    const userToUnfollow = await User.findOneAndUpdate(
      { userId: userToUnfollowId },
      { $pull: { followers: unfollowerUserId } },
      { new: true }
    );

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: "User to unfollow not found"
      });
    }

    // Update the following list of the unfollower
    const unfollower = await User.findOneAndUpdate(
      { userId: unfollowerUserId },
      { $pull: { following: userToUnfollowId } },
      { new: true }
    );

    if (!unfollower) {
      return res.status(404).json({
        success: false,
        message: "Unfollower user not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        followers: userToUnfollow.followers,
        following: unfollower.following
      }
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ success: false, message: "Error unfollowing user" });
  }
});

export default router;