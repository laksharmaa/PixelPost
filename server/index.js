import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './mongodb/connect.js';
import checkJwt from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import postRoutes from './routes/postRouter.js';
import dalleRoutes from './routes/dalleRouter.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRouter.js';
import contestRoutes from './routes/contestRouter.js';

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
    }
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

app.get('/', (req, res) => {
  res.send('hello from PixelPost');
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    const port = Number(process.env.PORT) || 8080;
    httpServer.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch {
    console.error('Server startup failed. Check database configuration and availability.');
    process.exitCode = 1;
  }
};

startServer();