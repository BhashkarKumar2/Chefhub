import express from 'express';
import { upload } from '../config/cloudinary.js';
import {
  createChefProfile,
  getAllChefs,
  searchChefs,
  getChefById,
  updateChefProfile,
  deleteChef,
  getChefMetadata
} from '../controllers/chefController.js';

const router = express.Router();

// Create chef profile with optional image upload (using Cloudinary)
router.post('/', upload.single('profileImage'), createChefProfile);

// Advanced search with filters
router.get('/search', searchChefs);

// Get metadata for filters (Cuisines, etc.)
router.get('/metadata', getChefMetadata);

// Get all active chefs
router.get('/', getAllChefs);

// Get chef by ID
router.get('/:id', getChefById);

// Update chef profile with optional image upload
router.put('/:id', upload.single('profileImage'), updateChefProfile);

// Soft delete chef (set isActive to false)
router.delete('/:id', deleteChef);

export default router;
