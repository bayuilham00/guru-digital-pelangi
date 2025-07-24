// Test badge API endpoints with HTTP requests
const BASE_URL = 'http://localhost:5000';

// Mock auth token - replace with a real one from your login
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHc1dzRxMWcwMDAwMTIzNGFiY2QiLCJlbWFpbCI6ImFkbWluQGd1cnUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzM1MjU4NzIzLCJleHAiOjE3MzUzNDUxMjN9.someHash'; // This would be from your actual login

const testBadgeAPI = async () => {
  try {
    console.log('Testing Badge API endpoints...\n');
    
    // Test GET badges
    console.log('1. Testing GET /api/gamification/badges');
    const getBadgesResponse = await fetch(`${BASE_URL}/api/gamification/badges`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET badges status:', getBadgesResponse.status);
    if (getBadgesResponse.ok) {
      const badges = await getBadgesResponse.json();
      console.log('Found badges:', badges.data?.length || 0);
      
      if (badges.data && badges.data.length > 0) {
        const testBadge = badges.data[0];
        console.log('Using badge for test:', testBadge.id, testBadge.name);
        
        // Test PUT badge
        console.log('\n2. Testing PUT /api/gamification/badges/' + testBadge.id);
        const updateResponse = await fetch(`${BASE_URL}/api/gamification/badges/${testBadge.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: testBadge.name + ' (Test Update)',
            description: testBadge.description + ' - Test update',
            icon: testBadge.icon,
            xpReward: testBadge.xpReward
          })
        });
        
        console.log('PUT badge status:', updateResponse.status);
        const updateText = await updateResponse.text();
        console.log('PUT badge response:', updateText);
        
        if (updateResponse.ok) {
          console.log('Badge update successful');
          
          // Restore original values
          await fetch(`${BASE_URL}/api/gamification/badges/${testBadge.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: testBadge.name,
              description: testBadge.description,
              icon: testBadge.icon,
              xpReward: testBadge.xpReward
            })
          });
          console.log('Badge values restored');
        }
        
        // Test DELETE badge (create a test badge first)
        console.log('\n3. Testing badge creation and deletion');
        const createResponse = await fetch(`${BASE_URL}/api/gamification/badges`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test Badge for Deletion',
            description: 'This badge will be deleted',
            icon: '🧪',
            xpReward: 25
          })
        });
        
        console.log('POST badge status:', createResponse.status);
        if (createResponse.ok) {
          const newBadge = await createResponse.json();
          console.log('Created test badge:', newBadge.data?.id);
          
          // Now delete it
          const deleteResponse = await fetch(`${BASE_URL}/api/gamification/badges/${newBadge.data.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('DELETE badge status:', deleteResponse.status);
          const deleteText = await deleteResponse.text();
          console.log('DELETE badge response:', deleteText);
        }
      }
    } else {
      console.log('GET badges failed:', await getBadgesResponse.text());
    }
    
  } catch (error) {
    console.error('Error testing badge API:', error);
  }
};

testBadgeAPI();
