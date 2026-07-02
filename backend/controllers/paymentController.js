import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // SECURITY: only the user who owns the booking may pay for it.
    if (!booking.user || booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Idempotency: never create a fresh order for an already-paid booking.
    if (booking.paymentStatus === 'paid') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been paid'
      });
    }

    // SECURITY: the payable amount is derived from the trusted server-side
    // booking total, never from the client. This prevents a client from
    // paying an arbitrary (e.g. ₹1) amount for an expensive booking.
    const amount = booking.totalPrice;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking has no payable amount'
      });
    }
    const currency = booking.currency || 'INR';

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: `bk_${bookingId.slice(-8)}_${Date.now().toString().slice(-8)}`, // Max 40 chars
      notes: {
        bookingId: bookingId,
        serviceType: booking.serviceType,
        chefId: booking.chef.toString(),
        guestCount: booking.guestCount
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // COMMISSION LOGIC (20% Split) — computed from the trusted amount.
    const COMMISSION_RATE = 20; // 20%
    const adminCommission = Math.round((amount * COMMISSION_RATE) / 100);
    const chefEarnings = amount - adminCommission;

    // Update booking with payment info AND financial split
    booking.paymentId = order.id;
    booking.paymentStatus = 'pending';

    // Revenue Split Fields
    booking.adminCommission = adminCommission;
    booking.chefEarnings = chefEarnings;
    booking.commissionRate = COMMISSION_RATE;
    booking.currency = currency;

    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID,
        booking: booking
      }
    });

  } catch (error) {
    logger.error('Payment order creation failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating payment order'
    });
  }
};

// Verify payment with proper Razorpay signature verification
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters (order_id, payment_id, signature required)'
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // SECURITY: only the booking owner may confirm its payment.
    if (!booking.user || booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this booking'
      });
    }

    // Idempotency: if already paid, succeed without re-processing.
    if (booking.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: { booking }
      });
    }

    // SECURITY: the order being verified must be the exact order that was
    // created for this booking (createPaymentOrder stored it in paymentId).
    // Without this, a valid signature from any cheap order the attacker
    // created could be replayed to confirm a different/expensive booking.
    if (!booking.paymentId || booking.paymentId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order does not match this booking'
      });
    }

    // SECURITY: Verify Razorpay signature (constant-time comparison)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(String(razorpay_signature), 'utf8');
    const signatureValid = expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!signatureValid) {
      logger.warn('Payment signature verification failed', { bookingId });
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Signature verified - update booking status
    booking.paymentStatus = 'paid';
    booking.paymentId = razorpay_payment_id;
    booking.status = 'confirmed';
    booking.updatedAt = new Date();
    await booking.save();

    // Populate booking details for response
    await booking.populate('chef', 'name email phone specialties');
    if (booking.user) {
      await booking.populate('user', 'name email phone');
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        booking: booking,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      }
    });

  } catch (error) {
    logger.error('Payment verification failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId, error } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Find and update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // SECURITY: only the booking owner may mark their booking as failed.
    if (!booking.user || booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this booking'
      });
    }

    // SECURITY: never let a "failure" report cancel an already-paid booking.
    if (booking.paymentStatus === 'paid') {
      return res.status(409).json({
        success: false,
        message: 'Cannot mark a paid booking as failed'
      });
    }

    // Update booking status (sanitize/limit the client-supplied reason)
    const reason = String(error?.description || 'Unknown error').replace(/[<>]/g, '').slice(0, 200);
    booking.paymentStatus = 'failed';
    booking.status = 'cancelled';
    booking.notes = `Payment failed: ${reason}`;
    booking.updatedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      data: { booking }
    });

  } catch (error) {
    logger.error('Handling payment failure failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error handling payment failure'
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('chef', 'name email phone specialties')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // SECURITY: this response contains customer + chef PII. Only the booking
    // owner or the assigned chef may read it (IDOR prevention).
    const requesterId = req.user.id.toString();
    const ownerId = booking.user && (booking.user._id || booking.user).toString();
    const chefId = booking.chef && (booking.chef._id || booking.chef).toString();
    if (requesterId !== ownerId && requesterId !== chefId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        status: booking.status,
        totalPrice: booking.totalPrice,
        booking: booking
      }
    });

  } catch (error) {
    logger.error('Getting payment status failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting payment status'
    });
  }
};

// Refund payment (for cancellations)
export const refundPayment = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // SECURITY: only the booking owner may request a refund on their booking.
    // Without this, anyone could trigger real refunds on arbitrary bookings.
    if (!booking.user || booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this booking'
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid booking'
      });
    }

    // Calculate refund amount based on booking policy
    const refundAmount = booking.getRefundAmount();

    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No refund available for this booking'
      });
    }

    // Create refund
    const refund = await razorpay.payments.refund(booking.paymentId, {
      amount: Math.round(refundAmount * 100), // Amount in paise
      notes: {
        reason: reason || 'Booking cancellation',
        bookingId: bookingId
      }
    });

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    booking.notes = `Refund processed: Rs. ${refundAmount}. Reason: ${reason || 'Booking cancellation'}`;
    booking.updatedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        refundAmount: refundAmount,
        booking: booking
      }
    });

  } catch (error) {
    logger.error('Processing refund failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error processing refund'
    });
  }
};

// Get earnings statistics for a chef
export const getChefEarnings = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const chefId = req.user.id;
    const chefObjectId = new mongoose.Types.ObjectId(chefId);

    // These three reads are independent — run them concurrently instead of
    // waiting for each round-trip in series.
    const [stats, recentTransactions, pendingStats] = await Promise.all([
      // Aggregation pipeline to calculate totals
      Booking.aggregate([
        {
          $match: {
            chef: chefObjectId,
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$chefEarnings' },
            totalBookings: { $sum: 1 }
          }
        }
      ]),
      // Get recent transactions
      Booking.find({
        chef: chefId,
        paymentStatus: 'paid'
      })
        .select('date totalPrice chefEarnings adminCommission status paymentStatus createdAt user serviceType')
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Booking.aggregate([
        {
          $match: {
            chef: chefObjectId,
            status: 'pending'
          }
        },
        {
          $group: {
            _id: null,
            potentialEarnings: { $sum: '$chefEarnings' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: stats.length > 0 ? stats[0].totalEarnings : 0,
        completedBookings: stats.length > 0 ? stats[0].totalBookings : 0,
        pendingEarnings: pendingStats.length > 0 ? pendingStats[0].potentialEarnings : 0,
        recentTransactions: recentTransactions
      }
    });

  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings data',
      error: error.message
    });
  }
};
