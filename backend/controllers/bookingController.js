import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      chef,
      chefId, // Also accept chefId for backward compatibility
      date,
      time,
      duration,
      guestCount,
      location,
      serviceType,
      specialRequests,
      addOns,
      totalPrice,
      contactInfo
    } = req.body;

    // console.log('Creating booking with data:', req.body);

    // Use chef or chefId
    const selectedChefId = chef || chefId;

    // Validate required fields
    if (!selectedChefId || !serviceType || !date || !time || !guestCount || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate service type
    const validServiceTypes = ['birthday', 'marriage', 'daily'];
    if (!validServiceTypes.includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service type. Must be birthday, marriage, or daily'
      });
    }

    // Check if chef exists
    const chefDoc = await Chef.findById(selectedChefId);
    if (!chefDoc) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    // Validate authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      chef: selectedChefId,
      date: new Date(date),
      time,
      duration: parseInt(duration) || 2,
      guestCount: parseInt(guestCount),
      location: location || "Customer's location",
      serviceType,
      specialRequests: specialRequests || '',
      addOns: addOns || [],
      totalPrice: parseFloat(totalPrice),
      contactInfo: contactInfo || {},
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date()
    });

    await booking.save();

    // Populate chef and user details for response
    await booking.populate('chef', 'name fullName email phone specialties pricePerHour profileImage rating');
    await booking.populate('user', 'name email phone');

    // console.log('Booking created successfully:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: booking
    });

  } catch (error) {
    // console.error('Error creating booking:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate('chef', 'name fullName email phone specialties pricePerHour profileImage rating')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    // console.error('Error fetching user bookings:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all bookings for a chef
export const getChefBookings = async (req, res) => {
  try {
    const { chefId } = req.params;

    // Verify chef exists
    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    const bookings = await Booking.find({ chef: chefId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    // console.error('Error fetching chef bookings:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find booking and verify ownership
    const booking = await Booking.findOne({ 
      _id: id, 
      user: req.user.id 
    })
    .populate('chef', 'name fullName email phone specialties pricePerHour profileImage rating bio rate')
    .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking: booking
    });

  } catch (error) {
    // console.error('Error fetching booking:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, confirmed, cancelled, or completed'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    await booking.populate('chef', 'name email phone specialties pricePerHour');
    if (booking.user) {
      await booking.populate('user', 'name email phone');
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking: booking
    });

  } catch (error) {
    // console.error('Error updating booking status:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete/Cancel a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to delete (either the booking owner or admin)
    if (req.user && booking.user && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    // console.error('Error deleting booking:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get booking statistics (for analytics)
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Service type breakdown
    const birthdayBookings = await Booking.countDocuments({ serviceType: 'birthday' });
    const marriageBookings = await Booking.countDocuments({ serviceType: 'marriage' });
    const dailyBookings = await Booking.countDocuments({ serviceType: 'daily' });

    // Revenue calculation
    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        statusBreakdown: {
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        },
        serviceTypeBreakdown: {
          birthday: birthdayBookings,
          marriage: marriageBookings,
          daily: dailyBookings
        },
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      }
    });

  } catch (error) {
    // console.error('Error fetching booking stats:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Legacy function for backward compatibility
export const getBookingsByUser = getUserBookings;
