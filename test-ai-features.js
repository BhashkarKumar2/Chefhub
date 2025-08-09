const axios = require('axios');

// Test configuration
const BASE_URL = 'https://chefhub.onrender.com';
const TEST_TOKEN = 'your_jwt_token_here'; // Replace with actual token

// Test data
const testData = {
  chefRecommendations: {
    preferences: {
      cuisine: 'Italian',
      budget: 5000,
      occasion: 'birthday party',
      guests: 10,
      dietary: ['vegetarian']
    }
  },
  menuGeneration: {
    eventType: 'birthday party',
    cuisine: 'Italian',
    guests: 10,
    budget: 5000,
    dietary: ['vegetarian'],
    duration: 3
  },
  pricingSuggestions: {
    chefId: 'test_chef_id',
    eventType: 'birthday party',
    guests: 10,
    duration: 3,
    services: ['cooking', 'serving']
  },
  searchFilters: {
    cuisine: 'Italian',
    minPrice: 1000,
    maxPrice: 10000,
    rating: 4,
    availability: true
  }
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testAIRecommendations = async () => {
  console.log('\n🤖 Testing AI Chef Recommendations...');
  const result = await makeRequest('POST', '/api/ai/chef-recommendations', testData.chefRecommendations);
  
  if (result) {
    console.log('✅ Chef recommendations generated successfully');
    console.log(`📊 Recommended ${result.recommendations?.length || 0} chefs`);
    if (result.recommendations?.[0]) {
      console.log(`🔥 Top recommendation: ${result.recommendations[0].name} (${result.recommendations[0].matchScore}% match)`);
    }
  } else {
    console.log('❌ Failed to get chef recommendations');
  }
};

const testMenuGeneration = async () => {
  console.log('\n🍽️ Testing AI Menu Generation...');
  const result = await makeRequest('POST', '/api/ai/generate-menu', testData.menuGeneration);
  
  if (result) {
    console.log('✅ Menu generated successfully');
    console.log(`📋 Generated ${result.menu?.courses?.length || 0} courses`);
    if (result.menu?.courses?.[0]) {
      console.log(`🥗 Sample course: ${result.menu.courses[0].name}`);
    }
  } else {
    console.log('❌ Failed to generate menu');
  }
};

const testPricingSuggestions = async () => {
  console.log('\n💰 Testing AI Pricing Suggestions...');
  const result = await makeRequest('POST', '/api/ai/pricing-suggestions', testData.pricingSuggestions);
  
  if (result) {
    console.log('✅ Pricing suggestions generated successfully');
    console.log(`💵 Suggested price: ₹${result.suggestions?.basePrice || 'N/A'}`);
    console.log(`📈 Price range: ₹${result.suggestions?.priceRange?.min || 'N/A'} - ₹${result.suggestions?.priceRange?.max || 'N/A'}`);
  } else {
    console.log('❌ Failed to get pricing suggestions');
  }
};

const testAdvancedSearch = async () => {
  console.log('\n🔍 Testing Advanced Search...');
  const queryParams = new URLSearchParams(testData.searchFilters).toString();
  const result = await makeRequest('GET', `/api/chefs/search?${queryParams}`);
  
  if (result) {
    console.log('✅ Advanced search completed successfully');
    console.log(`📊 Found ${result.chefs?.length || 0} chefs`);
    console.log(`📄 Page ${result.pagination?.currentPage || 1} of ${result.pagination?.totalPages || 1}`);
    console.log(`🎯 Total results: ${result.pagination?.totalChefs || 0}`);
  } else {
    console.log('❌ Failed to perform advanced search');
  }
};

const testChatbot = async () => {
  console.log('\n💬 Testing AI Chatbot...');
  const chatData = {
    message: 'I need a chef for an Italian dinner party for 8 people. What would you recommend?',
    context: {
      userLocation: 'Mumbai',
      previousBookings: []
    }
  };
  
  const result = await makeRequest('POST', '/api/ai/chat', chatData);
  
  if (result) {
    console.log('✅ Chatbot response generated successfully');
    console.log(`🤖 Response: ${result.response?.substring(0, 100)}...`);
  } else {
    console.log('❌ Failed to get chatbot response');
  }
};

const testHealthCheck = async () => {
  console.log('\n🏥 Testing Server Health...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy');
    console.log(`📊 Status: ${response.data.status}`);
    console.log(`⏰ Uptime: ${response.data.uptime}`);
  } catch (error) {
    console.log('❌ Server health check failed');
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting ChefHub AI Features Test Suite');
  console.log('=' * 50);
  
  // Check if server is running
  await testHealthCheck();
  
  // Test AI features
  await testAIRecommendations();
  await testMenuGeneration();
  await testPricingSuggestions();
  await testAdvancedSearch();
  await testChatbot();
  
  console.log('\n' + '=' * 50);
  console.log('🏁 Test suite completed!');
  console.log('\n📝 Notes:');
  console.log('- Make sure your backend server is running on port 5000');
  console.log('- Replace TEST_TOKEN with a valid JWT token');
  console.log('- Ensure you have a valid GEMINI_API_KEY in your .env file');
  console.log('- Some tests may fail if MongoDB is not populated with test data');
};

// Handle command line arguments
const testName = process.argv[2];

if (testName) {
  switch (testName) {
    case 'recommendations':
      testAIRecommendations();
      break;
    case 'menu':
      testMenuGeneration();
      break;
    case 'pricing':
      testPricingSuggestions();
      break;
    case 'search':
      testAdvancedSearch();
      break;
    case 'chat':
      testChatbot();
      break;
    case 'health':
      testHealthCheck();
      break;
    default:
      console.log('Available tests: recommendations, menu, pricing, search, chat, health');
      console.log('Usage: node test-ai-features.js [test-name]');
      console.log('Or run all tests: node test-ai-features.js');
  }
} else {
  runAllTests();
}

module.exports = {
  testAIRecommendations,
  testMenuGeneration,
  testPricingSuggestions,
  testAdvancedSearch,
  testChatbot,
  testHealthCheck
};
