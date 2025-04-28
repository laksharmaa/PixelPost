// utils/tagSimilarity.js

/**
 * Calculate Jaccard similarity between two tag arrays
 * Jaccard similarity = (size of intersection) / (size of union)
 * 
 * @param {Array<string>} tags1 - First array of tags
 * @param {Array<string>} tags2 - Second array of tags
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateTagSimilarity = (tags1, tags2) => {
    // Handle edge cases
    if (!tags1 || !tags2 || !tags1.length || !tags2.length) return 0;
    
    // Convert to lowercase for case-insensitive comparison
    const normalizedTags1 = tags1.map(tag => tag.toLowerCase());
    const normalizedTags2 = tags2.map(tag => tag.toLowerCase());
    
    // Find intersection
    const intersection = normalizedTags1.filter(tag => normalizedTags2.includes(tag));
    
    // Find union
    const union = [...new Set([...normalizedTags1, ...normalizedTags2])];
    
    // Calculate Jaccard similarity
    return intersection.length / union.length;
  };
  
  /**
   * Find similar posts based on tag similarity
   * 
   * @param {Object} currentPost - The post to find similar posts for
   * @param {Array<Object>} allPosts - Array of all posts to compare against
   * @param {number} limit - Maximum number of similar posts to return
   * @param {number} threshold - Minimum similarity score (0-1) to consider a post similar
   * @returns {Array<Object>} - Array of similar posts with similarity scores
   */
  const findSimilarPosts = (currentPost, allPosts, limit = 10, threshold = 0.01) => {
    // Skip if no tags available
    if (!currentPost.tags || !currentPost.tags.length) return [];
    
    // Calculate similarity scores for each post
    const postsWithScores = allPosts
      // Don't include the current post in results
      .filter(post => post._id.toString() !== currentPost._id.toString())
      // Calculate similarity for each post
      .map(post => ({
        ...post._doc || post, // Handle both Mongoose documents and plain objects
        similarityScore: calculateTagSimilarity(currentPost.tags, post.tags)
      }))
      // Filter posts with scores above threshold
      .filter(post => post.similarityScore >= threshold)
      // Sort by similarity score (highest first)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      // Limit results
      .slice(0, limit);
    
    return postsWithScores;
  };
  
  export { calculateTagSimilarity, findSimilarPosts };
  