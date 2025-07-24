/**
 * Test Script: Challenge Auto-Completion Workflow
 * 
 * This script tests the automatic challenge completion detection and XP distribution system
 * by simulating the scenario where all students complete their individual tasks.
 */

const BASE_URL = 'http://localhost:5000/api';

// Mock auth token - replace with real token in actual testing
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzAzNzU2MH0.G_O8rpU-kIgH8sAA8hQp2EBYpfVpznNF9c9y5xXv9aY';

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
}

async function testAutoCompletionWorkflow() {
  console.log('🎯 Testing Challenge Auto-Completion Workflow\n');

  // Step 1: Create a test challenge
  console.log('📝 Step 1: Creating test challenge...');
  const challengeData = {
    title: 'Auto-Completion Test Challenge',
    description: 'Testing automatic completion detection when all students finish',
    targetType: 'CLASS',
    targetId: '1', // Assuming class ID 1 exists
    xpReward: 50,
    duration: ''
  };

  const createResponse = await apiCall('/gamification/challenges', 'POST', challengeData);
  if (!createResponse.success) {
    console.error('❌ Failed to create challenge:', createResponse.error);
    return;
  }

  const challengeId = createResponse.data.challenge.id;
  console.log(`✅ Challenge created with ID: ${challengeId}`);

  // Step 2: Get challenge participants
  console.log('\n👥 Step 2: Getting challenge participants...');
  const participantsResponse = await apiCall(`/gamification/challenges/${challengeId}/participants`);
  if (!participantsResponse.success) {
    console.error('❌ Failed to get participants:', participantsResponse.error);
    return;
  }

  const participants = participantsResponse.data.participants;
  console.log(`✅ Found ${participants.length} participants automatically enrolled`);

  // Step 3: Mark all participants as completed (except the last one)
  console.log('\n✅ Step 3: Marking participants as completed...');
  
  for (let i = 0; i < participants.length - 1; i++) {
    const participant = participants[i];
    console.log(`   Marking participant ${i + 1}/${participants.length} (${participant.student.fullName}) as completed...`);
    
    const markResponse = await apiCall(`/gamification/challenges/participants/${participant.id}/complete`, 'PATCH');
    if (markResponse.success) {
      console.log(`   ✅ Participant ${i + 1} marked as completed`);
    } else {
      console.error(`   ❌ Failed to mark participant ${i + 1}:`, markResponse.error);
    }
  }

  // Step 4: Mark the last participant (this should trigger auto-completion)
  console.log('\n🎉 Step 4: Marking FINAL participant (should trigger auto-completion)...');
  const lastParticipant = participants[participants.length - 1];
  console.log(`   Final participant: ${lastParticipant.student.fullName}`);

  const finalMarkResponse = await apiCall(`/gamification/challenges/participants/${lastParticipant.id}/complete`, 'PATCH');
  
  if (finalMarkResponse.success) {
    console.log('✅ Final participant marked as completed');
    
    // Check if auto-completion was triggered
    if (finalMarkResponse.data.autoCompleted) {
      console.log('\n🎉 AUTO-COMPLETION TRIGGERED! 🎉');
      console.log('📊 Completion Stats:', finalMarkResponse.data.completionStats);
      console.log('✨ Challenge automatically finalized and XP distributed!');
    } else {
      console.log('\n⚠️ Auto-completion was NOT triggered');
      console.log('   All participants completed:', finalMarkResponse.data.allParticipantsCompleted);
      console.log('   Completion stats:', finalMarkResponse.data.completionStats);
    }
  } else {
    console.error('❌ Failed to mark final participant:', finalMarkResponse.error);
  }

  // Step 5: Verify challenge status
  console.log('\n🔍 Step 5: Verifying final challenge status...');
  const finalParticipantsResponse = await apiCall(`/gamification/challenges/${challengeId}/participants`);
  if (finalParticipantsResponse.success) {
    const finalParticipants = finalParticipantsResponse.data.participants;
    const completedCount = finalParticipants.filter(p => p.status === 'COMPLETED').length;
    console.log(`✅ Final status: ${completedCount}/${finalParticipants.length} participants completed`);
    
    // Check challenge status
    const challengesResponse = await apiCall('/gamification/challenges');
    if (challengesResponse.success) {
      const testChallenge = challengesResponse.data.challenges.find(c => c.id === challengeId);
      if (testChallenge) {
        console.log(`✅ Challenge status: ${testChallenge.status}`);
        console.log(`✅ Challenge ended at: ${testChallenge.endedAt || 'Not set'}`);
      }
    }
  }

  console.log('\n🏁 Auto-Completion Test Completed!');
}

// Run the test
testAutoCompletionWorkflow().catch(console.error);
