/**
 * Test Class Endpoint with Authentication
 * Tests the fixed /api/classes/:classId/full endpoint
 */

const testEndpoint = async () => {
  try {
    console.log('🚀 Testing class endpoint with authentication...\n');
    
    // Login first to get JWT token
    console.log('1️⃣ Attempting login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: 'admin@pelangi.sch.id', 
        password: 'admin123' 
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful, JWT token obtained');
    console.log('👤 User role:', loginData.data.user.role);

    // Test the classes endpoint with authentication
    console.log('2️⃣ Testing /api/classes/:classId/full endpoint...');
    const classId = 'cmct4udfa0003u88gvj93r0qo'; // Kelas 7.1 with students
    const response = await fetch(`http://localhost:5000/api/classes/${classId}/full`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS! Class data retrieved successfully');
      console.log('📝 Class name:', data.data?.name || 'N/A');
      console.log('🎓 Grade level:', data.data?.gradeLevel || 'N/A');
      console.log('👥 Student count:', data.data?.studentCount || 0);
      console.log('📚 Subjects count:', data.data?.subjects?.length || 0);
      
      if (data.data?.subjects?.length > 0) {
        console.log('\n📚 Available subjects:');
        data.data.subjects.forEach((subject, index) => {
          console.log(`   ${index + 1}. ${subject.name} (${subject.code})`);
          console.log(`      Teachers: ${subject.teachers?.length || 0}`);
        });
      }
      
      console.log('\n🎉 Route duplication fix successful!');
    } else {
      const errorData = await response.text();
      console.log('\n❌ ERROR Response:');
      console.log(errorData);
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testEndpoint();
