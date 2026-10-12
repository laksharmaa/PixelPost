import jwt from 'jsonwebtoken';
import Admin from '../mongodb/models/admin.js';
import Contest from '../mongodb/models/contest.js';
import User from '../mongodb/models/user.js';

export const createAdmin = async ({ username, password, name, email }) => {
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) return null;

  await Admin.create({ username, password, name, email, role: 'super-admin' });
  return true;
};

export const loginAdmin = async ({ username, password }) => {
  const admin = await Admin.findOne({ username });
  if (!admin || !(await admin.comparePassword(password))) return null;

  const token = jwt.sign(
    { id: admin._id, username: admin.username, role: admin.role },
    process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key',
    { expiresIn: '8h' }
  );

  return {
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  };
};

export const createContest = async ({ title, description, theme, startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) return { error: 'End date must be after start date' };

  const now = new Date();
  const status = now >= start && now <= end
    ? 'active'
    : now > end ? 'completed' : 'upcoming';

  return Contest.create({
    title,
    description,
    theme,
    startDate: start,
    endDate: end,
    status,
    entries: [],
    winners: []
  });
};

export const getContests = async () => {
  const contests = await Contest.find();
  return contests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getContest = (contestId) => Contest.findById(contestId).populate({
  path: 'entries.postId',
  select: 'photo prompt name username'
});

export const updateContest = async (contestId, changes) => {
  const contest = await Contest.findById(contestId);
  if (!contest) return null;

  const { title, description, theme, startDate, endDate } = changes;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  let status = 'upcoming';
  if (now >= start && now <= end) status = 'active';
  else if (now > end) status = 'completed';

  if (title) contest.title = title;
  if (description) contest.description = description;
  if (theme) contest.theme = theme;
  if (startDate) contest.startDate = new Date(startDate);
  if (endDate) contest.endDate = new Date(endDate);
  if (status) contest.status = status;

  return contest.save();
};

export const deleteContest = (contestId) => Contest.findByIdAndDelete(contestId);

export const calculateWinners = async (contestId) => {
  const contest = await Contest.findById(contestId);
  if (!contest) return { error: { status: 404, message: 'Contest not found' } };
  if (contest.status !== 'completed') {
    return {
      error: {
        status: 400,
        message: 'Cannot calculate winners for a contest that is not completed'
      }
    };
  }

  const winners = [...contest.entries]
    .sort((a, b) => b.relevancyScore - a.relevancyScore)
    .slice(0, 3)
    .map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      postId: entry.postId,
      relevancyScore: entry.relevancyScore
    }));

  contest.winners = winners;
  await contest.save();

  for (const winner of winners) {
    const user = await User.findOne({ userId: winner.userId });
    if (!user) continue;

    const creditsByRank = { 1: 5, 2: 3, 3: 2 };
    user.credits += creditsByRank[winner.rank];
    if (winner.rank === 1) user.contestWon += 1;
    await user.save();
  }

  return { contest };
};