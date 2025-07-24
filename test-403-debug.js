// Test script untuk debug 403 error pada /api/admin/classes/:classId/full

async function testClassFullEndpoint() {
    const baseUrl = 'http://localhost:5000';
    const classId = 'cmd20hfqm000xu83o3tw3gnip';
    
    // First, login to get fresh token
    console.log('🔐 Getting fresh token...');
    try {
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: 'admin@pelangi.sch.id',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (!loginData.success) {
            console.log('❌ Login failed:', loginData.message);
            return;
        }
        
        const freshToken = loginData.data.token;
        console.log('✅ Got fresh token:', freshToken.substring(0, 50) + '...\n');
        
        // Now test the endpoint with fresh token
        console.log('🔍 Testing /api/admin/classes/:classId/full endpoint...\n');
        
        const response = await fetch(`${baseUrl}/api/admin/classes/${classId}/full`, {
            headers: {
                'Authorization': `Bearer ${freshToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.log('Error:', error.message);
    }
    
    // Get current token from frontend localStorage
    console.log('🔍 Testing /api/admin/classes/:classId/full endpoint...\n');
    
    // Test tanpa auth first
    console.log('1️⃣ Testing without auth...');
    try {
        const response = await fetch(`${baseUrl}/api/admin/classes/${classId}/full`);
        console.log('Status:', response.status);
        const data = await response.text();
        console.log('Response:', data.substring(0, 200) + '...\n');
    } catch (error) {
        console.log('Error:', error.message);
    }
    
    // Test dengan auth token dari frontend
    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsb2hqNXR0cDAwMDFnZHBhNHpsNjNtMWoiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzM4MTQ5NjE4LCJleHAiOjE3Mzg3NTQ0MTh9.D6jJ8fXP0k4-YDM0wAOBuTfk-nnW2FYOmDlKOHxhfLw'; // Replace with actual token
    
    console.log('2️⃣ Testing with auth token...');
    try {
        const response = await fetch(`${baseUrl}/api/admin/classes/${classId}/full`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('Error:', error.message);
    }
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('test-403-debug.js')) {
    testClassFullEndpoint();
}

export { testClassFullEndpoint };
