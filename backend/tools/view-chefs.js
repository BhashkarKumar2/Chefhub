// Script to view all chef profiles in database
import './loadEnv.js';
import mongoose from 'mongoose';
import Chef from './models/Chef.js';

async function viewAllChefs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // console.log('ðŸ“Š Connected to MongoDB');
    
    const chefs = await Chef.find({});
    // console.log(`\nðŸ‘¨â€ðŸ³ Found ${chefs.length} chef(s) in database:\n`);
    
    chefs.forEach((chef, index) => {
      // console.log(`${index + 1}. Chef Profile:`);
      // console.log(`   ID: ${chef._id}`);
      // console.log(`   Name: ${chef.name}`);
      // console.log(`   Email: ${chef.email}`);
      // console.log(`   Phone: ${chef.phone}`);
      // console.log(`   Specialty: ${chef.specialty}`);
      // console.log(`   Rate: Rs.${chef.pricePerHour}/hour`);
      // console.log(`   Experience: ${chef.experienceYears} years`);
      // console.log(`   Bio: ${chef.bio.substring(0, 100)}...`);
      // console.log(`   Image: ${chef.profileImage?.url ? 'Yes' : 'No'}`);
      // console.log(`   Active: ${chef.isActive}`);
      // console.log(`   Created: ${chef.createdAt}`);
      // console.log(`   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n`);
    });
    
    await mongoose.disconnect();
    // console.log('âœ… Disconnected from MongoDB');
  } catch (error) {
    // console.error('âŒ Error:', error);
  }
}

viewAllChefs();
