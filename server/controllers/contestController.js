import * as contestService from '../services/contestService.js';

export const refreshStatuses = async (req, res, next) => {
  try {
    await contestService.updateContestStatuses();
    next();
  } catch (error) {
    console.error('Error in status update middleware:', error);
    next();
  }
};

export const listActive = async (req, res) => {
  try {
    const contests = await contestService.listActiveAndUpcoming();
    res.status(200).json({ success: true, data: contests });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listAll = async (req, res) => {
  try {
    const contests = await contestService.listAll();
    res.status(200).json({ success: true, data: contests });
  } catch (error) {
    console.error('Error fetching all contests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getById = async (req, res) => {
  try {
    const contest = await contestService.getById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    console.error('Error fetching contest:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const submitEntry = async (req, res) => {
  try {
    const result = await contestService.submitEntry(req.params.id, req.body.postId, req.auth.sub);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Entry submitted successfully',
      data: result.entry
    });
  } catch (error) {
    console.error('Error submitting contest entry:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const vote = async (req, res) => {
  try {
    const result = await contestService.voteOnEntry(
      req.params.id,
      req.body.entryId,
      req.body.score,
      req.auth.sub
    );
    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: { entryId: req.body.entryId, newScore: result.newScore }
    });
  } catch (error) {
    console.error('Error voting on contest entry:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listUserEntries = async (req, res) => {
  try {
    const entries = await contestService.listEntriesForUser(req.auth.sub);
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching user entries:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeEntry = async (req, res) => {
  try {
    const result = await contestService.removeEntry(
      req.params.id,
      req.params.entryId,
      req.auth.sub
    );
    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.status(200).json({ success: true, message: 'Entry removed successfully' });
  } catch (error) {
    console.error('Error removing contest entry:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const leaderboard = async (req, res) => {
  try {
    const result = await contestService.getLeaderboard(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching contest leaderboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateStatuses = async (req, res) => {
  try {
    const result = await contestService.updateStatuses();
    if (!result.updatedContests.length) {
      return res.status(200).json({ success: true, message: result.message });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      updatedContests: result.updatedContests
    });
  } catch (error) {
    console.error('Error updating contest statuses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};