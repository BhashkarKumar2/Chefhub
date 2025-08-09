import './config/loadEnv.js';
import geminiService from './services/geminiService.js';

// Test data
const userPreferences = {
  cuisine: 'Italian',
  budget: '5000',
  occasion: 'birthday party',
  guests: '10'
};

const mockChefs = [
  {
    _id: '688ef81ac23cf34145f7e298',
    name: 'Bhashkar Kumar',
    specialty: 'Chinese',
    pricePerHour: 100,
    experienceYears: 10,
    bio: 'Experienced chef',
    rating: 4.5
  },
  {
    _id: '688f13b98895309ccc778c62',
    name: 'Bhashkar Kumar',
    specialty: 'Indian, Italian',
    pricePerHour: 10,
    experienceYears: 3,
    bio: 'Multi-cuisine chef',
    rating: 3.8
  }
];

async function testRecommendations() {
  try {
    console.log('🧪 Testing chef recommendations...');
    const result = await geminiService.getChefRecommendations(userPreferences, mockChefs);
    console.log('✅ Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRecommendations();
