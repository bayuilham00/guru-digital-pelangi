// Check student credentials in database
import fetch from 'node-fetch';

async function checkStudentCredentials() {
  try {
    // Login as admin first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: '1002025005',
        password: '1002025005'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    
    console.log('🔍 Checking student data in database...');

    // Get all students
    const studentsResponse = await fetch('http://localhost:5000/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const studentsData = await studentsResponse.json();
    
    if (studentsData.success && studentsData.data?.students) {
      console.log('📚 Found students in database:');
      studentsData.data.students.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.fullName}`);
        console.log(`   - ID: ${student.id}`);
        console.log(`   - Student ID/NISN: ${student.studentId || student.nisn}`);
        console.log(`   - Email: ${student.email}`);
        console.log(`   - Role: ${student.role}`);
      });
      
      // Try to login with first student using different password patterns
      const firstStudent = studentsData.data.students[0];
      if (firstStudent) {
        console.log(`\n🔐 Testing login for ${firstStudent.fullName}...`);
        
        const testCredentials = [
          { identifier: firstStudent.studentId, password: firstStudent.studentId },
          { identifier: firstStudent.studentId, password: 'student123' },
          { identifier: firstStudent.email, password: firstStudent.studentId },
          { identifier: firstStudent.email, password: 'student123' },
          { identifier: firstStudent.nisn, password: firstStudent.nisn },
        ];
        
        for (const cred of testCredentials) {
          if (!cred.identifier) continue;
          
          const testLogin = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cred)
          });
          
          const testResult = await testLogin.json();
          console.log(`   Trying ${cred.identifier}/${cred.password}: ${testResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
          
          if (testResult.success) {
            console.log(`   🎉 Found working credentials: ${cred.identifier}/${cred.password}`);
            break;
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStudentCredentials();
