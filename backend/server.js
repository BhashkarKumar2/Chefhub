
import './config/loadEnv.js';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from './auth/Passport.js'; // Import passport config

import authRoutes from './auth/authRoutes.js'; 
import chefRoutes from './routes/chefRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';
import socketService from './services/socketService.js';


const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(cors({ origin: ['http://chefhub-poou.vercel.app', 'http://chefhub-poou.vercel.app','https://chefhub-poou.vercel.app'], credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Session Middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Important for login sessions
}));

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
app.use('/api', healthRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    
    // Initialize Socket.io
    socketService.init(server);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io enabled for real-time features`);
    });
  })
  .catch(err => console.error(err));
