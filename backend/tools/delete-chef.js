// Script to delete existing chef profile
import './loadEnv.js';
import mongoose from 'mongoose';
import Chef from './models/Chef.js';

async function deleteChefByEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const email = 'BhashkarKumar2@gmail.com';
    const result = await Chef.deleteOne({ email: email });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Successfully deleted chef profile with email: ${email}`);
    } else {
      console.log(`❌ No chef profile found with email: ${email}`);
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteChefByEmail();
