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

const Post = mongoose.model('Post', postSchema);
export default Post;
