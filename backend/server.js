
import './config/loadEnv.js';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import connectRedis from 'connect-redis';
import passport from './auth/Passport.js'; // Import passport config
import authRoutes from './auth/authRoutes.js'; 
import chefRoutes from './routes/chefRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';
import proxyRoutes from './routes/proxyRoutes.js';
import socketService from './services/socketService.js';
import redis from './config/redis.js';
import compression from 'compression';
import helmet from 'helmet';

const RedisStore = connectRedis(session);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy (important for production deployments)
app.set('trust proxy', 1);

app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://chefhub-ochre.vercel.app',
    'https://chefhub-poou.vercel.app',
  ], 
  credentials: true 
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Session Middleware with Redis Store (production-ready)
app.use(session({
  store: new RedisStore({ 
    client: redis,
    prefix: 'chefhub:sess:',
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

//optimizers

app.use(compression());
app.use(helmet());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/chefs', chefRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api', healthRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // console.log('✅ MongoDB connected');
    
    // Initialize Socket.io
    socketService.init(server);
    
    server.listen(PORT, () => {
      // console.log(`🚀 Server running on port ${PORT}`);
      // console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      // console.log(`📡 Socket.io enabled for real-time features`);
    });
  })
  .catch(err => {
    // console.error('❌ MongoDB connection error:', err)
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  // console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    // console.log('Server closed');
    redis.quit();
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  // console.log('SIGINT received, closing server gracefully...');
  server.close(() => {
    // console.log('Server closed');
    redis.quit();
    mongoose.connection.close();
    process.exit(0);
  });
});
