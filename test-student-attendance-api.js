// Test student attendance API endpoint
import fetch from 'node-fetch';

async function testStudentAttendanceAPI() {
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
    const userId = loginData.data.user.id;
    
    console.log('📅 Testing Student Attendance API...');
    console.log('User ID:', userId);

    // Test attendance API for current month (July 2025)
    const response = await fetch(`http://localhost:5000/api/students/${userId}/attendance?month=7&year=2025`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    console.log('\n📊 Student Attendance API Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStudentAttendanceAPI();
