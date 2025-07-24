/**
 * Create Test Data for Challenge Auto-Completion Testing
 */

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzAzNzU2MH0.G_O8rpU-kIgH8sAA8hQp2EBYpfVpznNF9c9y5xXv9aY';

async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return await response.json();
}

async function createTestData() {
  console.log('🏗️ Creating test data for challenge testing...\n');

  try {
    // 1. Create a test class
    console.log('📚 Creating test class...');
    const classData = {
      name: 'Kelas Test Challenge',
      grade: '8',
      section: 'A',
      academicYear: '2024/2025',
      teacherId: '1', // Assuming teacher with ID 1 exists
      maxStudents: 30
    };

    const classResult = await apiCall('/classes', 'POST', classData);
    if (!classResult.success) {
      console.log('❌ Failed to create class:', classResult.error);
      console.log('   Response:', classResult);
      return;
    }

    const classId = classResult.data.id;
    console.log(`✅ Class created: ${classData.name} (ID: ${classId})`);

    // 2. Create test students
    console.log('\n👥 Creating test students...');
    const studentNames = [
      'Ahmad Hidayat',
      'Siti Nurhaliza',
      'Budi Santoso',
      'Dewi Lestari',
      'Rizki Pratama'
    ];

    const createdStudents = [];
    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const studentData = {
        fullName: name,
        email: `student${i + 1}@test.com`,
        username: `student${i + 1}`,
        password: 'password123',
        classId: classId,
        nisn: `202400${i + 1}`.padStart(10, '0'),
        dateOfBirth: '2010-01-01',
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        address: 'Test Address'
      };

      const studentResult = await apiCall('/students', 'POST', studentData);
      if (studentResult.success) {
        console.log(`   ✅ Student created: ${name} (ID: ${studentResult.data.id})`);
        createdStudents.push(studentResult.data);
      } else {
        console.log(`   ❌ Failed to create student ${name}:`, studentResult.error);
      }
    }

    console.log(`\n✅ Test data created successfully!`);
    console.log(`   Class ID: ${classId}`);
    console.log(`   Students created: ${createdStudents.length}`);
    console.log('\n🎯 Now you can run the challenge auto-completion tests!');

  } catch (error) {
    console.error('💥 Failed to create test data:', error);
  }
}

console.log('Starting test data creation...\n');
createTestData();
