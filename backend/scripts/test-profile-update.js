// Test script to verify user profile update
import './loadEnv.js';
import mongoose from 'mongoose';
import User from './models/User.js';

async function testProfileUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const userId = '688f1698011794190d7203f6';
    
    // Test data that matches updated User model
    const updateData = {
      name: "Bhashkar Kumar Updated",
      email: "test@example.com", // Keep existing email
      phone: "+91-9876543210",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      cuisinePreferences: ["indian", "italian"],
      bio: "Food enthusiast and cooking lover - Updated!"
    };
    
    console.log('🔄 Testing profile update...');
    console.log('📝 Update Data:', JSON.stringify(updateData, null, 2));
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (updatedUser) {
      console.log('✅ Profile update successful!');
      console.log('👤 Updated User:', JSON.stringify(updatedUser, null, 2));
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testProfileUpdate();
