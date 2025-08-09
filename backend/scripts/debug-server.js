// Debug server to find the exact issue
import './loadEnv.js';

console.log('Environment loaded');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Missing');
console.log('PORT:', process.env.PORT);

try {
  console.log('Importing express...');
  const express = await import('express');
  console.log('Express imported successfully');
  
  console.log('Importing cors...');
  const cors = await import('cors');
  console.log('CORS imported successfully');
  
  console.log('Importing mongoose...');
  const mongoose = await import('mongoose');
  console.log('Mongoose imported successfully');
  
  console.log('Creating app...');
  const app = express.default();
  console.log('App created successfully');
  
  console.log('Setting up middleware...');
  app.use(cors.default());
  app.use(express.default.json());
  
  console.log('Connecting to MongoDB...');
  await mongoose.default.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully');
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
  });
  
} catch (error) {
  console.error('Error in debug server:', error);
  console.error('Stack:', error.stack);
}
