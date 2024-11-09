// models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: {
        type: String, // Consistent with the `userId` used in other schemas
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    imageGenerationCount: {
        type: Number,
        default: 0,
    },
    postCount: {
        type: Number,
        default: 0,
    },
    likeCount: {
        type: Number,
        default: 0, // Total likes on all posts by this user
    },
    commentCount: {
        type: Number,
        default: 0, // Total comments by this user
    },
    followers: [
        {
            type: String, // Array of `userId`s following this user
        },
    ],
    following: [
        {
            type: String, // Array of `userId`s this user is following
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);
export default User;
