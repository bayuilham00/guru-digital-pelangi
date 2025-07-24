import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTeacherPlannerService() {
  try {
    console.log('🚀 Testing teacherPlannerService getPlans...');
    
    // Login first
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login success:', loginData.success);
    
    const token = loginData.data.token;
    
    // Test with params similar to frontend
    const params = {
      page: 1,
      limit: 12,
      sortBy: 'scheduledDate',
      sortOrder: 'desc'
    };
    
    const queryString = new URLSearchParams(params).toString();
    
    const plansResponse = await fetch(`${API_BASE_URL}/teacher-planner/plans?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Plans response status:', plansResponse.status);
    console.log('📋 Plans response ok:', plansResponse.ok);
    
    const plansData = await plansResponse.json();
    console.log('📋 Plans response structure:');
    console.log('  - success:', plansData.success);
    console.log('  - data type:', Array.isArray(plansData.data) ? 'array' : typeof plansData.data);
    console.log('  - data length:', plansData.data?.length || 'N/A');
    console.log('  - pagination:', plansData.pagination);
    
    // Check if response has nested data
    if (plansData.data && plansData.data.data) {
      console.log('📋 Found nested data structure:');
      console.log('  - data.data type:', Array.isArray(plansData.data.data) ? 'array' : typeof plansData.data.data);
      console.log('  - data.data length:', plansData.data.data?.length || 'N/A');
    }
    
    // Log first plan structure
    if (plansData.data && plansData.data.length > 0) {
      console.log('📋 First plan structure:');
      console.log('  - id:', plansData.data[0].id);
      console.log('  - title:', plansData.data[0].title);
      console.log('  - status:', plansData.data[0].status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTeacherPlannerService();
