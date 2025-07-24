/**
 * Simple test to debug routing
 */

const testRouting = async () => {
  try {
    console.log('🔍 Testing routing debug...\n');
    
    // Test with curl-like fetch
    console.log('Testing URL: http://localhost:5000/api/classes/cmct4udfa0003u88gvj93r0qo/full');
    
    const response = await fetch('http://localhost:5000/api/classes/cmct4udfa0003u88gvj93r0qo/full', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    console.log('URL called:', response.url);
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testRouting();
