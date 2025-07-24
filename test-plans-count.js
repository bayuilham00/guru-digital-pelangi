import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testPlansList() {
  try {
    console.log('🚀 Testing teacher plans API...');
    
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
    console.log('🔐 Login response:', loginData);
    
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.data.token;
    console.log('✅ Got token:', token ? 'Yes' : 'No');
    
    // Get all plans
    const plansResponse = await fetch(`${API_BASE_URL}/teacher-planner/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const plansData = await plansResponse.json();
    console.log('📋 Plans response:', plansData);
    
    if (plansData.success) {
      console.log('✅ Plans API working!');
      console.log('📊 Found plans:', plansData.data.length);
      console.log('📊 Total count:', plansData.pagination.total);
      console.log('📊 Pagination info:', {
        page: plansData.pagination.page,
        limit: plansData.pagination.limit,
        totalPages: plansData.pagination.totalPages
      });
    } else {
      console.error('❌ Plans API failed:', plansData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPlansList();
