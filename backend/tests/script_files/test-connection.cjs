const mongoose = require('mongoose');
require('./config/loadEnv');

async function testConnection() {
  console.log('\n🧪 === TESTING MONGODB CONNECTION ===\n');
  
  console.log('🔗 Connection String:', process.env.MONGO_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
  console.log('🌐 Your Current IP:', '103.199.123.129');
  
  try {
    console.log('⏳ Attempting to connect...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ FAILED: Cannot connect to MongoDB');
    console.error('💡 Error:', error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🛠️ TO FIX THIS ISSUE:');
      console.log('1. Go to: https://cloud.mongodb.com/');
      console.log('2. Navigate to: Network Access');
      console.log('3. Click: Add IP Address');
      console.log('4. Add IP: 103.199.123.129');
      console.log('5. Or add: 0.0.0.0/0 (for development)');
      console.log('6. Wait 1-2 minutes and try again');
    }
  }
  
  console.log('\n🧪 === CONNECTION TEST COMPLETED ===\n');
  process.exit(0);
}

testConnection();
