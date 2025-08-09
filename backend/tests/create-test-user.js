// Script to create a test user for profile testing
import './loadEnv.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 User ID:', existingUser._id);
      console.log('👤 Name:', existingUser.name);
      await mongoose.disconnect();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '+91-1234567890',
      city: 'Mumbai',
      bio: 'Test user for profile updates'
    });
    
    await testUser.save();
    
    console.log('✅ Test user created successfully:');
    console.log('📧 Email: test@example.com');
    console.log('🔐 Password: password123');
    console.log('🆔 User ID:', testUser._id);
    console.log('👤 Name:', testUser.name);
    console.log('\n🔧 Use this User ID in your frontend for testing profile updates');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
