import * as postService from '../services/postService.js';

const sendServiceError = (res, error) =>
  res.status(error.status).json({ success: false, message: error.message });

export const create = async (req, res) => {
  try {
    const post = await postService.createPost(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Error creating post' });
  }
};

export const list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await postService.listPosts(page, limit);
    res.status(200).json({
      success: true,
      data: result.posts,
      totalPosts: result.totalPosts,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error fetching posts:', error.stack);
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
};

export const listForUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await postService.listPostsForUser(req.params.userId, page, limit);
    if (result.error) return sendServiceError(res, result.error);

    res.status(200).json({ success: true, data: result.posts, hasMore: result.hasMore });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching user posts' });
  }
};

export const getById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Error fetching post' });
  }
};

export const like = async (req, res) => {
  try {
    const result = await postService.likePost(
      req.params.id,
      req.body.userId,
      req.body.username,
      req.app.get('io')
    );
    if (result.error) return sendServiceError(res, result.error);
    res.status(200).json({ success: true, data: result.post });
  } catch (error) {
    console.error('Error during like operation:', error);
    res.status(500).json({ success: false, message: 'Server error during like operation' });
  }
};

export const unlike = async (req, res) => {
  try {
    const result = await postService.unlikePost(req.params.id, req.body.userId);
    if (result.error) return sendServiceError(res, result.error);
    res.status(200).json({ success: true, data: result.post });
  } catch (error) {
    console.error('Error during unlike operation:', error);
    res.status(500).json({ success: false, message: 'Server error during unlike operation' });
  }
};

export const comment = async (req, res) => {
  try {
    const result = await postService.addComment(
      req.params.id,
      req.body.userId,
      req.body.comment,
      req.app.get('io')
    );
    if (result.error) return sendServiceError(res, result.error);
    res.status(201).json({ success: true, data: result.comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

export const bookmark = async (req, res) => {
  try {
    const result = await postService.bookmarkPost(req.params.id, req.body.userId, req.app.get('io'));
    if (result.error) return sendServiceError(res, result.error);
    res.status(200).json({ success: true, data: { post: result.post, bookmarks: result.bookmarks } });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ success: false, message: 'Error bookmarking post' });
  }
};

export const unbookmark = async (req, res) => {
  try {
    const result = await postService.unbookmarkPost(req.params.id, req.body.userId);
    if (result.error) return sendServiceError(res, result.error);
    res.status(200).json({ success: true, data: { post: result.post, bookmarks: result.bookmarks } });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ success: false, message: 'Error removing bookmark' });
  }
};

export const view = async (req, res) => {
  try {
    const post = await postService.incrementPostView(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ success: false, message: 'Error updating view count' });
  }
};

export const remove = async (req, res) => {
  try {
    const post = await postService.deletePost(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({
      success: true,
      message: 'Post and associated image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
};

export const bookmarksForUser = async (req, res) => {
  try {
    const posts = await postService.listBookmarkedPosts(req.params.userId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookmarks' });
  }
};

export const react = async (req, res) => {
  try {
    const result = await postService.reactToPost(
      req.params.id,
      req.body.userId,
      req.body.reactionType,
      req.app.get('io')
    );
    if (result.error) return sendServiceError(res, result.error);
    res.status(200).json({ success: true, data: result.post });
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ success: false, message: 'Server error during reaction operation' });
  }
};

export const similar = async (req, res) => {
  try {
    const { limit = 10, page = 1, threshold = 0.1 } = req.query;
    const result = await postService.getSimilarPosts(req.params.id, limit, page, threshold);
    if (result.error) return sendServiceError(res, result.error);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error finding similar posts:', error);
    res.status(500).json({ success: false, message: 'Error finding similar posts' });
  }
};