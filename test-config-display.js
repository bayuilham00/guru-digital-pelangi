// Test script untuk memastikan semua field konfigurasi baru sudah tampil
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testConfigDisplay() {
  try {
    console.log('🔍 Testing configuration display...\n');

    // Check system status
    const statusResponse = await fetch(`${API_BASE}/config/status`);
    const statusData = await statusResponse.json();

    console.log('📊 System Status Response:');
    console.log(JSON.stringify(statusData, null, 2));

    if (statusData.success && statusData.data) {
      const data = statusData.data;
      
      console.log('\n✅ Configuration Fields Status:');
      console.log(`📚 Initialized: ${data.initialized}`);
      console.log(`🏫 School Name: ${data.school_name || '(empty)'}`);
      console.log(`🆔 School ID: ${data.default_school_id || '(empty)'}`);
      console.log(`📅 Academic Year: ${data.default_academic_year || '(empty)'}`);
      console.log(`📍 School Address: ${data.school_address || '(empty)'}`);
      console.log(`📞 School Phone: ${data.school_phone || '(empty)'}`);
      console.log(`📧 School Email: ${data.school_email || '(empty)'}`);
      console.log(`👨‍💼 Principal Name: ${data.principal_name || '(empty)'}`);
      console.log(`🆔 Principal NIP: ${data.principal_nip || '(empty)'}`);

      // Count available fields
      const availableFields = Object.keys(data).filter(key => 
        key !== 'initialized' && data[key] && data[key].trim() !== ''
      );
      
      console.log(`\n📈 Total fields with data: ${availableFields.length}/8`);
      
      if (availableFields.length === 0) {
        console.log('\n⚠️  No configuration data found. System might need data seeding.');
        console.log('💡 Suggestion: Run seedConfigs.js to populate default data.');
      } else {
        console.log('\n✅ Configuration data is available!');
        console.log('🎯 Frontend should display these fields properly.');
      }

      // Test what new fields are specifically available
      const newFields = ['school_address', 'school_phone', 'school_email', 'principal_name', 'principal_nip'];
      const availableNewFields = newFields.filter(field => data[field] && data[field].trim() !== '');
      
      console.log(`\n🆕 New fields with data: ${availableNewFields.length}/5`);
      availableNewFields.forEach(field => {
        console.log(`   ✓ ${field}: ${data[field]}`);
      });

      const missingNewFields = newFields.filter(field => !data[field] || data[field].trim() === '');
      if (missingNewFields.length > 0) {
        console.log(`\n❌ Missing new fields: ${missingNewFields.length}/5`);
        missingNewFields.forEach(field => {
          console.log(`   ✗ ${field}`);
        });
      }

    } else {
      console.log('❌ Failed to get system status');
      console.log('Response:', statusData);
    }

  } catch (error) {
    console.error('❌ Error testing config display:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Backend server is running on http://localhost:5000');
    console.log('   - Database connection is working');
    console.log('   - Config table has been seeded with new fields');
  }
}

// Run the test
testConfigDisplay();
