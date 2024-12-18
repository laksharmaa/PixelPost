// models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true,
    },
    userId: {
        type: String, // Reference to the user who created the post
        required: true,
    },
    likes: {
        type: Number, default: 0
    },
    likedBy: {
        type: [String], default: []
    },
    bookmarkedBy: [{
        type: String, // Store user IDs
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0,
    },
    commentCount: { // Count of comments for the post
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // Array of comment references
});

//index for sorting posts by createdAt
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
