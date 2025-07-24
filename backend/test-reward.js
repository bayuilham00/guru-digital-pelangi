// Test reward API endpoint
const testReward = async () => {
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
  
  const rewardData = {
    studentId: 'cm59p6c5m0008psjgdw1qf2op', // Replace with actual student ID
    type: 'xp',
    xpAmount: 50,
    description: 'Test reward'
  };

  try {
    const response = await fetch('http://localhost:5000/api/gamification/rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(rewardData)
    });

    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

testReward();
