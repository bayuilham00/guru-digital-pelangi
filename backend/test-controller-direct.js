// Direct test of gamification controller functions
import { updateBadge, deleteBadge } from './src/controllers/gamificationController.js';

// Mock request and response objects
const createMockReq = (id, body = {}) => ({
  params: { id },
  body,
  user: {
    id: 'clw5w4q1g000012340000001',
    email: 'admin@pelangi.sch.id',
    role: 'ADMIN'
  }
});

const createMockRes = () => {
  const res = {
    status: function(code) {
      res.statusCode = code;
      return res;
    },
    json: function(data) {
      res.jsonData = data;
      console.log(`Response ${res.statusCode}:`, JSON.stringify(data, null, 2));
      return res;
    },
    statusCode: 200,
    jsonData: null
  };
  return res;
};

const testControllerFunctions = async () => {
  try {
    console.log('Testing gamification controller functions directly...\n');
    
    // First get a badge ID to test with
    import('./src/controllers/gamificationController.js').then(async (controller) => {
      // Get badges first
      console.log('1. Getting badges...');
      const getBadgesReq = createMockReq('');
      const getBadgesRes = createMockRes();
      
      await controller.getBadges(getBadgesReq, getBadgesRes);
      
      if (getBadgesRes.jsonData && getBadgesRes.jsonData.data && getBadgesRes.jsonData.data.length > 0) {
        const testBadge = getBadgesRes.jsonData.data[0];
        console.log(`Using badge: ${testBadge.id} - ${testBadge.name}`);
        
        // Test update badge
        console.log('\n2. Testing updateBadge...');
        const updateReq = createMockReq(testBadge.id, {
          name: testBadge.name + ' (Updated)',
          description: testBadge.description + ' - Updated',
          icon: testBadge.icon,
          xpReward: testBadge.xpReward
        });
        const updateRes = createMockRes();
        
        try {
          await controller.updateBadge(updateReq, updateRes);
          console.log('Update badge test completed');
          
          // Restore original values
          const restoreReq = createMockReq(testBadge.id, {
            name: testBadge.name,
            description: testBadge.description,
            icon: testBadge.icon,
            xpReward: testBadge.xpReward
          });
          const restoreRes = createMockRes();
          await controller.updateBadge(restoreReq, restoreRes);
          console.log('Badge values restored');
          
        } catch (error) {
          console.error('Error in updateBadge:', error);
        }
        
        // Test create and delete badge
        console.log('\n3. Testing createBadge...');
        const createReq = createMockReq('', {
          name: 'Test Badge for Deletion',
          description: 'This badge will be deleted',
          icon: '🧪',
          xpReward: 25
        });
        const createRes = createMockRes();
        
        try {
          await controller.createBadge(createReq, createRes);
          
          if (createRes.jsonData && createRes.jsonData.data) {
            const newBadgeId = createRes.jsonData.data.id;
            console.log(`Created badge: ${newBadgeId}`);
            
            // Test delete badge
            console.log('\n4. Testing deleteBadge...');
            const deleteReq = createMockReq(newBadgeId);
            const deleteRes = createMockRes();
            
            await controller.deleteBadge(deleteReq, deleteRes);
            console.log('Delete badge test completed');
          }
          
        } catch (error) {
          console.error('Error in createBadge or deleteBadge:', error);
        }
        
      } else {
        console.log('No badges found to test with');
      }
    });
    
  } catch (error) {
    console.error('Error testing controller functions:', error);
  }
};

testControllerFunctions();
