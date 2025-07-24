// Quick test subjects API with correct credentials
const API_BASE = 'http://localhost:5000/api';

// Login first to get token
async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });

    const result = await response.json();
    console.log('🔐 Login response:', result);
    
    if (result.success && result.data?.token) {
      return result.data.token;
    }
    throw new Error('Login failed');
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

// Test subjects endpoint
async function testSubjects() {
  try {
    console.log('🚀 Testing subjects API...');
    
    // Get auth token
    const token = await login();
    console.log('✅ Got token:', token ? 'Yes' : 'No');
    
    // Test subjects endpoint
    const response = await fetch(`${API_BASE}/subjects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('📚 Subjects response:', result);
    
    if (result.success) {
      console.log('✅ Subjects API working!');
      console.log('📊 Found', result.data?.length || 0, 'subjects');
    } else {
      console.log('❌ Subjects API failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testSubjects();
