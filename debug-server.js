// Debug the server directly
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODE5Mzk1LCJleHAiOjE3NTM0MjQxOTV9.92msMkcJWaHn4oCcrkwmm0v6nypIRo3hv82JuH7Blkg";

const testRequest = async () => {
  console.log('Testing teacher stats endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/assignments/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('Raw response:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed response:', jsonData);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testRequest();
