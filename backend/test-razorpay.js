import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing Razorpay Configuration...');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Test order creation
const testOrder = async () => {
  try {
    console.log('\nCreating test order...');
    
    const orderOptions = {
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        test: 'test_payment'
      }
    };
    
    console.log('Order options:', orderOptions);
    
    const order = await razorpay.orders.create(orderOptions);
    console.log('✅ Order created successfully:', order);
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('Error details:', error.error);
  }
};

testOrder();
