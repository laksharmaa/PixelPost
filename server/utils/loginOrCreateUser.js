import User from "../mongodb/models/user.js";
import Post from '../mongodb/models/post.js';

const loginOrCreateUser = async (userId, name, email) => {
  try {
    // Attempt to find the user in the database
    let user = await User.findOne({ userId });
    
    // Get the actual post count
    const actualPostCount = await Post.countDocuments({ userId });

    if (!user) {
      // If user does not exist, create and save a new one
      user = new User({
        userId,
        name: name || "Unknown User",
        email: email || "unknown@example.com",
        postCount: actualPostCount
      });
      await user.save();
      console.log("New user created:", user);
    } else {
      // If user exists, check and update fields if necessary
      let updated = false;

      if (!user.name && name) {
        user.name = name;
        updated = true;
      }

      if (!user.email && email) {
        user.email = email;
        updated = true;
      }

      // Update post count if it's different
      if (user.postCount !== actualPostCount) {
        user.postCount = actualPostCount;
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log("User updated:", user);
      }
    }

    return user;
  } catch (error) {
    if (error.code === 11000) {
      console.log(`User ${userId} already exists, skipping creation`);
      return await User.findOne({ userId });
    } else {
      console.error("Unexpected error in user login or creation:", error);
      throw error;
    }
  }
};

export default loginOrCreateUser;