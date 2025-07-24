// Test bulk operations for Teacher Plans
const API_BASE = 'http://localhost:5000/api';

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
    if (data.success) {
      return data.data.token;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function testBulkOperations() {
  console.log('🚀 Testing Bulk Operations...');

  try {
    // Login first
    const token = await login();
    console.log('✅ Login successful');

    // Get some plan IDs
    const plansResponse = await fetch(`${API_BASE}/teacher-planner/plans?limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const plansData = await plansResponse.json();
    
    if (!plansData.success || plansData.data.length === 0) {
      console.log('❌ No plans found for testing');
      return;
    }

    const planIds = plansData.data.slice(0, 3).map(plan => plan.id);
    console.log(`📋 Testing with ${planIds.length} plans:`, planIds);

    // Test 1: Bulk Update Status
    console.log('\n1️⃣ Testing bulk status update...');
    const statusResponse = await fetch(`${API_BASE}/teacher-planner/plans/bulk/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planIds: planIds,
        status: 'PUBLISHED'
      })
    });
    const statusData = await statusResponse.json();
    console.log('Status update response:', statusData);

    // Test 2: Bulk Duplicate
    console.log('\n2️⃣ Testing bulk duplicate...');
    const duplicateResponse = await fetch(`${API_BASE}/teacher-planner/plans/bulk/duplicate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planIds: [planIds[0]] // Just duplicate one plan
      })
    });
    const duplicateData = await duplicateResponse.json();
    console.log('Duplicate response:', duplicateData);

    // Test 3: Bulk Export JSON
    console.log('\n3️⃣ Testing bulk export JSON...');
    const exportResponse = await fetch(`${API_BASE}/teacher-planner/plans/bulk/export?planIds=${planIds.join(',')}&format=json`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const exportData = await exportResponse.json();
    console.log('Export JSON response:', exportData);

    // Test 4: Bulk Export CSV
    console.log('\n4️⃣ Testing bulk export CSV...');
    const csvResponse = await fetch(`${API_BASE}/teacher-planner/plans/bulk/export?planIds=${planIds.join(',')}&format=csv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (csvResponse.ok) {
      const csvContent = await csvResponse.text();
      console.log('CSV Export success, length:', csvContent.length);
      console.log('CSV Headers:', csvContent.split('\n')[0]);
    } else {
      console.log('CSV Export failed:', await csvResponse.text());
    }

    console.log('\n✅ All bulk operations tested!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBulkOperations();
