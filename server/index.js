import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import userPostRoutes from './routes/userPost.js'; // renamed variable for clarity
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://pixelpost-opal.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Auth0 middleware to protect routes
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

// Apply route middleware
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/user-post', checkJwt, userPostRoutes); // Ensure path and checkJwt middleware are correct
app.use('/api/v1/dalle', checkJwt, dalleRoutes);

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
    app.listen(8080, () => console.log('Server is running on http://localhost:8080'));
  } catch (error) {
    console.log("SERVER NOT STARTED", error);
  }
};

startServer();
