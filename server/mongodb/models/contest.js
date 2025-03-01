// models/contest.js
import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  },
  entries: [
    {
      userId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
      },
      relevancyScore: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          userId: String,
          score: Number,
        },
      ],
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  winners: [
    {
      rank: Number,
      userId: String,
      username: String,
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      relevancyScore: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;