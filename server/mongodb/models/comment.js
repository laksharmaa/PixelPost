// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Post
        ref: 'Post',
        required: true,
    },
    userId: {
        type: String, // Reference to the user's ID
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
