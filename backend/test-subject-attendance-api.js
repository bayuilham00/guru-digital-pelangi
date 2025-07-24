// Test API untuk subject-based attendance
// Run: node test-subject-attendance-api.js

import fetch from 'node-fetch';

async function testSubjectAttendanceAPI() {
  const baseURL = 'http://localhost:5000';
  
  // Login credentials for Maya Sari
  const loginData = {
    "identifier": "1002025004", // Maya Sari's student ID
    "password": "1002025004"
  };

  try {
    console.log('🔐 Logging in as Maya Sari...');
    
    // 1. Login to get token
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.data.token;
    const studentId = loginResult.data.user.id;
    
    console.log('✅ Login successful');
    console.log('👤 Student ID:', studentId);

    // 2. Test getting available subjects for attendance
    console.log('\n📚 Testing: Get available subjects...');
    const subjectsResponse = await fetch(`${baseURL}/api/students/${studentId}/attendance/subjects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!subjectsResponse.ok) {
      throw new Error(`Get subjects failed: ${subjectsResponse.status}`);
    }

    const subjectsResult = await subjectsResponse.json();
    console.log('✅ Available subjects:', subjectsResult.data.length);
    subjectsResult.data.forEach(subject => {
      console.log(`   📖 ${subject.name} (${subject.code})`);
    });

    // 3. Test attendance without subject filter (should show all attendance)
    console.log('\n📊 Testing: Get all attendance (no subject filter)...');
    const allAttendanceResponse = await fetch(`${baseURL}/api/students/${studentId}/attendance?month=7&year=2025`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!allAttendanceResponse.ok) {
      throw new Error(`Get all attendance failed: ${allAttendanceResponse.status}`);
    }

    const allAttendanceResult = await allAttendanceResponse.json();
    console.log('✅ All attendance records:', allAttendanceResult.data.attendanceData.length);
    console.log('📈 Overall attendance:', allAttendanceResult.data.summary.attendancePercentage + '%');

    // Show sample records
    console.log('📋 Sample records:');
    allAttendanceResult.data.attendanceData.slice(0, 5).forEach(record => {
      const subjectInfo = record.subject ? ` [${record.subject.name}]` : ' [General]';
      console.log(`   ${record.date}: ${record.status}${subjectInfo}`);
    });

    // 4. Test attendance with subject filter
    if (subjectsResult.data.length > 0) {
      const testSubject = subjectsResult.data[0];
      console.log(`\n🎯 Testing: Get attendance for subject "${testSubject.name}"...`);
      
      const subjectAttendanceResponse = await fetch(`${baseURL}/api/students/${studentId}/attendance?month=7&year=2025&subjectId=${testSubject.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!subjectAttendanceResponse.ok) {
        throw new Error(`Get subject attendance failed: ${subjectAttendanceResponse.status}`);
      }

      const subjectAttendanceResult = await subjectAttendanceResponse.json();
      console.log('✅ Subject attendance records:', subjectAttendanceResult.data.attendanceData.length);
      console.log('📈 Subject attendance:', subjectAttendanceResult.data.summary.attendancePercentage + '%');

      // Show records for this subject
      console.log(`📋 Records for ${testSubject.name}:`);
      subjectAttendanceResult.data.attendanceData.forEach(record => {
        console.log(`   ${record.date}: ${record.status} [${record.subject?.name || 'Unknown'}]`);
      });
    }

    console.log('\n🎉 All tests passed! Subject-based attendance API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testSubjectAttendanceAPI();
