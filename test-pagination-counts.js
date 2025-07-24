import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testPlansCounts() {
  try {
    console.log('🚀 Testing exact plan counts...');
    
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
    
    // Test different pagination scenarios
    const tests = [
      { page: 1, limit: 20, name: 'All plans (page 1, limit 20)' },
      { page: 1, limit: 12, name: 'Page 1 (limit 12)' },
      { page: 2, limit: 12, name: 'Page 2 (limit 12)' },
      { page: 1, limit: 100, name: 'Large limit (100)' }
    ];
    
    for (const test of tests) {
      const params = new URLSearchParams({
        page: test.page.toString(),
        limit: test.limit.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/teacher-planner/plans?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`📋 ${test.name}:`);
      console.log(`  - Data length: ${data.data?.length || 0}`);
      console.log(`  - Pagination total: ${data.pagination?.total || 0}`);
      console.log(`  - Pagination page: ${data.pagination?.page || 0}`);
      console.log(`  - Pagination totalPages: ${data.pagination?.totalPages || 0}`);
      console.log('');
    }
    
    // Also test with no params to see default behavior
    const noParamsResponse = await fetch(`${API_BASE_URL}/teacher-planner/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const noParamsData = await noParamsResponse.json();
    console.log('📋 No params (default):');
    console.log(`  - Data length: ${noParamsData.data?.length || 0}`);
    console.log(`  - Pagination total: ${noParamsData.pagination?.total || 0}`);
    console.log(`  - Pagination page: ${noParamsData.pagination?.page || 0}`);
    console.log(`  - Pagination totalPages: ${noParamsData.pagination?.totalPages || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPlansCounts();
