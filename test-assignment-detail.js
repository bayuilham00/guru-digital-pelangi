// Test assignment detail page data
import fetch from 'node-fetch';

async function testAssignmentDetail() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '198404032009052001', password: 'guru123' })
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    console.log('🔍 Testing Assignment Detail API Response...');

    // Get assignment students (this is what frontend calls)
    const response = await fetch('http://localhost:5000/api/assignments/cmd7dseho008hu8n8n6mo79r0/submissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      console.log('❌ API Error:', data.error || data.message);
      return;
    }
    
    if (data.data?.students) {
      data.data.students.forEach((student, index) => {
        console.log(`\n📝 Student ${index + 1}: ${student.fullName}`);
        console.log(`   - Student ID: ${student.studentId}`);
        console.log(`   - Has Submission: ${!!student.submission}`);
        
        if (student.submission) {
          console.log(`   - Submission Status: "${student.submission.status}"`);
          console.log(`   - Grade: ${student.submission.grade}`);
          console.log(`   - Submitted At: ${student.submission.submittedAt}`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAssignmentDetail();
