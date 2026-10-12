import { createNotification } from '../services/notificationService.js';
import {
  createOrUpdateUser,
  followUser,
  getUserById,
  unfollowUser
} from '../services/userService.js';

export const upsert = async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);
    const user = await createOrUpdateUser(userId, req.body);
    const userInfo = {
      followers: user.followers,
      following: user.following,
      postCount: user.postCount,
      name: user.name,
      email: user.email,
      username: user.username,
      credits: user.credits,
      profilePicture: user.profilePicture,
      userId: user.userId
    };

    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ success: false, message: 'Error fetching user info' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(decodeURIComponent(req.params.userId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userInfo = {
      followers: user.followers,
      following: user.following,
      postCount: user.postCount,
      name: user.name,
      email: user.email,
      username: user.username,
      credits: user.credits,
      profilePicture: user.profilePicture,
      userId: user.userId,
      contestWon: user.contestWon
    };

    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Error fetching user info' });
  }
};

export const follow = async (req, res) => {
  try {
    const { followerUserId, followerUsername } = req.body;
    const userToFollowId = req.params.userId;
    const result = await followUser(userToFollowId, followerUserId);

    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    await createNotification(req.app.get('io'), {
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
        followers: result.userToFollow.followers,
        following: result.follower.following
      }
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ success: false, message: 'Error following user' });
  }
};

export const unfollow = async (req, res) => {
  try {
    const { unfollowerUserId } = req.body;
    const result = await unfollowUser(req.params.userId, unfollowerUserId);

    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.status(200).json({
      success: true,
      data: {
        followers: result.userToUnfollow.followers,
        following: result.unfollower.following
      }
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ success: false, message: 'Error unfollowing user' });
  }
};