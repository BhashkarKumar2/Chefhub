// Test script for Gemini AI models
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const testGeminiModels = async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-1.0-pro",
    "gemini-pro"  // This should fail
  ];
  
  console.log('🧪 Testing Gemini models...\n');
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Say hello in a friendly way");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} - SUCCESS`);
      console.log(`Response: ${text.substring(0, 50)}...\n`);
      
    } catch (error) {
      console.log(`❌ ${modelName} - FAILED`);
      console.log(`Error: ${error.message}\n`);
    }
  }
  
  console.log('🏁 Model testing complete!');
};

testGeminiModels().catch(console.error);
