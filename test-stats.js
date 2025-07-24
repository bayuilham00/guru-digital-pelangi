const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJuY3MwMDAwdThuOHVqNGk4cXVhIiwiaWF0IjoxNzUyODAyMzI5LCJleHAiOjE3NTM0MDcxMjl9.bLHeJ9anS9EWI4X3jthycp7_MrRyjfJHzaiCWzdGJ4o";

async function testStats() {
    try {
        const response = await fetch('http://localhost:5000/api/assignments/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testStats();
