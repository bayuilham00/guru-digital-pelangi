import fetch from 'node-fetch';

async function testClassesAPI() {
  try {
    console.log('🔐 Getting authentication token...');
    
    // Get login token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'admin@smpn01buayrawan.sch.id',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.token || loginData.token;
    
    if (!token) {
      console.error('❌ No token received:', loginData);
      return;
    }

    console.log('✅ Login successful, token received');
    console.log('🔧 Token preview:', token.substring(0, 20) + '...');

    // Test classes endpoint
    console.log('\n🔌 Testing /api/classes endpoint...');
    const classesResponse = await fetch('http://localhost:5000/api/classes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!classesResponse.ok) {
      console.error('❌ Classes API failed:', classesResponse.status);
      const errorText = await classesResponse.text();
      console.error('Error response:', errorText);
      return;
    }

    const classesData = await classesResponse.json();
    console.log('✅ Classes API successful');
    console.log('📊 Response structure:', {
      success: classesData.success,
      dataType: Array.isArray(classesData.data) ? 'array' : typeof classesData.data,
      dataKeys: classesData.data ? Object.keys(classesData.data) : 'no data',
      classCount: classesData.data?.classes?.length || classesData.data?.length || 0
    });

    // Show first few classes
    const classes = classesData.data?.classes || classesData.data || [];
    if (Array.isArray(classes)) {
      console.log(`\n📋 Found ${classes.length} classes:`);
      classes.slice(0, 3).forEach((cls, i) => {
        console.log(`${i + 1}. "${cls.name}" (${cls.gradeLevel}) - ID: ${cls.id}`);
        console.log(`   Created: ${new Date(cls.createdAt).toLocaleString()}`);
        console.log(`   Subject: ${cls.subject?.name || 'None'}`);
      });
    } else {
      console.log('❌ Classes data is not an array:', classes);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testClassesAPI();
