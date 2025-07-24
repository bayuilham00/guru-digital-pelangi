// Quick test for AI status
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  identifier: 'admin@pelangi.sch.id',
  password: 'admin123'
};

async function quickTest() {
  // Login
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCredentials)
  });
  
  const loginResult = await loginResponse.json();
  const token = loginResult.data.token;
  
  // Check status
  const statusResponse = await fetch(`${API_BASE_URL}/ai/status`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const statusResult = await statusResponse.json();
  console.log('Model:', statusResult.data.model);
}

quickTest().catch(console.error);
