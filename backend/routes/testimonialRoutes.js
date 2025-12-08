import express from 'express';
const router = express.Router();
import {
  createTestimonial,
  getTestimonials,
  getUserTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  checkReviewEligibility
} from '../controllers/testimonialController.js';
import { verifyToken } from '../auth/authMiddleware.js';

// Public routes
router.get('/', getTestimonials);

// Protected routes (require authentication)
router.post('/', verifyToken, createTestimonial);
router.get('/user/my-testimonials', verifyToken, getUserTestimonials);
router.get('/check/:bookingId', verifyToken, checkReviewEligibility);
router.get('/:id', getTestimonialById);
// router.put('/:id', verifyToken, updateTestimonial); // Disabled - reviews are permanent
router.delete('/:id', verifyToken, deleteTestimonial);

// Admin routes (add admin middleware later)
router.patch('/:id/approve', verifyToken, approveTestimonial);

export default router;
