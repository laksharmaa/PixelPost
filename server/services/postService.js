import Comment from '../mongodb/models/comment.js';
import Post from '../mongodb/models/post.js';
import User from '../mongodb/models/user.js';
import { deleteFile, uploadFile } from './storageService.js';
import { createNotification } from './notificationService.js';
import loginOrCreateUser from '../utils/loginOrCreateUser.js';
import { findSimilarPosts } from '../utils/tagSimilarity.js';

const failure = (status, message) => ({ error: { status, message } });

export const createPost = async ({ name, prompt, photo, userId, username, tags }) => {
  const photoUrl = await uploadFile(photo, `post-${Date.now()}.jpeg`);
  const post = await Post.create({
    name,
    prompt,
    photo: photoUrl,
    userId,
    username,
    likedBy: [],
    tags: tags || []
  });

  await User.findOneAndUpdate({ userId }, { $inc: { postCount: 1 } });
  return post;
};

export const listPosts = async (page, limit) => {
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const totalPosts = await Post.countDocuments();
  return { posts, totalPosts, totalPages: Math.ceil(totalPosts / limit) };
};

export const listPostsForUser = async (userId, page, limit) => {
  const posts = await Post.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const totalPosts = await Post.countDocuments({ userId });

  if (!posts.length) return failure(404, 'No posts found for this user');
  return { posts, hasMore: page * limit < totalPosts };
};

export const getPostById = (postId) => Post.findById(postId).populate('comments');

export const likePost = async (postId, userId, username, io) => {
  if (!userId) return failure(400, 'User authentication required');
  const post = await Post.findById(postId);
  if (!post) return failure(404, 'Post not found');

  if (!post.likedBy.includes(userId)) {
    post.likedBy.push(userId);
    post.likes += 1;
    await post.save();

    if (userId !== post.userId) {
      await createNotification(io, {
        userId: post.userId,
        type: 'like',
        message: `${username || userId} liked your post`,
        fromUser: { userId, username: username || userId },
        postId: post._id.toString(),
        postImage: post.photo
      });
    }
  }

  return { post };
};

export const unlikePost = async (postId, userId) => {
  if (!userId) return failure(400, 'User authentication required');
  const post = await Post.findById(postId);
  if (!post) return failure(404, 'Post not found');

  const likedIndex = post.likedBy.indexOf(userId);
  if (likedIndex !== -1) {
    post.likedBy.splice(likedIndex, 1);
    post.likes = Math.max(0, post.likes - 1);
    await post.save();
  }

  return { post };
};

export const addComment = async (postId, userId, comment, io) => {
  await loginOrCreateUser(userId);
  const post = await Post.findById(postId);
  if (!post) return failure(404, 'Post not found');

  const user = await User.findOne({ userId });
  if (!user || !user.username) return failure(400, 'User not found or username not set');

  const newComment = await Comment.create({ postId, userId, comment, username: user.username });
  post.comments.push(newComment._id);
  post.commentCount += 1;
  await post.save();

  if (userId !== post.userId) {
    await createNotification(io, {
      userId: post.userId,
      type: 'comment',
      message: `${user.username} commented on your post: "${comment.substring(0, 30)}${comment.length > 30 ? '...' : ''}"`,
      fromUser: { userId, username: user.username },
      postId: post._id.toString(),
      postImage: post.photo
    });
  }

  return { comment: newComment };
};

export const bookmarkPost = async (postId, userId, io) => {
  if (!userId) return failure(400, 'User ID required');
  const post = await Post.findById(postId);
  if (!post) return failure(404, 'Post not found');

  const user = await User.findOne({ userId });
  if (!user || !user.username) return failure(400, 'User not found or username not set');

  if (!post.bookmarkedBy.includes(userId)) {
    post.bookmarkedBy.push(userId);
    await post.save();
  }

  const updatedUser = await User.findOneAndUpdate(
    { userId },
    { $addToSet: { bookmarks: postId } },
    { new: true }
  );
  if (!updatedUser) return failure(404, 'User not found');

  if (userId !== post.userId) {
    await createNotification(io, {
      userId: post.userId,
      type: 'bookmark',
      message: `${user.username} bookmarked your post`,
      fromUser: { userId, username: user.username },
      postId: post._id.toString(),
      postImage: post.photo
    });
  }

  return { post, bookmarks: updatedUser.bookmarks };
};

