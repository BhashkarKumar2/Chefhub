// Test environment loading
import './loadEnv.js';

// console.log('ðŸ” Environment Variables Test:');
// console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Missing');
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing');
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Missing');
// console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Missing');

if (process.env.GOOGLE_CLIENT_ID) {
  // console.log('âœ… Google Client ID loaded successfully');
  // console.log('First 20 chars:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
} else {
  // console.log('âŒ Google Client ID not found');
}
