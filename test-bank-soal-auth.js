import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testBankSoalAuth() {
  try {
    console.log('Testing Bank Soal authentication...');
    
    // Step 1: Login with admin credentials
    console.log('1. Attempting login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: 'admin@pelangi.sch.id',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
    console.log('Token:', loginResponse.data.token || loginResponse.data.data?.token);
    
    // Step 2: Test Bank Soal API with token
    console.log('\n2. Testing Bank Soal API with token...');
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    
    // Test get questions
    const questionsResponse = await axios.get(`${API_BASE_URL}/bank-soal/questions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Bank Soal API working!');
    console.log('Questions found:', questionsResponse.data.length || 0);
    
    // Test get question banks
    const banksResponse = await axios.get(`${API_BASE_URL}/bank-soal/banks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Question Banks API working!');
    console.log('Question banks found:', banksResponse.data.length || 0);
    
    // Save token for manual testing
    console.log('\n📋 Token for manual testing:');
    console.log(token);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      console.log('⏳ Rate limit hit, please wait and try again...');
    }
  }
}

// Run the test
testBankSoalAuth();
