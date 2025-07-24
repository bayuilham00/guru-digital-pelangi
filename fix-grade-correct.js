// Fix grade issue for Maya Sari
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';
const SUBMISSION_ID = 'cmd7dsfz8008zu8n85nscrzrl'; // Maya Sari's submission ID

async function fixGrade() {
  try {
    console.log('Fixing grade for Maya Sari...');
    
    // Get login token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '198404032009052001',
        password: 'guru123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    
    // Update grade from 82 to 75 using correct endpoint
    const gradeResponse = await fetch(`${API_BASE}/submissions/${SUBMISSION_ID}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        points: 75,
        feedback: 'Grade corrected to match assignment points'
      })
    });
    
    if (gradeResponse.ok) {
      const result = await gradeResponse.json();
      console.log('Grade fixed successfully:', result);
    } else {
      const error = await gradeResponse.text();
      console.error('Failed to fix grade:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixGrade();
