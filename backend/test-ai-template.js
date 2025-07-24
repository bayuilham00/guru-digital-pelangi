// Test AI Template Generation
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  identifier: 'admin@pelangi.sch.id',
  password: 'admin123'
};

let authToken = '';

async function testAITemplateGeneration() {
  console.log('🤖 Testing AI Template Generation...\n');

  // Step 1: Login
  console.log('1️⃣ Logging in...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials)
    });

    const result = await response.json();
    if (result.success && result.data.token) {
      authToken = result.data.token;
      console.log('✅ Login successful - Role:', result.data.user.role);
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return;
  }

  // Step 2: Check AI status
  console.log('\n2️⃣ Checking AI status...');
  try {
    const response = await fetch(`${API_BASE_URL}/ai/status`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ AI Status:', result.data.aiAvailable ? 'Available' : 'Not Available');
      console.log('📝 Service:', result.data.service);
      console.log('📝 Model:', result.data.model);
    }
  } catch (error) {
    console.error('❌ Failed to check AI status:', error.message);
  }

  // Step 3: Generate template without saving
  console.log('\n3️⃣ Generating template without saving...');
  try {
    const requestData = {
      subject: 'Matematika',
      topic: 'Persamaan Linear Satu Variabel',
      duration: 90,
      gradeLevel: '7-9',
      additionalContext: 'Fokus pada pemahaman konsep dasar dan penerapan dalam kehidupan sehari-hari',
      saveAsTemplate: false
    };

    const response = await fetch(`${API_BASE_URL}/ai/generate-template`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Template generated successfully');
      console.log('📝 Template name:', result.data.template.name);
      console.log('📝 Duration:', result.data.template.estimatedDuration, 'minutes');
      console.log('📝 Difficulty:', result.data.template.difficultyLevel);
      console.log('📝 Learning objectives:', result.data.template.learningObjectives?.length || 0);
      console.log('📝 Key activities:', result.data.template.keyActivities?.length || 0);
      console.log('📝 Generated at:', result.data.generatedAt);
      
      // Show template structure
      if (result.data.template.templateStructure) {
        console.log('📝 Template structure:');
        console.log('   - Introduction:', !!result.data.template.templateStructure.introduction);
        console.log('   - Main Activity:', !!result.data.template.templateStructure.mainActivity);
        console.log('   - Conclusion:', !!result.data.template.templateStructure.conclusion);
        console.log('   - Assessment:', !!result.data.template.templateStructure.assessment);
        console.log('   - Resources:', result.data.template.templateStructure.resources?.length || 0);
      }
    } else {
      console.error('❌ Template generation failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Template generation error:', error.message);
  }

  // Step 4: Generate template with saving
  console.log('\n4️⃣ Generating template with saving...');
  try {
    const requestData = {
      subject: 'Bahasa Indonesia',
      topic: 'Teks Narasi dan Struktur Cerita',
      duration: 120,
      gradeLevel: '7-9',
      additionalContext: 'Menggunakan cerita lokal dan budaya Indonesia',
      saveAsTemplate: true
    };

    const response = await fetch(`${API_BASE_URL}/ai/generate-template`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    if (result.success) {
      console.log('✅ Template generated and saved successfully');
      console.log('📝 Template ID:', result.data.template.id);
      console.log('📝 Template name:', result.data.template.name);
      console.log('📝 Subject:', result.data.template.subject?.name);
      console.log('📝 Created by:', result.data.template.createdByUser?.fullName);
      console.log('📝 Is Public:', result.data.template.isPublic);
    } else {
      console.error('❌ Template generation with saving failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Template generation with saving error:', error.message);
  }

  // Step 5: Test validation errors
  console.log('\n5️⃣ Testing validation errors...');
  try {
    const invalidData = {
      subject: '', // Empty subject
      topic: 'Test Topic',
      duration: 15, // Too short
      gradeLevel: ''
    };

    const response = await fetch(`${API_BASE_URL}/ai/generate-template`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    if (!result.success) {
      console.log('✅ Validation working correctly:', result.message);
    } else {
      console.log('⚠️  Validation should have failed but didn\'t');
    }
  } catch (error) {
    console.error('❌ Validation test error:', error.message);
  }

  console.log('\n🎉 AI Template Generation test completed!');
}

// Run the test
testAITemplateGeneration().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
