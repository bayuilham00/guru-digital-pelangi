import fetch from 'node-fetch';

async function testVIIIBAPI() {
  console.log('🔍 Testing VIII B API Endpoint...\n');
  
  const classId = 'cmd7drs6s000su8n8t049s2zp'; // VIII B class ID
  
  try {
    // 1. First, let's try to login and get a token
    console.log('🔑 Attempting to login to get a valid token...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: '198404032009041008', // Drs. Budi Santoso
        password: 'guru123' // Default password
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed with status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('🔍 Login response structure:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.token || loginData.data?.token;
    if (!token) {
      console.log('❌ No token received from login');
      console.log('Available keys in response:', Object.keys(loginData));
      return;
    }
    
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    // 2. Now test the class endpoint
    console.log('\n🌐 Testing class endpoint...');
    
    const classResponse = await fetch(`http://localhost:5000/api/classes/${classId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Class API Response Status:', classResponse.status);
    console.log('📊 Class API Response Headers:', Object.fromEntries(classResponse.headers.entries()));
    
    if (classResponse.ok) {
      const classData = await classResponse.json();
      console.log('✅ Class API Response received');
      console.log('📋 Response Message:', classData.message);
      console.log('📋 Response Data Keys:', Object.keys(classData.data || {}));
      console.log('📋 Subjects Count:', classData.data?.subjects?.length || 0);
      
      if (classData.data?.subjects) {
        console.log('\n📚 Subjects Details:');
        classData.data.subjects.forEach((subject, index) => {
          console.log(`${index + 1}. ${subject.name} (${subject.code})`);
          console.log(`   - ID: ${subject.id}`);
          console.log(`   - Teachers: ${subject.teachers?.length || 0}`);
          console.log(`   - Active: ${subject.isActive}`);
        });
      }
      
      console.log('\n📋 Full Response Structure:');
      console.log(JSON.stringify(classData, null, 2));
    } else {
      console.log('❌ Class API failed');
      const errorText = await classResponse.text();
      console.log('Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testVIIIBAPI();
