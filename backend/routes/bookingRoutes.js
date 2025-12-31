import express from 'express';
import {
  createBooking,
  getUserBookings,
  getChefBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats
} from '../controllers/bookingController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (authentication required)
// Get all bookings for the authenticated user
router.get('/', authMiddleware, getUserBookings);

// Get a specific booking by ID
router.get('/:id', authMiddleware, getBookingById);

// Create a new booking
router.post('/', authMiddleware, createBooking);

// Update booking (status, etc.)
router.put('/:id', authMiddleware, updateBookingStatus);

// Cancel/Delete a booking
router.delete('/:id', authMiddleware, deleteBooking);

// Get all bookings for a specific chef (requires auth)
router.get('/chef/:chefId', authMiddleware, getChefBookings);

// Admin routes
// Get booking statistics
router.get('/admin/stats', getBookingStats);

export default router;
