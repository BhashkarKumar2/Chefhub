import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
  refundPayment,
  getChefEarnings
} from '../controllers/paymentController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get earnings stats (Protected)
router.get('/earnings', authMiddleware, getChefEarnings);

// Create payment order (Protected — must own the booking)
router.post('/create-order', authMiddleware, createPaymentOrder);

// Verify payment (Protected — must own the booking)
router.post('/verify', authMiddleware, verifyPayment);

// Handle payment failure (Protected — must own the booking)
router.post('/failure', authMiddleware, handlePaymentFailure);

// Get payment status (Protected — owner or chef only)
router.get('/status/:bookingId', authMiddleware, getPaymentStatus);

// Process refund (Protected — owner only)
router.post('/refund', authMiddleware, refundPayment);

export default router;
