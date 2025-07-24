const teacherToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODEzNDcxLCJleHAiOjE3NTM0MTgyNzF9.3gy_ZqiInkukZqXrKs0E5abL8jQtBMz3HrFR-kpVCIo";

async function testAssignments() {
    try {
        console.log('Testing regular assignments endpoint...');
        const response = await fetch('http://localhost:5000/api/assignments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${teacherToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Regular assignments Status:', response.status);
        console.log('Regular assignments Response:', JSON.stringify(data, null, 2));
        
        console.log('\nTesting stats endpoint...');
        const statsResponse = await fetch('http://localhost:5000/api/assignments/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${teacherToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const statsData = await statsResponse.json();
        console.log('Stats Status:', statsResponse.status);
        console.log('Stats Response:', JSON.stringify(statsData, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAssignments();
