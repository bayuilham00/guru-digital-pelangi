// Test Auto-Enrollment Challenge Fix
// Testing challenge creation with specific class target

console.log('🧪 Testing Challenge Auto-Enrollment Fix\n');

const testData = {
  title: 'Test Challenge Kelas 8.1',
  description: 'Challenge untuk testing auto-enrollment siswa kelas 8.1',
  duration: '7',
  targetType: 'SPECIFIC_CLASSES',
  specificClass: '8.1',
  xpReward: 50
};

const token = localStorage.getItem('auth_token');

fetch('http://localhost:5000/api/gamification/challenges', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(result => {
  console.log('✅ Challenge Creation Result:', result);
  
  if (result.success) {
    console.log('🎯 Challenge Created Successfully!');
    console.log('📊 Auto-enrolled students:', result.data.enrolledStudents);
    console.log('👥 Participant count:', result.data.participantCount);
    
    // Test getting challenges to verify display
    return fetch('http://localhost:5000/api/gamification/challenges', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } else {
    throw new Error(result.error);
  }
})
.then(response => response.json())
.then(result => {
  console.log('\n📋 Challenges List:');
  if (result.success && result.data.length > 0) {
    result.data.forEach((challenge, index) => {
      console.log(`\nChallenge ${index + 1}:`);
      console.log(`  Title: ${challenge.title}`);
      console.log(`  Target Type: ${challenge.targetType}`);
      console.log(`  Target Data:`, challenge.targetData);
      console.log(`  Participant Count: ${challenge.participantCount}`);
      
      // Test target display logic
      if ((challenge.targetType === 'SPECIFIC_CLASSES' || challenge.targetType === 'SPECIFIC_CLASS') && 
          challenge.targetData) {
        const targetData = challenge.targetData;
        const displayText = `Kelas ${targetData.class || 'Unknown'}`;
        console.log(`  ✅ Display Text: ${displayText}`);
      } else {
        console.log(`  ✅ Display Text: Semua Siswa`);
      }
    });
  }
})
.catch(error => {
  console.error('❌ Test Error:', error);
});

console.log('🚀 Test started - check console for results...');
