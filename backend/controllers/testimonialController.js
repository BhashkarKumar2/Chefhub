import Testimonial from '../models/Testimonial.js';
import User from '../models/User.js';
import Chef from '../models/Chef.js';
import Booking from '../models/Booking.js';

// Create a new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { rating, testimonial, chefId, bookingId } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate required fields
    if (!rating || !testimonial) {
      return res.status(400).json({ 
        message: 'Rating and testimonial text are required' 
      });
    }

    // Get user details
    const user = await User.findById(userId).select('name email city state country profileImage');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let finalChefId = chefId;
    let booking = null;

    // If bookingId is provided, validate and get chef from booking
    if (bookingId) {
      booking = await Booking.findById(bookingId).populate('chef');
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Verify the booking belongs to the user
      if (booking.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to review this booking' });
      }
      
      // Check if booking is eligible for review (completed and within 48 hours)
      if (!booking.isReviewEligible()) {
        const reason = booking.status !== 'completed' 
          ? 'Only completed bookings can be reviewed'
          : 'Review window expired (48 hours after completion)';
        return res.status(400).json({ message: reason });
      }
      
      // Check for duplicate review
      const existingReview = await Testimonial.findOne({ booking: bookingId });
      if (existingReview) {
        return res.status(400).json({ 
          message: 'You have already reviewed this booking' 
        });
      }
      
      // Auto-populate chefId from booking
      finalChefId = booking.chef._id || booking.chef;
    }

    // Validate chef
    if (finalChefId) {
      const chef = await Chef.findById(finalChefId);
      if (!chef) {
        return res.status(404).json({ message: 'Chef not found' });
      }
    } else {
      return res.status(400).json({ 
        message: 'Chef ID is required' 
      });
    }

    // Construct location string
    const locationParts = [user.city, user.state, user.country].filter(Boolean);
    const userLocation = locationParts.length > 0 ? locationParts.join(', ') : 'India';

    // Create testimonial
    const newTestimonial = new Testimonial({
      user: userId,
      userName: user.name,
      userEmail: user.email,
      userLocation,
      userProfileImage: user.profileImage,
      rating: Number(rating),
      testimonial,
      chef: finalChefId,
      booking: bookingId || undefined,
      isApproved: true, // Auto-approved - no admin review needed
      isFeatured: false,
      isPublic: true
    });

    await newTestimonial.save();

    res.status(201).json({
      message: 'Testimonial published successfully!',
      testimonial: newTestimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: errors[0] || 'Validation failed',
        errors 
      });
    }
    
    // Handle duplicate key error for booking
    if (error.code === 11000 && error.keyPattern?.booking) {
      return res.status(400).json({ 
        message: 'You have already reviewed this booking' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to submit testimonial', 
      error: error.message 
    });
  }
};

// Get all public testimonials
export const getTestimonials = async (req, res) => {
  try {
    const { featured, limit = 50, chef } = req.query;
    
    const filter = { isPublic: true };
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    
    if (chef) {
      filter.chef = chef;
    }

    const testimonials = await Testimonial.find(filter)
      .populate('chef', 'name specialty profileImage')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch testimonials', 
      error: error.message 
    });
  }
};

// Get user's own testimonials
export const getUserTestimonials = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const testimonials = await Testimonial.find({ user: userId })
      .populate('chef', 'name specialty profileImage')
      .populate('booking', 'eventDate status')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: testimonials.length,
      testimonials
    });
  } catch (error) {
    console.error('Get user testimonials error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch your testimonials', 
      error: error.message 
    });
  }
};

// Get single testimonial by ID
export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id)
      .populate('user', 'name email profileImage')
      .populate('chef', 'name specialty profileImage')
      .populate('booking', 'eventDate status')
      .lean();

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch testimonial', 
      error: error.message 
    });
  }
};

// Check review eligibility for a booking
export const checkReviewEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id || req.user.id;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('chef', 'name');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Verify ownership
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to access this booking' 
      });
    }

    // Check if review already exists
    const existingReview = await Testimonial.findOne({ booking: bookingId });
    
    if (existingReview) {
      return res.json({
        success: true,
        hasReview: true,
        canReview: false,
        reason: 'You have already reviewed this booking',
        testimonial: existingReview
      });
    }

    // Check review eligibility
    const isEligible = booking.isReviewEligible();
    
    let reason = '';
    let expiresAt = null;
    
    if (booking.status !== 'completed') {
      reason = 'Booking must be completed before reviewing';
    } else if (!booking.completedAt) {
      reason = 'Booking completion date not available';
    } else if (!isEligible) {
      reason = 'Review window expired (48 hours after completion)';
    } else {
      // Calculate expiry time
      const completionTime = new Date(booking.completedAt).getTime();
      expiresAt = new Date(completionTime + (48 * 60 * 60 * 1000));
      reason = `You can review until ${expiresAt.toLocaleString()}`;
    }

    res.json({
      success: true,
      hasReview: false,
      canReview: isEligible,
      reason,
      expiresAt,
      booking: {
        id: booking._id,
        chefId: booking.chef._id,
        chefName: booking.chef.name,
        serviceType: booking.serviceType,
        date: booking.date,
        status: booking.status,
        completedAt: booking.completedAt
      }
    });
  } catch (error) {
    console.error('Check review eligibility error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to check review eligibility', 
      error: error.message 
    });
  }
};

// Update testimonial (user can only update their own)
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { rating, testimonial } = req.body;

    const existingTestimonial = await Testimonial.findById(id);

    if (!existingTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Verify ownership
    if (existingTestimonial.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this testimonial' });
    }

    // Update fields
    if (rating) existingTestimonial.rating = Number(rating);
    if (testimonial) existingTestimonial.testimonial = testimonial;
    
    // Keep testimonial approved - no admin review needed
    existingTestimonial.isApproved = true;

    await existingTestimonial.save();

    res.json({
      message: 'Testimonial updated successfully!',
      testimonial: existingTestimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: errors[0] || 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update testimonial', 
      error: error.message 
    });
  }
};

// Delete testimonial (user can only delete their own)
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Verify ownership
    if (testimonial.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this testimonial' });
    }

    await Testimonial.findByIdAndDelete(id);

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ 
      message: 'Failed to delete testimonial', 
      error: error.message 
    });
  }
};

// Admin: Approve testimonial
export const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isApproved = true;
    if (isFeatured !== undefined) {
      testimonial.isFeatured = isFeatured;
    }

    await testimonial.save();

    res.json({
      message: 'Testimonial approved successfully',
      testimonial
    });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ 
      message: 'Failed to approve testimonial', 
      error: error.message 
    });
  }
};
