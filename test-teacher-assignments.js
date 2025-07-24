import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000/api';

async function testTeacherAssignments() {
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

        console.log('Login successful for:', loginData.data.user.name);
        console.log('Role:', loginData.data.user.role);
        
        // Test assignment list
        const assignmentsResponse = await fetch(`${baseUrl}/assignments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.data.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Assignments response status:', assignmentsResponse.status);
        
        const assignmentsData = await assignmentsResponse.json();
        console.log('Assignment list response:');
        console.log(JSON.stringify(assignmentsData, null, 2));

    } catch (error) {
        console.error('Error in test:', error);
    }
}

testTeacherAssignments();
