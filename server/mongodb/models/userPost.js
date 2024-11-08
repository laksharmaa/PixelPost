// models/userPost.js
import mongoose from 'mongoose';

const userPostSchema = new mongoose.Schema({
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
        type: String, // Auth0 user ID or other unique user identifier
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserPost = mongoose.model('UserPost', userPostSchema);

export default UserPost;