export const unbookmarkPost = async (postId, userId) => {
  if (!userId) return failure(400, 'User ID required');
  const [post, user] = await Promise.all([
    Post.findByIdAndUpdate(postId, { $pull: { bookmarkedBy: userId } }, { new: true }),
    User.findOneAndUpdate({ userId }, { $pull: { bookmarks: postId } }, { new: true })
  ]);

  if (!post || !user) return failure(404, 'Post or User not found');
  return { post, bookmarks: user.bookmarks };
};

export const incrementPostView = (postId) =>
  Post.findByIdAndUpdate(postId, { $inc: { views: 1 } }, { new: true });

export const deletePost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) return null;

  try {
    await deleteFile(post.photo);
  } catch (error) {
    console.error('Failed to delete stored image:', error.name || 'Error');
  }

  await Comment.deleteMany({ postId });
  await Post.findByIdAndDelete(postId);

  const user = await User.findOne({ userId: post.userId });
  if (user) {
    user.postCount = Math.max(0, user.postCount - 1);
    user.likeCount = Math.max(0, user.likeCount - post.likes);
    user.commentCount = Math.max(0, user.commentCount - post.commentCount);
    await user.save();
  }

  return post;
};

export const listBookmarkedPosts = (userId) => Post.find({ bookmarkedBy: userId });

const reactionEmojis = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  fire: '🔥'
};

export const reactToPost = async (postId, userId, reactionType, io) => {
  if (!userId) return failure(400, 'User ID is required');
  const post = await Post.findById(postId);
  if (!post) return failure(404, 'Post not found');

  const user = await User.findOne({ userId });
  if (!user || !user.username) return failure(400, 'User not found or username not set');

  const username = user.username;
  const existingIndex = post.reactedBy.findIndex((reaction) => reaction.username === username);
  const previousReaction = existingIndex === -1
    ? null
    : post.reactedBy[existingIndex].reactionType;

  if (existingIndex !== -1 && (!reactionType || previousReaction === reactionType)) {
    post.reactedBy.splice(existingIndex, 1);
    post.reactions[previousReaction] = Math.max(0, (post.reactions[previousReaction] || 0) - 1);
    post.totalReactions = Math.max(0, post.totalReactions - 1);
  } else if (existingIndex !== -1) {
    post.reactedBy[existingIndex] = { username, reactionType };
    post.reactions[previousReaction] = Math.max(0, (post.reactions[previousReaction] || 0) - 1);
    post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    await notifyReaction(post, userId, username, reactionType, io, true);
  } else if (reactionType) {
    post.reactedBy.push({ username, reactionType });
    post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    post.totalReactions += 1;
    await notifyReaction(post, userId, username, reactionType, io, false);
  }

  await post.save();
  return { post };
};

const notifyReaction = async (post, userId, username, reactionType, io, changed) => {
  if (userId === post.userId) return;
  const emoji = reactionEmojis[reactionType] || '';
  await createNotification(io, {
    userId: post.userId,
    type: 'reaction',
    reactionType,
    message: changed
      ? `${username} changed their reaction to ${emoji} on your post`
      : `${username} reacted with ${emoji} to your post`,
    fromUser: { userId, username },
    postId: post._id.toString(),
    postImage: post.photo
  });
};

export const getSimilarPosts = async (postId, limit, page, threshold) => {
  const currentPost = await Post.findById(postId);
  if (!currentPost) return failure(404, 'Post not found');
  if (!currentPost.tags?.length) {
    return { data: [], message: 'No tags available for similarity matching' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const pageLimit = parseInt(limit);
  const allPosts = await Post.find({ _id: { $ne: postId } });
  const similarPosts = findSimilarPosts(
    currentPost,
    allPosts,
    Number.MAX_SAFE_INTEGER,
    parseFloat(threshold)
  );

  return {
    data: similarPosts.slice(skip, skip + pageLimit),
    pagination: {
      total: similarPosts.length,
      page: parseInt(page),
      limit: pageLimit,
      totalPages: Math.ceil(similarPosts.length / pageLimit),
      hasMore: skip + pageLimit < similarPosts.length
    }
  };
};