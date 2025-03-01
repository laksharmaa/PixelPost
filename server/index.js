import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongodb/connect.js";
import postRoutes from "./routes/postRoutes.js";
import dalleRoutes from "./routes/dalleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // Import admin routes
import { expressjwt } from "express-jwt";
import jwks from "jwks-rsa";
import contestRoutes from "./routes/contestRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

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

// Route for posts CRUD operations
app.use("/api/v1/post", postRoutes);

// Route for image generation
app.use("/api/v1/dalle", checkJwt, dalleRoutes);

// Add route for user info
app.use("/api/v1/user", checkJwt, userRoutes);

// Add admin routes
app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/contests", contestRoutes);

// Error handling for JWT validation
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.error("JWT validation error:", err);
    return res.status(401).json({ message: "Invalid or missing token" });
  }
  next(err);
});

app.get("/", (req, res) => {
  res.send("hello from PixelPost");
});

const startServer = async () => {
  try {
    connectDB(process.env.COSMOSDB_URL);
    app.listen(8080, () =>
      console.log("Server is running on http://localhost:8080")
    );
  } catch (error) {
    console.log("SERVER NOT STARTED", error);
  }
};

startServer();
