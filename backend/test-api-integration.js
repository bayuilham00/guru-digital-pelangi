// Test: AI Template Generation API Integration
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAPIIntegration() {
  console.log('🔌 Testing AI Template Generation API Integration...');
  
  try {
    // Step 1: Login
    console.log('\n1️⃣ Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test AI Status endpoint
    console.log('\n2️⃣ Testing AI status endpoint...');
    const statusResponse = await fetch(`${API_BASE}/ai/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const statusData = await statusResponse.json();
    console.log('✅ AI Status:', statusData.data.status);
    console.log('📝 Service:', statusData.data.service);
    console.log('📝 Model:', statusData.data.model);
    
    // Step 3: Test template generation without saving
    console.log('\n3️⃣ Testing template generation (no save)...');
    const generateResponse = await fetch(`${API_BASE}/ai/generate-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Matematika',
        topic: 'Fungsi Kuadrat',
        duration: 90,
        gradeLevel: '10-12',
        additionalContext: 'Penerapan dalam kehidupan sehari-hari',
        saveAsTemplate: false
      })
    });
    
    const generateData = await generateResponse.json();
    if (generateData.success) {
      console.log('✅ Template generated successfully');
      console.log('📝 Template name:', generateData.data.template.name);
      console.log('📝 Duration:', generateData.data.template.estimatedDuration);
      console.log('📝 Objectives:', generateData.data.template.learningObjectives.length);
    } else {
      console.log('❌ Template generation failed:', generateData.message);
    }
    
    // Step 4: Test template generation with saving
    console.log('\n4️⃣ Testing template generation with save...');
    const saveResponse = await fetch(`${API_BASE}/ai/generate-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Fisika',
        topic: 'Gerak Lurus Beraturan',
        duration: 90,
        gradeLevel: '10-12',
        additionalContext: 'Dengan simulasi digital',
        saveAsTemplate: true
      })
    });
    
    const saveData = await saveResponse.json();
    if (saveData.success) {
      console.log('✅ Template generated and saved successfully');
      console.log('📝 Template ID:', saveData.data.template.id);
      console.log('📝 Template name:', saveData.data.template.name);
      console.log('📝 Subject:', saveData.data.template.subject.name);
      console.log('📝 Created by:', saveData.data.template.createdByUser.fullName);
    } else {
      console.log('❌ Template save failed:', saveData.message);
    }
    
    // Step 5: Test template retrieval
    console.log('\n5️⃣ Testing template retrieval...');
    const templatesResponse = await fetch(`${API_BASE}/templates`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const templatesData = await templatesResponse.json();
    if (templatesData.success) {
      console.log('✅ Templates retrieved successfully');
      console.log('📝 Total templates:', templatesData.data.length);
      
      const aiTemplates = templatesData.data.filter(t => t.name.includes('AI Generated'));
      console.log('📝 AI generated templates:', aiTemplates.length);
    } else {
      console.log('❌ Template retrieval failed:', templatesData.message);
    }
    
    console.log('\n🎉 API Integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ API Integration test failed:', error);
  }
}

testAPIIntegration();
