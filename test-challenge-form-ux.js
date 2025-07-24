// Test script for Challenge form functionality
// Tests the new UX improvements: empty duration default and specific class selection

const API_BASE = 'http://localhost:5000/api';

async function testChallengeCreation() {
  console.log('🧪 Testing Challenge Form UX Improvements...\n');

  // Test 1: Create challenge with empty duration (should default to 7)
  console.log('Test 1: Challenge with empty duration');
  const testChallenge1 = {
    title: 'Test Challenge - Empty Duration',
    description: 'Testing default duration behavior',
    duration: '', // Empty string should default to 7
    targetType: 'ALL_STUDENTS',
    xpReward: 100
  };

  try {
    const response1 = await fetch(`${API_BASE}/gamification/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock token for testing
      },
      body: JSON.stringify(testChallenge1)
    });

    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ Challenge created successfully');
      console.log(`   Duration set to: ${result1.data.duration} days (should be 7)`);
    } else {
      console.log('❌ Challenge creation failed:', response1.status);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('');

  // Test 2: Create challenge with specific class selection
  console.log('Test 2: Challenge with specific class');
  const testChallenge2 = {
    title: 'Test Challenge - Specific Class',
    description: 'Testing specific class targeting',
    duration: 10,
    targetType: 'SPECIFIC_CLASSES',
    specificClass: '9A', // Specific class selection
    xpReward: 150
  };

  try {
    const response2 = await fetch(`${API_BASE}/gamification/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testChallenge2)
    });

    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ Specific class challenge created successfully');
      console.log(`   Target Type: ${result2.data.targetType}`);
      console.log(`   Target Data: ${JSON.stringify(result2.data.targetData)}`);
    } else {
      console.log('❌ Specific class challenge creation failed:', response2.status);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🏁 Challenge form tests completed!');
}

// Run the test
testChallengeCreation();
