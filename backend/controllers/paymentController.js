import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', bookingId } = req.body;

    // console.log('=== Payment Order Creation Debug ===');
    // console.log('Request body:', req.body);
    // console.log('Amount received:', amount, typeof amount);
    // console.log('Currency:', currency);
    // console.log('Booking ID:', bookingId);

    // Validate required fields
    if (!amount || !bookingId) {
      // console.log('Validation failed: Missing amount or bookingId');
      return res.status(400).json({
        success: false,
        message: 'Amount and booking ID are required'
      });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      // console.log('Booking not found for ID:', bookingId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // console.log('Booking found:', booking._id);

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency,
      receipt: `bk_${bookingId.slice(-8)}_${Date.now().toString().slice(-8)}`, // Max 40 chars
      notes: {
        bookingId: bookingId,
        serviceType: booking.serviceType,
        chefId: booking.chef.toString(),
        guestCount: booking.guestCount
      }
    };

    // console.log('Order options for Razorpay:', orderOptions);
    // // console.log('Razorpay instance configured with:',
    //  {
    //   key_id: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
    //   key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'
    // });

    const order = await razorpay.orders.create(orderOptions);
    // console.log('Razorpay order created successfully:', order);

    // Update booking with order ID
    booking.paymentId = order.id;
    booking.paymentStatus = 'pending';
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
    // console.error('=== Payment Order Creation Error ===');
    // console.error('Error details:', error);
    // console.error('Error message:', error.message);
    // console.error('Error stack:', error.stack);
    
    // Check if it's a Razorpay specific error
    if (error.statusCode) {
      // console.error('Razorpay Error Code:', error.statusCode);
      // console.error('Razorpay Error Details:', error.error);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message,
      details: error.error || null
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

    // SECURITY: Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
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
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
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

    // Update booking status
    booking.paymentStatus = 'failed';
    booking.status = 'cancelled';
    booking.notes = `Payment failed: ${error?.description || 'Unknown error'}`;
    booking.updatedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      data: { booking }
    });

  } catch (error) {
    // console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling payment failure',
      error: error.message
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
    // console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment status',
      error: error.message
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
    // console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};
