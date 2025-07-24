// Fix grade issue - update incorrect grade
import fetch from 'node-fetch';

async function fixGradeIssue() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '198404032009052001', password: 'guru123' })
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    console.log('🔧 Fixing Maya Sari\'s grade from 82 to 75...');

    // Grade student with correct value
    const gradeResponse = await fetch('http://localhost:5000/api/assignments/cmd7dseho008hu8n8n6mo79r0/submissions/cmd7ds01r003su8n85xzenpin/grade', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grade: 75,
        feedback: 'Puisi bagus, tapi bisa ditambah majas yang lebih beragam. (Nilai diperbaiki)'
      })
    });

    if (gradeResponse.ok) {
      const result = await gradeResponse.json();
      console.log('✅ Grade fixed successfully');
      console.log('New grade:', result);
    } else {
      console.log('❌ Failed to fix grade');
      const error = await gradeResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixGradeIssue();
