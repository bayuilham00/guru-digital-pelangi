// Test student assignment data
import fetch from 'node-fetch';

async function testStudentAssignments() {
  try {
    // Login as student (menggunakan credentials Maya Sari)
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: '1002025004', // Maya Sari's student ID
        password: '1002025004'    // Password sama dengan student ID
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginData.data.token;
    
    console.log('🎓 Testing Student Assignment Data...');

    // Get student assignments
    const response = await fetch('http://localhost:5000/api/student/assignments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    console.log('Student assignments API Response:', JSON.stringify(data, null, 2));
    
    // Also try alternative endpoints
    const assignmentsResponse = await fetch('http://localhost:5000/api/assignments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const assignmentsData = await assignmentsResponse.json();
    console.log('\nGeneral assignments API Response:', JSON.stringify(assignmentsData, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStudentAssignments();
