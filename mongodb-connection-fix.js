#!/usr/bin/env node

/**
 * MongoDB Atlas Connection Issue Resolution Guide
 * This script provides step-by-step instructions to fix the connection issue
 */

console.log('\n🚨 === MONGODB ATLAS CONNECTION ISSUE ===\n');

console.log('🐛 ERROR DETAILS:');
console.log('- MongooseServerSelectionError: Could not connect to any servers');
console.log('- Cluster: ac-pdyrq0p-shard-00 (atlas-2fljr4-shard-0)');
console.log('- Common Cause: IP address not whitelisted in MongoDB Atlas');

console.log('\n🔍 CURRENT CONNECTION STRING:');
console.log('mongodb+srv://user123:bhashkar@cluster1.n91a6v0.mongodb.net/cook');

console.log('\n✅ STEP-BY-STEP RESOLUTION:\n');

console.log('1. 🌐 Check Your Current IP Address:');
console.log('   • Visit: https://whatismyipaddress.com/');
console.log('   • Or run: curl https://api.ipify.org');
console.log('   • Note down your current public IP address');

console.log('\n2. 🔐 Access MongoDB Atlas Dashboard:');
console.log('   • Go to: https://cloud.mongodb.com/');
console.log('   • Login with your MongoDB Atlas account');
console.log('   • Select your project/cluster');

console.log('\n3. 🛡️ Update IP Whitelist:');
console.log('   • In Atlas Dashboard, go to "Network Access" (left sidebar)');
console.log('   • Click "Add IP Address" button');
console.log('   • Option A: Add your current IP address');
console.log('   • Option B: Add "0.0.0.0/0" (allow all IPs - less secure)');
console.log('   • Click "Confirm"');

console.log('\n4. 🔑 Verify Database User Credentials:');
console.log('   • Go to "Database Access" in Atlas Dashboard');
console.log('   • Ensure user "user123" exists and has proper permissions');
console.log('   • If not, create a new user with "readWrite" permissions');

console.log('\n5. 🔗 Alternative: Use Local MongoDB:');
console.log('   • Install MongoDB locally');
console.log('   • Update .env file:');
console.log('     MONGO_URI=mongodb://localhost:27017/cook');

console.log('\n⚡ QUICK FIX OPTIONS:\n');

console.log('OPTION 1: Whitelist Current IP');
console.log('  1. Get your IP: curl https://api.ipify.org');
console.log('  2. Add it to Atlas Network Access');
console.log('  3. Wait 1-2 minutes for changes to propagate');

console.log('\nOPTION 2: Allow All IPs (Development Only)');
console.log('  1. In Atlas Network Access, add IP: 0.0.0.0/0');
console.log('  2. This allows connections from any IP');
console.log('  3. ⚠️ Less secure - only for development');

console.log('\nOPTION 3: Use Local MongoDB');
console.log('  1. Install MongoDB Community Server');
console.log('  2. Start MongoDB service');
console.log('  3. Update MONGO_URI in .env file');

console.log('\n🔄 TESTING CONNECTION:\n');
console.log('After making changes, test with:');
console.log('  cd backend');
console.log('  node -e "const mongoose = require(\'mongoose\'); mongoose.connect(process.env.MONGO_URI).then(() => console.log(\'✅ Connected\')).catch(err => console.log(\'❌ Failed:\', err.message));"');

console.log('\n⏰ IMPORTANT NOTES:');
console.log('• IP whitelist changes take 1-2 minutes to propagate');
console.log('• Dynamic IPs change frequently - consider static IP or local MongoDB');
console.log('• For production, use specific IP ranges, not 0.0.0.0/0');

console.log('\n🚀 RESTART AFTER FIXING:');
console.log('After resolving the IP issue:');
console.log('  1. Wait 2 minutes for Atlas changes');
console.log('  2. Restart your backend server');
console.log('  3. Check connection logs');

console.log('\n🛠️ === RESOLUTION GUIDE COMPLETED ===\n');
