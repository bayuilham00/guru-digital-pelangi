const teacherToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODA0NjExLCJleHAiOjE3NTM0MDk0MTF9.p-G2qP1u_T1prTnX8T5RkQ1b2akppPF0Pv-uhjsH8pE";

async function testWithTeacher() {
    try {
        const response = await fetch('http://localhost:5000/api/assignments/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${teacherToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Teacher Stats Status:', response.status);
        console.log('Teacher Stats Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWithTeacher();
