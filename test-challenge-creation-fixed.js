// Test Challenge Creation with correct class name
const testChallengeCreation = async () => {
  console.log('🧪 Testing Challenge Creation with Auto-Enrollment\n');

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.log('❌ No auth token found. Please login first.');
    return;
  }

  const testData = {
    title: 'Test Challenge - Kelas 8.1',
    description: 'Challenge untuk testing auto-enrollment siswa kelas 8.1 dengan class name yang benar',
    duration: '7',
    targetType: 'SPECIFIC_CLASSES',
    specificClass: 'Kelas 8.1', // Use exact class name from database
    xpReward: 50
  };

  console.log('📤 Sending challenge creation request...');
  console.log('Data:', testData);

  try {
    const response = await fetch('http://localhost:5000/api/gamification/challenges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('\n✅ Challenge Creation Result:', result);
    
    if (result.success) {
      console.log('🎯 Challenge Created Successfully!');
      console.log('📊 Auto-enrolled students:', result.data.enrolledStudents);
      console.log('👥 Participant count:', result.data.participantCount);
      
      // Test getting challenges to verify display
      console.log('\n🔍 Fetching updated challenges list...');
      const challengesResponse = await fetch('http://localhost:5000/api/gamification/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const challengesResult = await challengesResponse.json();
      console.log('\n📋 Updated Challenges List:');
      if (challengesResult.success && challengesResult.data.length > 0) {
        const latestChallenge = challengesResult.data[0]; // First one should be latest
        console.log(`\nLatest Challenge:`);
        console.log(`  📝 Title: ${latestChallenge.title}`);
        console.log(`  🎯 Target Type: ${latestChallenge.targetType}`);
        console.log(`  📊 Target Data:`, latestChallenge.targetData);
        console.log(`  👥 Participant Count: ${latestChallenge.participantCount}`);
        
        // Test target display logic
        if ((latestChallenge.targetType === 'SPECIFIC_CLASSES' || latestChallenge.targetType === 'SPECIFIC_CLASS') && 
            latestChallenge.targetData) {
          const targetData = latestChallenge.targetData;
          const displayText = `Kelas ${targetData.class || 'Unknown'}`;
          console.log(`  ✅ Display Text: ${displayText}`);
        } else {
          console.log(`  ✅ Display Text: Semua Siswa`);
        }
        
        // Test getting participants
        console.log('\n👥 Fetching participants...');
        const participantsResponse = await fetch(`http://localhost:5000/api/gamification/challenges/${latestChallenge.id}/participants`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const participantsResult = await participantsResponse.json();
        if (participantsResult.success) {
          console.log(`📋 Participants (${participantsResult.data.participants.length}):`);
          participantsResult.data.participants.forEach((participant, index) => {
            console.log(`  ${index + 1}. ${participant.student?.fullName || 'Unknown'} (${participant.student?.class?.name || 'No Class'}) - Status: ${participant.status}`);
          });
        }
      }
    } else {
      console.error('❌ Challenge creation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
};

// Start the test
testChallengeCreation();
