import Contest from '../mongodb/models/contest.js';
import Post from '../mongodb/models/post.js';
import User from '../mongodb/models/user.js';

export const updateContestStatuses = async () => {
  const now = new Date();
  const contests = await Contest.find({
    $or: [
      { status: 'upcoming', startDate: { $lte: now } },
      { status: 'active', endDate: { $lte: now } }
    ]
  });

  for (const contest of contests) {
    if (contest.status === 'upcoming' && now >= contest.startDate) {
      contest.status = 'active';
    } else if (contest.status === 'active' && now >= contest.endDate) {
      contest.status = 'completed';
    }
    await contest.save();
  }

  return contests;
};

export const listActiveAndUpcoming = async () => {
  const contests = await Contest.find({ status: { $in: ['active', 'upcoming'] } });
  return contests.sort((a, b) => {
    if (a.status === 'active' && b.status === 'upcoming') return -1;
    if (a.status === 'upcoming' && b.status === 'active') return 1;
    return new Date(a.startDate) - new Date(b.startDate);
  });
};

export const listAll = async () => {
  const contests = await Contest.find();
  const statusOrder = { active: 0, upcoming: 1, completed: 2 };

  return contests.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (a.status !== 'completed') return new Date(a.startDate) - new Date(b.startDate);
    return new Date(b.endDate) - new Date(a.endDate);
  });
};

export const getById = async (contestId) => {
  const contest = await Contest.findById(contestId).populate({
    path: 'entries.postId',
    select: 'photo prompt name username'
  });

  if (contest?.status === 'completed' && contest.winners.length > 0) {
    await Contest.populate(contest, {
      path: 'winners.postId',
      select: 'photo prompt name username'
    });
  }

  return contest;
};

export const submitEntry = async (contestId, postId, userId) => {
  const user = await User.findOne({ userId });
  const username = user ? user.username : userId;
  const contest = await Contest.findById(contestId);

  if (!contest) return { error: { status: 404, message: 'Contest not found' } };
  if (contest.status !== 'active') {
    return {
      error: {
        status: 400,
        message: contest.status === 'upcoming'
          ? 'This contest has not started yet'
          : 'This contest has already ended'
      }
    };
  }
  if (contest.entries.some((entry) => entry.userId === userId)) {
    return {
      error: { status: 400, message: 'You have already submitted an entry to this contest' }
    };
  }

  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: 'Post not found' } };
  if (post.userId !== userId) {
    return { error: { status: 403, message: 'You can only submit your own posts' } };
  }

  const entry = {
    userId,
    username,
    postId,
    relevancyScore: 0,
    voters: [],
    submittedAt: new Date()
  };
  contest.entries.push(entry);
  await contest.save();
  return { entry };
};

export const voteOnEntry = async (contestId, entryId, score, userId) => {
  if (!score || score < 1 || score > 10 || !Number.isInteger(score)) {
    return { error: { status: 400, message: 'Score must be an integer between 1 and 10' } };
  }

  const contest = await Contest.findById(contestId);
  if (!contest) return { error: { status: 404, message: 'Contest not found' } };
  if (contest.status !== 'active') {
    return {
      error: {
        status: 400,
        message: contest.status === 'upcoming'
          ? 'This contest has not started yet'
          : 'This contest has already ended'
      }
    };
  }

  const entry = contest.entries.find((item) => item._id.toString() === entryId);
  if (!entry) return { error: { status: 404, message: 'Entry not found' } };
  if (entry.userId === userId) {
    return { error: { status: 400, message: 'You cannot vote on your own entry' } };
  }

  const voter = entry.voters.find((item) => item.userId === userId);
  if (voter) voter.score = score;
  else entry.voters.push({ userId, score });

  const totalScore = entry.voters.reduce((sum, item) => sum + item.score, 0);
  entry.relevancyScore = entry.voters.length ? totalScore / entry.voters.length : 0;
  await contest.save();

  return { newScore: entry.relevancyScore };
};

export const listEntriesForUser = async (userId) => {
  const contests = await Contest.find({ 'entries.userId': userId }).populate({
    path: 'entries.postId',
    select: 'photo prompt name username'
  });

  return contests.map((contest) => ({
    contestId: contest._id,
    contestTitle: contest.title,
    contestTheme: contest.theme,
    contestStatus: contest.status,
    entry: contest.entries.find((entry) => entry.userId === userId)
  }));
};

export const removeEntry = async (contestId, entryId, userId) => {
  const contest = await Contest.findById(contestId);
  if (!contest) return { error: { status: 404, message: 'Contest not found' } };

  const entry = contest.entries.id(entryId);
  if (!entry) return { error: { status: 404, message: 'Entry not found' } };
  if (entry.userId !== userId) {
    return { error: { status: 403, message: 'You can only remove your own entries' } };
  }
  if (contest.status === 'completed') {
    return { error: { status: 400, message: 'Cannot remove entries from completed contests' } };
  }

  contest.entries.pull({ _id: entryId });
  await contest.save();
  return { success: true };
};

export const getLeaderboard = async (contestId) => {
  const contest = await Contest.findById(contestId).populate({
    path: 'entries.postId',
    select: 'photo prompt name username'
  });
  if (!contest) return null;

  const leaderboard = [...contest.entries]
    .sort((a, b) => b.relevancyScore - a.relevancyScore)
    .map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      postId: entry.postId,
      relevancyScore: entry.relevancyScore,
      voterCount: entry.voters.length
    }));

  return {
    contestId: contest._id,
    contestTitle: contest.title,
    contestStatus: contest.status,
    leaderboard
  };
};

export const updateStatuses = async () => {
  const contests = await updateContestStatuses();
  return {
    message: contests.length
      ? `Updated status for ${contests.length} contests`
      : 'No contests need status updates',
    updatedContests: contests.map((contest) => ({
      id: contest._id,
      title: contest.title,
      newStatus: contest.status
    }))
  };
};