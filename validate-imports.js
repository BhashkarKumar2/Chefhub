#!/usr/bin/env node

// Import validation script for the restructured project
import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Import Statements...\n');

// Test backend imports
console.log('📁 Backend Tests:');
try {
  await import('./backend/src/auth/authController.js');
  console.log('✅ Backend auth controller imports work');
} catch (e) {
  console.error('❌ Backend auth controller error:', e.message);
}

try {
  await import('./backend/src/models/User.js');
  console.log('✅ Backend User model imports work');
} catch (e) {
  console.error('❌ Backend User model error:', e.message);
}

try {
  await import('./backend/src/controllers/chefController.js');
  console.log('✅ Backend chef controller imports work');
} catch (e) {
  console.error('❌ Backend chef controller error:', e.message);
}

console.log('\n📱 Frontend Tests:');
console.log('Note: Frontend imports will be validated when the React app runs');

console.log('\n🎯 Import Structure Summary:');
console.log('📂 Backend organized structure:');
console.log('   └── src/');
console.log('       ├── auth/ (authController, authMiddleware, Passport)');
console.log('       ├── models/ (User, Chef, Booking)');
console.log('       ├── controllers/ (chefController, bookingController)');
console.log('       ├── routes/ (userRoutes, chefRoutes, bookingRoutes)');
console.log('       └── services/ (smsService)');
console.log('');
console.log('📂 Frontend organized structure:');
console.log('   └── pages/');
console.log('       ├── auth/ (Login, SignupNew, MobileLogin, etc.)');
console.log('       ├── user/ (Dashboard, Profile, EditProfile, etc.)');
console.log('       ├── chef/ (ChefProfile, ChefOnboarding, BookChef)');
console.log('       └── public/ (Home, About, Contact, Services)');

console.log('\n✅ Import validation complete!');
