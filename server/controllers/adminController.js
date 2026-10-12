import * as adminService from '../services/adminService.js';

export const setup = async (req, res) => {
  try {
    const created = await adminService.createAdmin(req.body);
    if (!created) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Use login instead.'
      });
    }

    res.status(201).json({ success: true, message: 'Admin account created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const result = await adminService.loginAdmin(req.body);
    if (!result) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createContest = async (req, res) => {
  try {
    const contest = await adminService.createContest(req.body);
    if (contest?.error) {
      return res.status(400).json({ success: false, message: contest.error });
    }

    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listContests = async (req, res) => {
  try {
    const contests = await adminService.getContests();
    res.status(200).json({ success: true, data: contests });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getContest = async (req, res) => {
  try {
    const contest = await adminService.getContest(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateContest = async (req, res) => {
  try {
    const contest = await adminService.updateContest(req.params.id, req.body);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteContest = async (req, res) => {
  try {
    const contest = await adminService.deleteContest(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.status(200).json({ success: true, message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Error deleting contest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const calculateWinners = async (req, res) => {
  try {
    const result = await adminService.calculateWinners(req.params.id);
    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message
      });
    }

    res.status(200).json({ success: true, data: result.contest });
  } catch (error) {
    console.error('Error calculating winners:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};