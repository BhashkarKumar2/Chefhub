import geminiService from './services/geminiService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMenuGeneration() {
  // console.log('ðŸ§ª Testing Menu Generation...\n');
  
  const eventDetails = {
    serviceType: 'birthday',
    guests: '10',
    budget: '15000',
    cuisine: 'North Indian',
    dietary: 'Vegetarian',
    mealTime: 'Dinner'
  };
  
  // console.log('Event Details:', eventDetails);
  // console.log('\nðŸ¤– Generating menu with AI...\n');
  
  try {
    const menu = await geminiService.generateEventMenu(eventDetails);
    // console.log('âœ… Menu Generated Successfully:');
    // console.log(JSON.stringify(menu, null, 2));
    
    // Test the structure
    // console.log('\nðŸ” Testing Structure:');
    // console.log('Appetizers:', Array.isArray(menu.appetizers) ? `âœ… ${menu.appetizers.length} items` : 'âŒ Not an array');
    // console.log('Main Course:', Array.isArray(menu.mainCourse) ? `âœ… ${menu.mainCourse.length} items` : 'âŒ Not an array');
    // console.log('Desserts:', Array.isArray(menu.desserts) ? `âœ… ${menu.desserts.length} items` : 'âŒ Not an array');
    
  } catch (error) {
    // console.error('âŒ Menu Generation Failed:', error.message);
  }
}

testMenuGeneration();
