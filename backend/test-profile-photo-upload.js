// Test Profile Photo Upload
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test data - sample base64 image (1x1 pixel PNG)
const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testUpload() {
  try {
    console.log('🧪 Testing profile photo upload...');
    
    // First, get a valid student ID from the database
    console.log('📋 Getting students...');
    const studentsResponse = await fetch(`${API_BASE_URL}/students`, {
      headers: {
        'Authorization': 'Bearer your-test-token-here' // We'll need to get a valid token
      }
    });
    
    if (!studentsResponse.ok) {
      throw new Error(`Failed to get students: ${studentsResponse.status}`);
    }
    
    const studentsData = await studentsResponse.json();
    const firstStudent = studentsData.data.students[0];
    
    if (!firstStudent) {
      throw new Error('No students found in database');
    }
    
    console.log('👤 Testing with student:', firstStudent.studentId, firstStudent.fullName);
    
    // Now test upload
    console.log('📤 Uploading profile photo...');
    const uploadResponse = await fetch(`${API_BASE_URL}/students/${firstStudent.id}/profile-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-test-token-here'
      },
      body: JSON.stringify({
        profilePhoto: sampleBase64
      })
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('📤 Upload response:', uploadResponse.status, uploadResult);
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
    } else {
      console.error('❌ Upload failed:', uploadResult);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// We need to get a valid JWT token first
async function getTestToken() {
  try {
    console.log('🔑 Getting test token...');
    
    // Try to login with test credentials
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: '1234567891', // Use first student's ID
        password: '1234567891' // For students, password is their student ID
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('🔑 Login successful:', loginData.data.user.username);
    
    return loginData.data.token;
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

async function runTest() {
  // Get token first
  const token = await getTestToken();
  
  if (!token) {
    console.error('❌ Cannot proceed without valid token');
    return;
  }
  
  console.log('🔑 Got token, proceeding with upload test...');
  
  // Now test upload with real token
  try {
    // Get first student
    const studentsResponse = await fetch(`${API_BASE_URL}/students`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!studentsResponse.ok) {
      throw new Error(`Failed to get students: ${studentsResponse.status}`);
    }
    
    const studentsData = await studentsResponse.json();
    const firstStudent = studentsData.data.students[0];
    
    if (!firstStudent) {
      throw new Error('No students found in database');
    }
    
    console.log('👤 Testing with student:', firstStudent.studentId, firstStudent.fullName);
    
    // Test upload
    const uploadResponse = await fetch(`${API_BASE_URL}/students/${firstStudent.id}/profile-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        profilePhoto: sampleBase64
      })
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('📤 Upload response:', uploadResponse.status, uploadResult);
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
      console.log('📸 Updated student:', uploadResult.data);
    } else {
      console.error('❌ Upload failed:', uploadResult);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTest();
