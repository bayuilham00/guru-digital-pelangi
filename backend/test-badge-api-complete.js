// Complete test for badge API endpoints including authentication
const BASE_URL = 'http://localhost:5000';

const testBadgeAPIWithAuth = async () => {
  try {
    console.log('Testing Badge API endpoints with authentication...\n');
    
    // Step 1: Login to get auth token
    console.log('1. Logging in to get auth token...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    console.log('Login successful, got token');
    
    // Step 2: Test GET badges
    console.log('\n2. Testing GET /api/gamification/badges');
    const getBadgesResponse = await fetch(`${BASE_URL}/api/gamification/badges`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET badges status:', getBadgesResponse.status);
    
    if (!getBadgesResponse.ok) {
      console.log('GET badges failed:', await getBadgesResponse.text());
      return;
    }
    
    const badges = await getBadgesResponse.json();
    console.log('Found badges:', badges.data?.length || 0);
    
    if (badges.data && badges.data.length > 0) {
      const testBadge = badges.data[0];
      console.log('Using badge for test:', testBadge.id, testBadge.name);
      
      // Step 3: Test PUT badge
      console.log('\n3. Testing PUT /api/gamification/badges/' + testBadge.id);
      const updatePayload = {
        name: testBadge.name + ' (Test Update)',
        description: testBadge.description + ' - Test update',
        icon: testBadge.icon,
        xpReward: testBadge.xpReward
      };
      
      console.log('Update payload:', updatePayload);
      
      const updateResponse = await fetch(`${BASE_URL}/api/gamification/badges/${testBadge.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      console.log('PUT badge status:', updateResponse.status);
      console.log('PUT badge response headers:', Object.fromEntries(updateResponse.headers.entries()));
      
      const updateText = await updateResponse.text();
      console.log('PUT badge response body:', updateText);
      
      if (updateResponse.ok) {
        console.log('Badge update successful');
        
        // Restore original values
        const restoreResponse = await fetch(`${BASE_URL}/api/gamification/badges/${testBadge.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: testBadge.name,
            description: testBadge.description,
            icon: testBadge.icon,
            xpReward: testBadge.xpReward
          })
        });
        console.log('Badge values restored, status:', restoreResponse.status);
      }
      
      // Step 4: Test DELETE badge (create a test badge first)
      console.log('\n4. Testing badge creation and deletion');
      const createPayload = {
        name: 'Test Badge for Deletion',
        description: 'This badge will be deleted',
        icon: '🧪',
        xpReward: 25
      };
      
      const createResponse = await fetch(`${BASE_URL}/api/gamification/badges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPayload)
      });
      
      console.log('POST badge status:', createResponse.status);
      const createText = await createResponse.text();
      console.log('POST badge response:', createText);
      
      if (createResponse.ok) {
        const createData = JSON.parse(createText);
        const newBadgeId = createData.data?.id;
        console.log('Created test badge:', newBadgeId);
        
        if (newBadgeId) {
          // Now delete it
          console.log('Attempting to delete badge:', newBadgeId);
          const deleteResponse = await fetch(`${BASE_URL}/api/gamification/badges/${newBadgeId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('DELETE badge status:', deleteResponse.status);
          console.log('DELETE badge response headers:', Object.fromEntries(deleteResponse.headers.entries()));
          
          const deleteText = await deleteResponse.text();
          console.log('DELETE badge response body:', deleteText);
        }
      }
    } else {
      console.log('No badges found for testing');
    }
    
  } catch (error) {
    console.error('Error testing badge API:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

testBadgeAPIWithAuth();
