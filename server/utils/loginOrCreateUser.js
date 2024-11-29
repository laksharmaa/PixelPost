// // utils/loginOrCreateUser.js
// import User from '../mongodb/models/user.js';

// const loginOrCreateUser = async (userId, name, email) => {
//   try {
//     // Attempt to find the user in the database
//     let user = await User.findOne({ userId });

//     if (!user) {
//       // If user does not exist, create and save a new one
//       user = new User({ userId, name, email });
//       await user.save();
//       console.log('New user created:', user);
//     }

//     return user;
//   } catch (error) {
//     if (error.code === 11000) {
//       // Log only a brief message without duplicate details for clarity
//       console.log(`User ${userId} already exists, skipping creation`);
//       // Fetch and return the existing user
//       return await User.findOne({ userId });
//     } else {
//       // Log any other unexpected error
//       console.error('Unexpected error in user login or creation:', error);
//       throw error;
//     }
//   }
// };

// export default loginOrCreateUser;

import User from "../mongodb/models/user.js";

const loginOrCreateUser = async (userId, name, email) => {
  try {
    // Attempt to find the user in the database
    let user = await User.findOne({ userId });

    if (!user) {
      // If user does not exist, create and save a new one
      user = new User({
        userId,
        name: name || "Unknown User", // Default name if not provided
        email: email || "unknown@example.com", // Default email if not provided
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

      if (updated) {
        await user.save();
        console.log("User updated with missing fields:", user);
      } else {
        console.log("User already exists with complete details:", user);
      }
    }

    return user;
  } catch (error) {
    if (error.code === 11000) {
      // Log only a brief message without duplicate details for clarity
      console.log(`User ${userId} already exists, skipping creation`);
      // Fetch and return the existing user
      return await User.findOne({ userId });
    } else {
      // Log any other unexpected error
      console.error("Unexpected error in user login or creation:", error);
      throw error;
    }
  }
};

export default loginOrCreateUser;
