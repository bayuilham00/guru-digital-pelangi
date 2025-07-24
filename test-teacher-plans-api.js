// Test Teacher Plans API - Guru Digital Pelangi

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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Test teacher plans API
async function testTeacherPlansAPI() {
  console.log('🚀 Testing Teacher Plans API...');
  
  // Login first
  const loginResponse = await login();
  if (!loginResponse?.success) {
    console.error('❌ Login failed:', loginResponse?.message);
    return;
  }
  
  const token = loginResponse.data.token;
  console.log('✅ Login successful');
  
  try {
    // Test getting all plans
    const response = await fetch(`${API_BASE}/teacher-planner/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📚 Teacher Plans API response:', data);
    
    if (data.success) {
      console.log(`✅ Found ${data.data.length} teacher plans`);
      
      // Show first few plans
      data.data.slice(0, 3).forEach((plan, index) => {
        console.log(`\n📋 Plan ${index + 1}:`);
        console.log(`- Title: ${plan.title}`);
        console.log(`- Subject: ${plan.subject?.name || 'N/A'}`);
        console.log(`- Class: ${plan.class?.name || 'N/A'}`);
        console.log(`- Status: ${plan.status}`);
        console.log(`- Scheduled: ${plan.scheduledDate}`);
        console.log(`- Duration: ${plan.duration} minutes`);
      });
      
      // Test with filters
      console.log('\n🔍 Testing with filters...');
      const filteredResponse = await fetch(`${API_BASE}/teacher-planner/plans?status=PUBLISHED&page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const filteredData = await filteredResponse.json();
      if (filteredData.success) {
        console.log(`✅ Found ${filteredData.data.length} published plans`);
      }
      
    } else {
      console.error('❌ API Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

testTeacherPlansAPI();
