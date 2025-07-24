const loginData = {
    identifier: "198404032009041008",
    password: "guru123"
};

async function loginAsTeacher() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        console.log('Login Status:', response.status);
        console.log('Login Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data.token) {
            const token = data.data.token;
            console.log('\nTesting stats with teacher token...');
            
            const statsResponse = await fetch('http://localhost:5000/api/assignments/stats', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const statsData = await statsResponse.json();
            console.log('Stats Status:', statsResponse.status);
            console.log('Stats Response:', JSON.stringify(statsData, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

loginAsTeacher();
