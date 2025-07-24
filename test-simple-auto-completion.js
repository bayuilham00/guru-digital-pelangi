/**
 * Simple Challenge Auto-Completion Test
 * Tests the complete workflow end-to-end
 */

const BASE_URL = 'http://localhost:5000/api';

// Test token (admin user)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzAzNzU2MH0.G_O8rpU-kIgH8sAA8hQp2EBYpfVpznNF9c9y5xXv9aY';

async function makeRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return await response.json();
}

async function testWorkflow() {
  console.log('🚀 Testing Challenge Auto-Completion Workflow\n');

  try {
    // 1. Check existing data
    console.log('1️⃣ Checking available data...');
    
    const classesResult = await makeRequest('/classes');
    console.log('   Classes available:', classesResult.success ? classesResult.data?.length || 0 : 'Error');
    
    const studentsResult = await makeRequest('/students');
    console.log('   Students available:', studentsResult.success ? studentsResult.data?.length || 0 : 'Error');
    
    if (!classesResult.success || !studentsResult.success) {
      console.log('❌ Could not fetch basic data. Check if database is set up properly.');
      return;
    }

    // 2. Get or create test data
    let targetClassId = null;
    if (classesResult.data && classesResult.data.length > 0) {
      targetClassId = classesResult.data[0].id;
      console.log(`   Using existing class ID: ${targetClassId}`);
    } else {
      console.log('   No classes found, you need to create classes first.');
      return;
    }

    // 3. Create a test challenge
    console.log('\n2️⃣ Creating test challenge...');
    const challengeData = {
      title: `Auto-Test Challenge ${Date.now()}`,
      description: 'Testing auto-completion when all students finish their tasks',
      targetType: 'CLASS',
      targetId: targetClassId,
      xpReward: 25,
      duration: ''
    };

    const createResult = await makeRequest('/gamification/challenges', 'POST', challengeData);
    if (!createResult.success) {
      console.log('❌ Failed to create challenge:', createResult.error || createResult.message);
      return;
    }

    const challengeId = createResult.data.challenge.id;
    console.log(`✅ Challenge created: ${challengeId}`);

    // 4. Get participants
    console.log('\n3️⃣ Getting auto-enrolled participants...');
    const participantsResult = await makeRequest(`/gamification/challenges/${challengeId}/participants`);
    
    if (!participantsResult.success) {
      console.log('❌ Failed to get participants:', participantsResult.error);
      return;
    }

    const participants = participantsResult.data.participants;
    console.log(`✅ Found ${participants.length} participants automatically enrolled`);

    if (participants.length === 0) {
      console.log('⚠️ No participants found. Make sure students exist in the selected class.');
      return;
    }

    // 5. Mark all participants as completed one by one
    console.log('\n4️⃣ Marking participants as completed...');
    
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const isLast = i === participants.length - 1;
      
      console.log(`   [${i + 1}/${participants.length}] Marking ${participant.student.fullName} as completed${isLast ? ' (FINAL)' : ''}...`);
      
      const markResult = await makeRequest(`/gamification/challenges/participants/${participant.id}/complete`, 'PATCH');
      
      if (markResult.success) {
        console.log(`   ✅ Success!`);
        
        // Check if this was the final participant that triggered auto-completion
        if (isLast && markResult.data.autoCompleted) {
          console.log('\n🎉 AUTO-COMPLETION TRIGGERED!');
          console.log(`   📊 Stats: ${markResult.data.completionStats.completed}/${markResult.data.completionStats.total} completed`);
          console.log('   ✨ Challenge automatically finalized!');
        }
        
        // Show progress
        if (markResult.data.completionStats) {
          const stats = markResult.data.completionStats;
          console.log(`   📈 Progress: ${stats.completed}/${stats.total} completed`);
        }
      } else {
        console.log(`   ❌ Failed: ${markResult.error || markResult.message}`);
      }
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 6. Verify final challenge status
    console.log('\n5️⃣ Verifying final challenge status...');
    const finalChallengesResult = await makeRequest('/gamification/challenges');
    
    if (finalChallengesResult.success) {
      const testChallenge = finalChallengesResult.data.challenges.find(c => c.id === challengeId);
      if (testChallenge) {
        console.log(`   📋 Challenge status: ${testChallenge.status}`);
        console.log(`   📅 Ended at: ${testChallenge.endedAt || 'Not set'}`);
        
        if (testChallenge.status === 'COMPLETED') {
          console.log('   ✅ Challenge successfully auto-completed!');
        } else {
          console.log('   ⚠️ Challenge status is still:', testChallenge.status);
        }
      }
    }

    console.log('\n🏁 Test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
console.log('Starting Challenge Auto-Completion Test...\n');
testWorkflow();
