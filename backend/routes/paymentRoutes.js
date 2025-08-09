import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
  refundPayment
} from '../controllers/paymentController.js';

// import authMiddleware from '../../middleware/authMiddleware.js';
// Temporarily disable auth middleware to test basic functionality

const router = express.Router();

// Create payment order
router.post('/create-order', createPaymentOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Handle payment failure
router.post('/failure', handlePaymentFailure);

// Get payment status
router.get('/status/:bookingId', getPaymentStatus);

// Process refund (protected route) - temporarily disabled auth
router.post('/refund', refundPayment);

export default router;
