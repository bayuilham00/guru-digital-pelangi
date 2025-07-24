// Test badge API without authentication
const BASE_URL = 'http://localhost:5000';

const testBadgeAPINoAuth = async () => {
  try {
    console.log('Testing Badge API endpoints without authentication...\n');
    
    // Step 1: Test GET badges (this still needs auth, but we can skip it for now)
    console.log('1. Testing PUT /api/gamification/badges/[id] directly');
    
    // Use a known badge ID from previous tests
    const testBadgeId = 'cmcdcfy390002u8vs5yrpx1c4'; // Pencinta Buku badge
    
    const updatePayload = {
      name: 'Test Badge Update',
      description: 'Testing badge update without auth',
      icon: '🧪',
      xpReward: 123
    };
    
    console.log('Update payload:', updatePayload);
    
    const updateResponse = await fetch(`${BASE_URL}/api/gamification/badges/${testBadgeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    console.log('PUT badge status:', updateResponse.status);
    console.log('PUT badge response headers:', Object.fromEntries(updateResponse.headers.entries()));
    
    const updateText = await updateResponse.text();
    console.log('PUT badge response body:', updateText);
    
    if (updateResponse.ok) {
      console.log('Badge update successful without auth!');
      
      // Restore original values
      const restorePayload = {
        name: 'Pencinta Buku',
        description: 'Siswa yang tersering meminjam buku di Perpustakaan Sekolah',
        icon: '📚',
        xpReward: 175
      };
      
      const restoreResponse = await fetch(`${BASE_URL}/api/gamification/badges/${testBadgeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(restorePayload)
      });
      console.log('Badge values restored, status:', restoreResponse.status);
    }
    
    // Step 2: Test DELETE with a temporary badge
    console.log('\n2. Testing DELETE /api/gamification/badges/[id] directly');
    
    // Create a test badge first (this still needs auth, so we'll create it manually in DB)
    // For now, let's just test with an ID that doesn't exist to see the error handling
    const testDeleteId = 'non-existent-badge-id';
    
    const deleteResponse = await fetch(`${BASE_URL}/api/gamification/badges/${testDeleteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('DELETE badge status:', deleteResponse.status);
    console.log('DELETE badge response headers:', Object.fromEntries(deleteResponse.headers.entries()));
    
    const deleteText = await deleteResponse.text();
    console.log('DELETE badge response body:', deleteText);
    
  } catch (error) {
    console.error('Error testing badge API:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

testBadgeAPINoAuth();
