const teacherToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODE5Mzk1LCJleHAiOjE3NTM0MjQxOTV9.92msMkcJWaHn4oCcrkwmm0v6nypIRo3hv82JuH7Blkg";

async function testTeacherStatsSimple() {
    try {
        console.log('Testing teacher stats with token:', teacherToken.substring(0, 50) + '...');
        
        const response = await fetch('http://localhost:5000/api/assignments/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${teacherToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Response data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Failed to parse JSON:', e.message);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testTeacherStatsSimple();
