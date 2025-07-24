// Simple test to verify Bank Soal API authentication
const BASE_URL = 'http://localhost:5000';

// Test login and get token
async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: 'admin@pelangi.sch.id', 
        password: 'admin123' 
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success && data.token) {
      console.log('✅ Login successful');
      console.log('🧪 Testing Bank Soal API...');
      
      // Test Bank Soal API
      const bankSoalResponse = await fetch(`${BASE_URL}/api/bank-soal/questions`, {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      
      const bankSoalData = await bankSoalResponse.json();
      console.log('Bank Soal API response:', bankSoalData);
      
      if (bankSoalData.success) {
        console.log('✅ Bank Soal API working correctly');
      } else {
        console.log('❌ Bank Soal API error:', bankSoalData.message);
      }
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLogin();
