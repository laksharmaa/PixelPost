// routes/contestRoutes.js
import express from "express";
import * as dotenv from "dotenv";
import Contest from "../mongodb/models/contest.js";
import Post from "../mongodb/models/post.js";
import { expressjwt } from "express-jwt";
import jwks from "jwks-rsa";

dotenv.config();

const router = express.Router();

// Auth0 middleware for protected routes
const checkJwt = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
  requestProperty: "auth",
});

// Get all active and upcoming contests (public route)
router.get("/", async (req, res) => {
  try {
    // Find contests that are active or upcoming
    const contests = await Contest.find({
      status: { $in: ["active", "upcoming"] },
    });

    // Sort contests: active first, then upcoming, both sorted by start date
    const sortedContests = contests.sort((a, b) => {
      // First sort by status (active comes before upcoming)
      if (a.status === "active" && b.status === "upcoming") return -1;
      if (a.status === "upcoming" && b.status === "active") return 1;

      // If same status, sort by start date (ascending)
      return new Date(a.startDate) - new Date(b.startDate);
    });

    res.status(200).json({
      success: true,
      data: sortedContests,
    });
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all contests including completed ones (public route)
router.get("/all", async (req, res) => {
  try {
    const contests = await Contest.find();

    // Sort by status (active, upcoming, completed) and then by date
    const sortedContests = contests.sort((a, b) => {
      const statusOrder = { active: 0, upcoming: 1, completed: 2 };

      // First sort by status
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      // If active or upcoming, sort by start date
      if (a.status !== "completed") {
        return new Date(a.startDate) - new Date(b.startDate);
      }

      // If completed, sort by end date (most recently completed first)
      return new Date(b.endDate) - new Date(a.endDate);
    });

    res.status(200).json({
      success: true,
      data: sortedContests,
    });
  } catch (error) {
    console.error("Error fetching all contests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a specific contest with entries (public route)
router.get("/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate({
      path: "entries.postId",
      select: "photo prompt name username",
    });

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    // If contest is completed, also populate winners
    if (contest.status === "completed" && contest.winners.length > 0) {
      await Contest.populate(contest, {
        path: "winners.postId",
        select: "photo prompt name username",
      });
    }

    res.status(200).json({
      success: true,
      data: contest,
    });
  } catch (error) {
    console.error("Error fetching contest:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit an entry to a contest (protected route)
router.post("/:id/submit", checkJwt, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.auth.sub;
    const username = req.auth.nickname || req.auth.name || userId;

    // Find the contest
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    // Check if contest is active
    if (contest.status !== "active") {
      return res.status(400).json({
        success: false,
        message:
          contest.status === "upcoming"
            ? "This contest has not started yet"
            : "This contest has already ended",
      });
    }

    // Check if user has already submitted an entry
    const existingEntry = contest.entries.find(
      (entry) => entry.userId === userId
    );
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted an entry to this contest",
      });
    }

    // Verify that the post exists and belongs to the user
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only submit your own posts",
      });
    }

    // Create new entry
    const newEntry = {
      userId,
      username,
      postId,
      relevancyScore: 0,
      voters: [],
      submittedAt: new Date(),
    };

    // Add entry to contest
    contest.entries.push(newEntry);
    await contest.save();

    res.status(201).json({
      success: true,
      message: "Entry submitted successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error submitting contest entry:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vote on a contest entry (protected route)
router.post("/:id/vote", checkJwt, async (req, res) => {
  try {
    const { entryId, score } = req.body;
    const userId = req.auth.sub;

    // Validate score (1-10)
    if (!score || score < 1 || score > 10 || !Number.isInteger(score)) {
      return res.status(400).json({
        success: false,
        message: "Score must be an integer between 1 and 10",
      });
    }

    // Find the contest
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    // Check if contest is active
    if (contest.status !== "active") {
      return res.status(400).json({
        success: false,
        message:
          contest.status === "upcoming"
            ? "This contest has not started yet"
            : "This contest has already ended",
      });
    }

    // Find the entry
    const entryIndex = contest.entries.findIndex(
      (entry) => entry._id.toString() === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Entry not found",
      });
    }

    // Check if user is voting on their own entry
    if (contest.entries[entryIndex].userId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot vote on your own entry",
      });
    }

    // Check if user has already voted on this entry
    const voterIndex = contest.entries[entryIndex].voters.findIndex(
      (voter) => voter.userId === userId
    );

    if (voterIndex !== -1) {
      // Update existing vote
      contest.entries[entryIndex].voters[voterIndex].score = score;
    } else {
      // Add new vote
      contest.entries[entryIndex].voters.push({
        userId,
        score,
      });
    }

    // Recalculate relevancy score (average of all votes)
    const voters = contest.entries[entryIndex].voters;
    const totalScore = voters.reduce((sum, voter) => sum + voter.score, 0);
    contest.entries[entryIndex].relevancyScore =
      voters.length > 0 ? totalScore / voters.length : 0;

    await contest.save();

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      data: {
        entryId,
        newScore: contest.entries[entryIndex].relevancyScore,
      },
    });
  } catch (error) {
    console.error("Error voting on contest entry:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's submitted entries (protected route)
router.get("/user/entries", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;

    // Find all contests where the user has submitted an entry
    const contests = await Contest.find({
      "entries.userId": userId,
    }).populate({
      path: "entries.postId",
      select: "photo prompt name username",
    });

    // Extract just the user's entries from each contest
    const userEntries = contests.map((contest) => {
      const entry = contest.entries.find((entry) => entry.userId === userId);
      return {
        contestId: contest._id,
        contestTitle: contest.title,
        contestTheme: contest.theme,
        contestStatus: contest.status,
        entry: entry,
      };
    });

    res.status(200).json({
      success: true,
      data: userEntries,
    });
  } catch (error) {
    console.error("Error fetching user entries:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove an entry from a contest (protected route)
router.delete("/:id/entries/:entryId", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { id, entryId } = req.params;

    // Find the contest
    const contest = await Contest.findById(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    // Find the entry
    const entry = contest.entries.id(entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found",
      });
    }

    // Check if the entry belongs to the user
    if (entry.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only remove your own entries",
      });
    }

    // Check if contest is still active or upcoming
    if (contest.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove entries from completed contests",
      });
    }

    // Remove the entry
    contest.entries.pull({ _id: entryId });
    await contest.save();

    res.status(200).json({
      success: true,
      message: "Entry removed successfully",
    });
  } catch (error) {
    console.error("Error removing contest entry:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get leaderboard for a contest (public route)
router.get("/:id/leaderboard", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate({
      path: "entries.postId",
      select: "photo prompt name username",
    });

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    // Sort entries by relevancy score in descending order
    const leaderboard = [...contest.entries]
      .sort((a, b) => b.relevancyScore - a.relevancyScore)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        postId: entry.postId,
        relevancyScore: entry.relevancyScore,
        voterCount: entry.voters.length,
      }));

    res.status(200).json({
      success: true,
      data: {
        contestId: contest._id,
        contestTitle: contest.title,
        contestStatus: contest.status,
        leaderboard,
      },
    });
  } catch (error) {
    console.error("Error fetching contest leaderboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update the contest statuses (this could be called by a cron job)
router.post("/update-statuses", async (req, res) => {
  try {
    const now = new Date();

    // Find contests that need status updates
    const contests = await Contest.find({
      $or: [
        { status: "upcoming", startDate: { $lte: now } },
        { status: "active", endDate: { $lte: now } },
      ],
    });

    if (contests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No contests need status updates",
      });
    }

    // Update statuses
    for (const contest of contests) {
      if (contest.status === "upcoming" && now >= contest.startDate) {
        contest.status = "active";
      } else if (contest.status === "active" && now >= contest.endDate) {
        contest.status = "completed";
      }
      await contest.save();
    }

    res.status(200).json({
      success: true,
      message: `Updated status for ${contests.length} contests`,
      updatedContests: contests.map((c) => ({
        id: c._id,
        title: c.title,
        newStatus: c.status,
      })),
    });
  } catch (error) {
    console.error("Error updating contest statuses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
