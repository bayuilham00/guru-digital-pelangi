const testFixedRoute = async () => {
  try {
    console.log('🧪 Testing fixed route duplication...\n');

    // Login first to get JWT token
    console.log('1️⃣ Attempting login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token obtained\n');

    // Test the fixed classes endpoint with authentication
    console.log('2️⃣ Testing /api/classes/:classId/full with auth...');
    const response = await fetch('http://localhost:5000/api/classes/01JEZ73TTRX3TX6QRQKXDGP8NE/full', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📊 Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Class data retrieved successfully');
      console.log('📝 Class name:', data.data?.name || 'N/A');
      console.log('👥 Student count:', data.data?.studentCount || 0);
      console.log('📚 Subjects count:', data.data?.subjects?.length || 0);
      console.log('\n🎉 Route duplication fix successful!');
    } else {
      const errorData = await response.text();
      console.log('❌ Error response:', errorData);
    }

    // Test without authentication to verify middleware is working
    console.log('\n3️⃣ Testing without auth (should fail)...');
    const noAuthResponse = await fetch('http://localhost:5000/api/classes/01JEZ73TTRX3TX6QRQKXDGP8NE/full');
    console.log('📊 No-auth response status:', noAuthResponse.status);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Authentication middleware working correctly');
    } else {
      console.log('⚠️ Warning: Expected 401 status for unauthenticated request');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

testFixedRoute();
