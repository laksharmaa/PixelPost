import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import contestRoutes from './routes/contestRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup for real-time notifications
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Make io instance available throughout the app
app.set('io', io);

// Auth0 middleware for protected routes
const checkJwt = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  requestProperty: 'auth', 
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining a room based on their user ID
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//Route for posts CRUD operations
app.use('/api/v1/post', postRoutes);

//Route for image generation
app.use('/api/v1/dalle', checkJwt, dalleRoutes);

// Add route for user info
app.use("/api/v1/user", checkJwt, userRoutes);

// Add route for notifications
app.use("/api/v1/notifications", checkJwt, notificationRoutes);

// Add admin routes
app.use("/api/v1/admin", adminRoutes);

// Add contest routes
app.use("/api/v1/contests", contestRoutes);

// Error handling for JWT validation
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.error('JWT validation error:', err);  
    return res.status(401).json({ message: 'Invalid or missing token' });
  }
  next(err);
});

app.get('/', (req, res) => {
  res.send('hello from PixelPost');
});

const startServer = async () => {
  try {
    connectDB(process.env.COSMOSDB_URL);
    httpServer.listen(8080, () => console.log('Server is running on http://localhost:8080'));
  } catch (error) {
    console.log("SERVER NOT STARTED", error);
  }
};

startServer();