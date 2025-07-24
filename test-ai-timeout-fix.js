// Test AI Template Generation with Timeout Fix
// Run this to test the timeout improvements

import { geminiService } from '../src/services/geminiService.js';

const testAITimeout = async () => {
  console.log('🧪 Testing AI Template Generation with Timeout Fix...');
  
  try {
    const startTime = Date.now();
    
    const response = await geminiService.generateTemplate({
      subject: 'Matematika',
      topic: 'Aljabar Linear',
      duration: 90,
      gradeLevel: '10',
      additionalContext: 'Siswa baru mengenal konsep dasar aljabar'
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ AI Generation successful!`);
    console.log(`⏱️ Duration: ${duration}ms (${Math.round(duration / 1000)}s)`);
    console.log(`📊 Response:`, response.success ? 'Success' : 'Failed');
    
    if (response.success && response.data?.template) {
      console.log(`📝 Generated template name: ${response.data.template.name}`);
      console.log(`🎯 Learning objectives: ${response.data.template.learningObjectives?.length || 0} items`);
    }
    
  } catch (error) {
    console.error('❌ AI Generation failed:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️ This was a timeout error - the new timeout settings should prevent this');
    } else if (error.message.includes('rate limit')) {
      console.log('⚠️ Rate limit hit - this is expected with heavy testing');
    } else {
      console.log('⚠️ Other error - check API configuration');
    }
  }
};

// Run the test
testAITimeout();
