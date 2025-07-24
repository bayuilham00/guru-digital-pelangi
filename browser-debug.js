// Debug script untuk cek API response di browser
// Buka Browser Console (F12) dan jalankan ini:

console.log('🔍 Debugging Frontend API Call...');

// Test direct API call
fetch('http://localhost:5000/api/config/status')
  .then(response => {
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', response.headers);
    return response.json();
  })
  .then(data => {
    console.log('📊 Full API Response:', data);
    
    if (data.success && data.data) {
      console.log('✅ API Data Available:');
      console.log('  initialized:', data.data.initialized);
      console.log('  school_name:', data.data.school_name);
      console.log('  school_address:', data.data.school_address);
      console.log('  school_phone:', data.data.school_phone);
      console.log('  school_email:', data.data.school_email);
      console.log('  principal_name:', data.data.principal_name);
      console.log('  principal_nip:', data.data.principal_nip);
      
      // Check if all new fields exist
      const newFields = ['school_address', 'school_phone', 'school_email', 'principal_name', 'principal_nip'];
      const existingFields = newFields.filter(field => data.data[field] !== undefined);
      
      console.log(`\n🆕 New fields in API: ${existingFields.length}/${newFields.length}`);
      if (existingFields.length === 5) {
        console.log('✅ All new fields are present in API response');
        console.log('🔄 Issue might be in React component or state management');
      } else {
        console.log('❌ Missing fields in API:', newFields.filter(f => !existingFields.includes(f)));
      }
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });

// Check current React state (if React DevTools available)
if (window.React) {
  console.log('🔄 React detected. Check component state in React DevTools');
} else {
  console.log('⚠️ React not detected in global scope');
}

console.log('\n🛠️ Next debugging steps:');
console.log('1. Check Network tab for /api/config/status request');
console.log('2. Verify response contains all new fields');
console.log('3. Check React DevTools for SystemSetup component state');
console.log('4. Look for any JavaScript errors in Console');
console.log('5. Try hard refresh (Ctrl+Shift+R)');
