// Test classes endpoint
import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Njg5Y2NjZGRmNTFlZjAyMjYxMmQ5NyIsImVtYWlsIjoic2l0aS5udXJoYWxpemExQGd1cnUuY29tIiwicm9sZSI6IkdVUlUiLCJzZWNyZXQiOiJqaGN1Zm5tOWpmbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODI3OTI5LCJleHAiOjE3NTM0MzIxMjl9.eDicwIx9sKiE-X5vRN_4QA88USe0GAlQQWzvqmnDVGo';est classes endpoint
const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Njg5Y2NjZGRmNTFlZjAyMjYxMmQ5NyIsImVtYWlsIjoic2l0aS5udXJoYWxpemExQGd1cnUuY29tIiwicm9sZSI6IkdVUlUiLCJzZWNyZXQiOiJqaGN1Zm5tOWpmbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODI3OTI5LCJleHAiOjE3NTM0MzIxMjl9.eDicwIx9sKiE-X5vRN_4QA88USe0GAlQQWzvqmnDVGo';

async function testClassesEndpoint() {
  try {
    console.log('🔍 Testing /api/classes endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/classes', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS!');
    console.log('📊 Status:', response.status);
    console.log('📋 Classes count:', response.data.data.classes.length);
    console.log('🏫 First class:', JSON.stringify(response.data.data.classes[0], null, 2));
    
  } catch (error) {
    console.error('❌ ERROR testing classes endpoint');
    console.error('📋 Status:', error.response?.status);
    console.error('📝 Status Text:', error.response?.statusText);
    console.error('🔍 Error Details:', error.response?.data);
    console.error('⚠️ Full Error:', error.message);
    
    if (error.response?.status === 500) {
      console.error('💥 Internal Server Error - Check backend logs');
    }
  }
}

testClassesEndpoint();
