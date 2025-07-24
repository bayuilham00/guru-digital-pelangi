// Test Frontend Authentication
// Run this in the browser console to check if student login works

async function testStudentLogin() {
  try {
    console.log('🧪 Testing student login...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: '1234567891', // Student ID
        password: '1234567891'    // Password (same as student ID)
      })
    });
    
    const result = await response.json();
    console.log('🔑 Login response:', result);
    
    if (result.success) {
      // Store token
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user_data', JSON.stringify(result.data.user));
      
      console.log('✅ Login successful! Token stored.');
      console.log('👤 User data:', result.data.user);
      
      // Now test profile photo upload
      await testProfilePhotoUpload(result.data.user.id);
      
    } else {
      console.error('❌ Login failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
  }
}

async function testProfilePhotoUpload(studentId) {
  try {
    console.log('📤 Testing profile photo upload for student:', studentId);
    
    // Create a test base64 image (1x1 pixel PNG)
    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`http://localhost:5000/api/students/${studentId}/profile-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        profilePhoto: testBase64
      })
    });
    
    const result = await response.json();
    console.log('📤 Upload response:', response.status, result);
    
    if (response.ok) {
      console.log('✅ Upload successful!');
    } else {
      console.error('❌ Upload failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
  }
}

// Run the test
console.log('📝 To test student login and upload, run: testStudentLogin()');
