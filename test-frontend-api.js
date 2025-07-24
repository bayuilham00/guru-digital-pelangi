// Test frontend API connectivity
const API_BASE = 'http://localhost:5000/api';

async function testFrontendAPI() {
  console.log('🔍 Testing Frontend API connectivity...\n');
  
  try {
    console.log('1. Testing /config/status endpoint...');
    const response = await fetch(`${API_BASE}/config/status`);
    const data = await response.json();
    
    console.log('✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      const fields = data.data;
      console.log('\n📊 Available fields in API response:');
      Object.keys(fields).forEach(key => {
        console.log(`  ${key}: ${fields[key] || '(empty)'}`);
      });
      
      // Check specifically for new fields
      const newFields = ['school_address', 'school_phone', 'school_email', 'principal_name', 'principal_nip'];
      const missingFields = newFields.filter(field => !fields[field] || fields[field].trim() === '');
      
      if (missingFields.length === 0) {
        console.log('\n✅ All new fields are present and have data!');
        console.log('🎯 Frontend should be able to display them.');
        
        console.log('\n📋 Frontend debugging checklist:');
        console.log('1. Check browser console for JavaScript errors');
        console.log('2. Check Network tab for failed API requests');
        console.log('3. Verify CORS settings');
        console.log('4. Clear browser cache and hard refresh (Ctrl+Shift+R)');
        console.log('5. Check if SystemSetup component is importing correctly');
        
      } else {
        console.log(`\n❌ Missing fields: ${missingFields.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('- Backend server not running on port 5000');
    console.log('- CORS configuration problems');
    console.log('- Network connectivity issues');
  }
}

testFrontendAPI();
