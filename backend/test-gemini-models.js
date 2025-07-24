// Test available Gemini models
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiModels() {
  console.log('🤖 Testing Gemini models...\n');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Test model terbaru Juli 2025
  const modelsToTest = [
    'gemini-2.5-pro',        // Model terbaru dan paling canggih
    'gemini-2.5-flash'       // Model flash yang cepat dan efisien
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = "Hello, this is a test message. Please respond with 'Model working correctly'.";
      
      // Set timeout untuk setiap model test (lebih cepat)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const testPromise = model.generateContent(prompt);
      const result = await Promise.race([testPromise, timeoutPromise]);
      
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} - Working: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.log(`❌ ${modelName} - Error: ${error.message}`);
    }
  }
}

testGeminiModels();
