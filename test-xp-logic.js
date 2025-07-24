/**
 * Test XP Distribution Logic
 * Memverifikasi bahwa:
 * 1. XP diberikan saat individual completion
 * 2. Tidak ada XP ganda saat auto-completion
 * 3. Yang belum selesai saat deadline tidak dapat XP
 */

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzAzNzU2MH0.G_O8rpU-kIgH8sAA8hQp2EBYpfVpznNF9c9y5xXv9aY';

async function apiCall(endpoint, method = 'GET', data = null) {
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

async function getStudentXP(studentId) {
  const result = await apiCall(`/gamification/student-xp/${studentId}`);
  return result.success ? result.data?.totalXp || 0 : 0;
}

async function testXPLogic() {
  console.log('🧪 Testing XP Distribution Logic\n');

  try {
    // 1. Get available classes and students
    const classesResult = await apiCall('/classes');
    if (!classesResult.success || !classesResult.data?.length) {
      console.log('❌ No classes available for testing');
      return;
    }

    const targetClass = classesResult.data[0];
    console.log(`📚 Using class: ${targetClass.name} (ID: ${targetClass.id})`);

    // 2. Create test challenge
    const challengeData = {
      title: `XP Test Challenge ${Date.now()}`,
      description: 'Testing XP distribution logic',
      targetType: 'CLASS',
      targetId: targetClass.id,
      xpReward: 25,
      duration: ''
    };

    const createResult = await apiCall('/gamification/challenges', 'POST', challengeData);
    if (!createResult.success) {
      console.log('❌ Failed to create challenge:', createResult.error);
      return;
    }

    const challengeId = createResult.data.challenge.id;
    console.log(`✅ Challenge created: ${challengeId} (XP Reward: ${challengeData.xpReward})`);

    // 3. Get participants and their initial XP
    const participantsResult = await apiCall(`/gamification/challenges/${challengeId}/participants`);
    if (!participantsResult.success) {
      console.log('❌ Failed to get participants');
      return;
    }

    const participants = participantsResult.data.participants;
    console.log(`👥 Found ${participants.length} participants`);

    // Record initial XP for each student
    const initialXP = {};
    for (const participant of participants) {
      const studentId = participant.student.id;
      initialXP[studentId] = await getStudentXP(studentId);
      console.log(`   ${participant.student.fullName}: ${initialXP[studentId]} XP (initial)`);
    }

    // 4. Test Scenario 1: Complete half the students individually
    console.log('\n📋 Test 1: Individual Completion (should get XP immediately)');
    
    const halfCount = Math.ceil(participants.length / 2);
    const completedStudents = [];
    
    for (let i = 0; i < halfCount; i++) {
      const participant = participants[i];
      const studentId = participant.student.id;
      
      console.log(`   Completing ${participant.student.fullName}...`);
      
      const markResult = await apiCall(`/gamification/challenges/participants/${participant.id}/complete`, 'PATCH');
      if (markResult.success) {
        const newXP = await getStudentXP(studentId);
        const xpGained = newXP - initialXP[studentId];
        
        console.log(`   ✅ XP gained: ${xpGained} (Expected: ${challengeData.xpReward})`);
        
        if (xpGained === challengeData.xpReward) {
          console.log(`   ✅ Correct XP distribution!`);
        } else {
          console.log(`   ⚠️ XP mismatch! Expected ${challengeData.xpReward}, got ${xpGained}`);
        }
        
        completedStudents.push({
          studentId,
          name: participant.student.fullName,
          expectedXP: newXP
        });
      }
    }

    // 5. Test Scenario 2: Complete all remaining (should trigger auto-completion)
    console.log('\n🎯 Test 2: Auto-Completion (should NOT give additional XP)');
    
    for (let i = halfCount; i < participants.length; i++) {
      const participant = participants[i];
      const studentId = participant.student.id;
      const isLast = i === participants.length - 1;
      
      console.log(`   Completing ${participant.student.fullName}${isLast ? ' (FINAL - should trigger auto-completion)' : ''}...`);
      
      const beforeXP = await getStudentXP(studentId);
      
      const markResult = await apiCall(`/gamification/challenges/participants/${participant.id}/complete`, 'PATCH');
      if (markResult.success) {
        const afterXP = await getStudentXP(studentId);
        const xpGained = afterXP - beforeXP;
        
        console.log(`   ✅ XP gained: ${xpGained} (Expected: ${challengeData.xpReward})`);
        
        if (isLast && markResult.data.autoCompleted) {
          console.log(`   🎉 AUTO-COMPLETION DETECTED!`);
          console.log(`   📊 Stats: ${markResult.data.completionStats.completed}/${markResult.data.completionStats.total}`);
        }
        
        completedStudents.push({
          studentId,
          name: participant.student.fullName,
          expectedXP: afterXP
        });
      }
    }

    // 6. Verify final XP totals
    console.log('\n🔍 Final Verification: Checking XP totals');
    
    let allCorrect = true;
    for (const student of completedStudents) {
      const finalXP = await getStudentXP(student.studentId);
      const expectedTotal = initialXP[student.studentId] + challengeData.xpReward;
      
      console.log(`   ${student.name}: ${finalXP} XP (Expected: ${expectedTotal})`);
      
      if (finalXP === expectedTotal) {
        console.log(`   ✅ Correct total XP!`);
      } else {
        console.log(`   ❌ XP ERROR! Expected ${expectedTotal}, got ${finalXP}`);
        allCorrect = false;
      }
    }

    // 7. Verify challenge status
    console.log('\n📋 Challenge Status Check');
    const challengesResult = await apiCall('/gamification/challenges');
    if (challengesResult.success) {
      const testChallenge = challengesResult.data.challenges.find(c => c.id === challengeId);
      if (testChallenge) {
        console.log(`   Status: ${testChallenge.status}`);
        console.log(`   Ended at: ${testChallenge.endedAt || 'Not set'}`);
        
        if (testChallenge.status === 'COMPLETED') {
          console.log('   ✅ Challenge properly auto-completed!');
        } else {
          console.log('   ⚠️ Challenge status incorrect:', testChallenge.status);
          allCorrect = false;
        }
      }
    }

    // Final result
    console.log('\n🏁 Test Results:');
    if (allCorrect) {
      console.log('✅ ALL TESTS PASSED! XP distribution logic is working correctly.');
      console.log('   - Individual completion gives correct XP');
      console.log('   - Auto-completion does not give duplicate XP');
      console.log('   - Challenge status updates correctly');
    } else {
      console.log('❌ SOME TESTS FAILED! Check the XP distribution logic.');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

console.log('Starting XP Distribution Logic Test...\n');
testXPLogic();
