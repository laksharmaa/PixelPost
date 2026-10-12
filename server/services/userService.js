import User from '../mongodb/models/user.js';
import loginOrCreateUser from '../utils/loginOrCreateUser.js';

export const createOrUpdateUser = (userId, profile) =>
  loginOrCreateUser(userId, profile.name, profile.email, profile.profilePicture);

export const getUserById = (userId) => User.findOne({ userId });

export const followUser = async (userToFollowId, followerUserId) => {
  if (followerUserId === userToFollowId) {
    return { error: { status: 400, message: 'You cannot follow yourself' } };
  }

  const userToFollow = await User.findOneAndUpdate(
    { userId: userToFollowId },
    { $addToSet: { followers: followerUserId } },
    { new: true }
  );

  if (!userToFollow) {
    return { error: { status: 404, message: 'User to follow not found' } };
  }

  const follower = await User.findOneAndUpdate(
    { userId: followerUserId },
    { $addToSet: { following: userToFollowId } },
    { new: true }
  );

  if (!follower) {
    return { error: { status: 404, message: 'Follower user not found' } };
  }

  return { userToFollow, follower };
};

export const unfollowUser = async (userToUnfollowId, unfollowerUserId) => {
  if (unfollowerUserId === userToUnfollowId) {
    return { error: { status: 400, message: 'You cannot unfollow yourself' } };
  }

  const userToUnfollow = await User.findOneAndUpdate(
    { userId: userToUnfollowId },
    { $pull: { followers: unfollowerUserId } },
    { new: true }
  );

  if (!userToUnfollow) {
    return { error: { status: 404, message: 'User to unfollow not found' } };
  }

  const unfollower = await User.findOneAndUpdate(
    { userId: unfollowerUserId },
    { $pull: { following: userToUnfollowId } },
    { new: true }
  );

  if (!unfollower) {
    return { error: { status: 404, message: 'Unfollower user not found' } };
  }

  return { userToUnfollow, unfollower };
};