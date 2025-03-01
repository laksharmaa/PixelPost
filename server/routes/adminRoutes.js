// routes/adminRoutes.js
import express from 'express';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Admin from '../mongodb/models/admin.js';
import Contest from '../mongodb/models/contest.js';
import { expressjwt } from 'express-jwt';

dotenv.config();

const router = express.Router();

// Middleware to verify admin JWT token
const verifyAdminToken = expressjwt({
  secret: process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key',
  algorithms: ['HS256'],
});

// Create initial admin (only to be used once during setup)
router.post('/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Use login instead.',
      });
    }

    const { username, password, name, email } = req.body;
    
    // Create new admin
    const newAdmin = await Admin.create({
      username,
      password, // Will be hashed by the pre-save hook
      name,
      email,
      role: 'super-admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key',
      { expiresIn: '8h' }
    );
    
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new contest
router.post('/contests', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, theme, startDate, endDate } = req.body;
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }
    
    // Determine initial status
    const now = new Date();
    let status = 'upcoming';
    if (now >= start && now <= end) {
      status = 'active';
    } else if (now > end) {
      status = 'completed';
    }
    
    // Create new contest
    const newContest = await Contest.create({
      title,
      description,
      theme,
      startDate: start,
      endDate: end,
      status,
      entries: [],
      winners: [],
    });
    
    res.status(201).json({
      success: true,
      data: newContest,
    });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all contests
router.get('/contests', verifyAdminToken, async (req, res) => {
  try {
    const contests = await Contest.find();

    const sortedContests = contests.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      data: contests,
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a specific contest
router.get('/contests/:id', verifyAdminToken, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate({
      path: 'entries.postId',
      select: 'photo prompt name username',
    });
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a contest
router.put('/contests/:id', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, theme, startDate, endDate } = req.body;
    
    // Find contest
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    let status = 'upcoming';
    if (now >= start && now <= end) {
      status = 'active';
    } else if (now > end) {
      status = 'completed';
    }
    
    // Update fields
    if (title) contest.title = title;
    if (description) contest.description = description;
    if (theme) contest.theme = theme;
    if (startDate) contest.startDate = new Date(startDate);
    if (endDate) contest.endDate = new Date(endDate);
    if (status) contest.status = status;
    
    // Save changes
    await contest.save();
    
    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a contest
router.delete('/contests/:id', verifyAdminToken, async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate winners for a completed contest
router.post('/contests/:id/calculate-winners', verifyAdminToken, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found',
      });
    }
    
    if (contest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot calculate winners for a contest that is not completed',
      });
    }
    
    // Sort entries by relevancy score in descending order
    const sortedEntries = [...contest.entries].sort((a, b) => b.relevancyScore - a.relevancyScore);
    
    // Get top 3 entries (or less if there aren't enough entries)
    const topEntries = sortedEntries.slice(0, 3);
    
    // Create winners array
    const winners = topEntries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      postId: entry.postId,
      relevancyScore: entry.relevancyScore,
    }));
    
    // Update contest with winners
    contest.winners = winners;
    await contest.save();
    
    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    console.error('Error calculating winners:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;