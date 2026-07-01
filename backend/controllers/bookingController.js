import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';

// Helper: Check for surge pricing
const checkSurgePricing = (dateObj) => {
  const day = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = (day === 0 || day === 5 || day === 6); // Fri, Sat, Sun

  if (isWeekend) {
    return { multiplier: 1.2, reason: 'Weekend Demand' };
  }

  // Example Holiday Logic (Hardcoded for demo)
  // const month = dateObj.getMonth();
  // const date = dateObj.getDate();
  // if (month === 11 && (date === 24 || date === 25 || date === 31)) ...

  return { multiplier: 1.0, reason: '' };
};

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
      contactInfo
    } = req.body;

    // console.log('Creating booking with data:', req.body);

    // Use chef or chefId
    const selectedChefId = chef || chefId;

    // Validate required fields
    if (!selectedChefId || !serviceType || !date || !time || !guestCount) { // Removed totalPrice check as we calculate it
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

    // Check if chef exists (only pricePerHour is needed for the quote below)
    const chefDoc = await Chef.findById(selectedChefId).select('pricePerHour').lean();
    if (!chefDoc) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    // Check for availability conflicts
    const requestedDate = new Date(date);
    // Normalize to start/end of day to catch all bookings on that date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      chef: selectedChefId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled', 'rejected'] }
    }).select('time duration').lean();

    const getMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const reqStart = getMinutes(time);
    const reqDuration = parseInt(duration) || 2;
    const reqEnd = reqStart + (reqDuration * 60);

    const conflict = existingBookings.find(booking => {
      const bookStart = getMinutes(booking.time);
      const bookEnd = bookStart + (booking.duration * 60);
      // Check overlap: (StartA < EndB) and (EndA > StartB)
      return (reqStart < bookEnd && reqEnd > bookStart);
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Chef is already booked for this time slot',
        conflict: {
          date: conflict.date,
          time: conflict.time,
          duration: conflict.duration
        }
      });
    }

    // Validate authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // DYNAMIC PRICING LOGIC
    const surge = checkSurgePricing(new Date(date));
    const basePrice = chefDoc.pricePerHour * (parseInt(duration) || 2);
    const finalPrice = Math.round(basePrice * surge.multiplier);

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
      totalPrice: finalPrice,
      basePrice: basePrice,
      surgeMultiplier: surge.multiplier,
      surgeReason: surge.reason,
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

    // SECURITY: Only the chef themselves can view their bookings (contains customer PII)
    // Compare the requesting user with the chef's linked user account if applicable
    // For now, we require the requesting user ID to match the chefId or be an admin
    if (req.user.id.toString() !== chefId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
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

    // SECURITY: Only booking owner or the chef can update status
    const isBookingOwner = booking.user && booking.user.toString() === req.user.id.toString();
    const isChef = booking.chef && booking.chef.toString() === req.user.id.toString();

    if (!isBookingOwner && !isChef) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the booking owner or chef can update this booking.'
      });
    }

    // Check if status is changing to completed (before updating)
    const wasNotCompleted = booking.status !== 'completed';

    booking.status = status;
    booking.updatedAt = new Date();

    // Set completedAt timestamp when status changes to completed
    if (status === 'completed' && wasNotCompleted) {
      booking.completedAt = new Date();
    }

    await booking.save();

    await booking.populate('chef', 'name email phone specialties pricePerHour');
    if (booking.user) {
      await booking.populate('user', 'name email phone');
    }

    // Send review reminder email when booking is completed
    if (status === 'completed' && wasNotCompleted && booking.user) {
      try {
        const { sendReviewReminderEmail } = await import('./emailVerificationController.js');
        const user = await User.findById(booking.user);
        if (user) {
          await sendReviewReminderEmail(
            user.email,
            user.name,
            booking.chef.name,
            booking._id.toString()
          );
        }
      } catch (emailError) {
        // console.error('Failed to send review reminder email:', emailError);
        // Don't fail the booking update if email fails
      }
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
    // Compute every metric in a single pass over the collection instead of
    // issuing 10 separate queries (5 status counts + 3 service-type counts +
    // total + revenue). $facet runs the sub-pipelines against one cursor.
    const [facet] = await Booking.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          serviceTypeBreakdown: [
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
          ],
          revenue: [
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
          ]
        }
      }
    ]);

    // Fold the grouped arrays into keyed objects with sane defaults.
    const countsByKey = (rows) =>
      (rows || []).reduce((acc, { _id, count }) => {
        if (_id) acc[_id] = count;
        return acc;
      }, {});

    const statusCounts = countsByKey(facet.statusBreakdown);
    const serviceCounts = countsByKey(facet.serviceTypeBreakdown);

    res.status(200).json({
      success: true,
      data: {
        totalBookings: facet.total[0]?.count || 0,
        statusBreakdown: {
          pending: statusCounts.pending || 0,
          confirmed: statusCounts.confirmed || 0,
          completed: statusCounts.completed || 0,
          cancelled: statusCounts.cancelled || 0
        },
        serviceTypeBreakdown: {
          birthday: serviceCounts.birthday || 0,
          marriage: serviceCounts.marriage || 0,
          daily: serviceCounts.daily || 0
        },
        totalRevenue: facet.revenue[0]?.total || 0
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

// Get booking price quote (Dynamic Pricing)
export const getBookingQuote = async (req, res) => {
  try {
    const { chefId, date, duration } = req.body;

    if (!chefId || !date || !duration) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({ success: false, message: 'Chef not found' });
    }

    const surge = checkSurgePricing(new Date(date));
    const basePrice = chef.pricePerHour * parseInt(duration);
    const finalPrice = Math.round(basePrice * surge.multiplier);

    res.json({
      success: true,
      data: {
        basePrice,
        finalPrice,
        surgeMultiplier: surge.multiplier,
        surgeReason: surge.reason,
        currency: 'INR'
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get quote', error: error.message });
  }
};

// Legacy function for backward compatibility
export const getBookingsByUser = getUserBookings;
