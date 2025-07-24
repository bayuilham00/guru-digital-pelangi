import axios from 'axios';

async function testAPI() {
    try {
        console.log('Testing API endpoints...');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'admin@pelangi.sch.id',
            password: 'admin123'
        });
        
        console.log('Login successful!');
        const token = loginResponse.data.data.token;
        console.log('Token:', token.substring(0, 20) + '...');
        
        // Test the class detail endpoint
        const classResponse = await axios.get('http://localhost:5000/api/classes/cmct4udfa0003u88gvj93r0qo/full', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Class API Response:');
        console.log(JSON.stringify(classResponse.data, null, 2));
        
    } catch (error) {
        console.error('Error occurred:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }
    }
}

testAPI();
