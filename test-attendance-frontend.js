// Test student attendance frontend integration
import fetch from 'node-fetch';

async function testStudentAttendanceFrontend() {
  try {
    // Login as student
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: '1002025004',
        password: '1002025004'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginData.data.token;
    const userId = loginData.data.user.id;
    
    console.log('🎓 Testing Frontend-Style Attendance API...');

    // Test with month and year parameters (like frontend will do)
    const response = await fetch(`http://localhost:5000/api/students/${userId}/attendance?month=7&year=2025`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    console.log('\n📊 Attendance API Response (month=7, year=2025):');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n✅ Frontend Integration Data:');
      console.log('Total Days:', data.data.summary.totalDays);
      console.log('Present Days:', data.data.summary.presentDays);
      console.log('Late Days:', data.data.summary.lateDays);
      console.log('Absent Days:', data.data.summary.absentDays);
      console.log('Attendance Percentage:', data.data.summary.attendancePercentage + '%');
      
      console.log('\n📅 Attendance Records:');
      data.data.attendanceData.forEach(record => {
        console.log(`- ${record.date}: ${record.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStudentAttendanceFrontend();
