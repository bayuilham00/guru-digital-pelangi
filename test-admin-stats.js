const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJuY3MwMDAwdThuOHVqNGk4cXVhIiwiaWF0IjoxNzUyODAyMzI5LCJleHAiOjE3NTM0MDcxMjl9.bLHeJ9anS9EWI4X3jthycp7_MrRyjfJHzaiCWzdGJ4o";

async function testWithAdmin() {
    try {
        const response = await fetch('http://localhost:5000/api/assignments/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Admin Stats Status:', response.status);
        console.log('Admin Stats Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWithAdmin();
