// Debug login endpoint
const API_BASE = 'http://localhost:5000/api';

async function debugLogin() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@smpn01buayrawan.sch.id',
        password: 'admin123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok && data.success) {
      console.log('Login successful, token:', data.data.token);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugLogin();
