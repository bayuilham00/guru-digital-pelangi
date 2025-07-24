import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000/api';

async function testTeacherStats() {
    try {
        // Login sebagai guru
        const loginResponse = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'matematika@smpn01buayrawan.sch.id',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.error('Login failed:', loginData);
            return;
        }

        console.log('Login successful, testing stats...');
        
        // Test assignment stats
        const statsResponse = await fetch(`${baseUrl}/assignments/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.data.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Stats response status:', statsResponse.status);
        
        const statsData = await statsResponse.text(); // Get as text first
        console.log('Raw stats response:', statsData);
        
        try {
            const parsedStats = JSON.parse(statsData);
            console.log('Parsed stats:', parsedStats);
        } catch (e) {
            console.log('Could not parse as JSON:', e.message);
        }

    } catch (error) {
        console.error('Error in test:', error);
    }
}

testTeacherStats();
