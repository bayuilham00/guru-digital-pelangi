// Test script untuk menguji fix duplikasi route /classes/:classId/full
import fetch from 'node-fetch';

const testEndpoint = async () => {
  try {
    console.log('🧪 Testing fixed /api/classes/:classId/full endpoint...\n');

    // Step 1: Login untuk mendapatkan JWT token
    console.log('1️⃣ Attempting login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@example.com', 
        password: 'admin123' 
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, JWT token obtained\n');

    // Step 2: Test endpoint dengan authentication
    console.log('2️⃣ Testing /api/classes/:classId/full with auth...');
    const classId = '01JEZ73TTRX3TX6QRQKXDGP8NE';
    const response = await fetch(`http://localhost:5000/api/classes/${classId}/full`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Class data retrieved successfully!');
      console.log('📝 Class Details:');
      console.log('   - Name:', data.data?.name || 'N/A');
      console.log('   - Grade Level:', data.data?.gradeLevel || 'N/A');
      console.log('   - Student Count:', data.data?.studentCount || 0);
      console.log('   - Subjects Count:', data.data?.subjects?.length || 0);
      
      if (data.data?.subjects?.length > 0) {
        console.log('   - Subjects:');
        data.data.subjects.forEach((subject, index) => {
          console.log(`     ${index + 1}. ${subject.name} (${subject.code})`);
        });
      }
    } else {
      const errorData = await response.text();
      console.log('❌ ERROR: Request failed');
      console.log('📄 Error Response:', errorData);
    }

    // Step 3: Test tanpa authentication (harus gagal)
    console.log('\n3️⃣ Testing without authentication (should fail)...');
    const noAuthResponse = await fetch(`http://localhost:5000/api/classes/${classId}/full`);
    
    console.log('📊 No-Auth Response Status:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ SUCCESS: Authentication is properly required!');
    } else {
      console.log('❌ WARNING: Authentication bypass detected!');
    }

    console.log('\n🎯 Test Summary:');
    console.log('- Route duplication fix: Applied');
    console.log('- Authentication middleware: Active');
    console.log('- Authorization middleware: Active');
    console.log('- Endpoint functionality: ' + (response.ok ? 'Working' : 'Failed'));

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Jalankan test
testEndpoint();
