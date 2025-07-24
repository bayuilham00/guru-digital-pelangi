// Test Teacher Planner API endpoints

const API_BASE = 'http://localhost:5000/api';

// Test data for creating a lesson plan
const testLessonPlan = {
  title: 'Matematika - Aljabar Dasar',
  description: 'Pengenalan konsep aljabar dasar dan persamaan linear',
  classId: 'cmcjghw8d000ju82s35ijffin', // X IPA 1
  subjectId: 'cmcjghq610001u82sv87ny8sc', // Matematika
  scheduledDate: '2025-01-10',
  duration: 90, // 90 minutes
  learningObjectives: [
    'Siswa mampu memahami konsep variabel dalam aljabar',
    'Siswa dapat menyelesaikan persamaan linear sederhana'
  ],
  lessonContent: {
    materials: [
      'Buku matematika kelas 10',
      'Papan tulis',
      'Kalkulator'
    ],
    activities: [
      {
        time: '08:00-08:10',
        activity: 'Pembukaan dan apersepsi',
        method: 'Ceramah'
      },
      {
        time: '08:10-08:30',
        activity: 'Penjelasan konsep aljabar',
        method: 'Demonstrasi'
      },
      {
        time: '08:30-09:30',
        activity: 'Latihan soal',
        method: 'Diskusi kelompok'
      },
      {
        time: '09:30-09:40',
        activity: 'Penutup dan evaluasi',
        method: 'Tanya jawab'
      }
    ]
  },
  assessment: {
    type: 'Formative',
    criteria: 'Kemampuan menyelesaikan soal aljabar dasar',
    rubric: 'Penilaian berdasarkan keaktifan dan pemahaman konsep'
  },
  resources: [
    'Buku paket matematika kelas 10',
    'LKS matematika',
    'Video pembelajaran aljabar'
  ],
  notes: 'Perhatikan siswa yang kesulitan memahami konsep variabel'
};

// Helper function to get auth token (you may need to adjust this)
async function getAuthToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Test functions
async function testCreateLessonPlan(token) {
  console.log('\n=== Testing Create Lesson Plan ===');
  
  try {
    const response = await fetch(`${API_BASE}/teacher-planner/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testLessonPlan)
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Lesson plan created successfully');
      return data.data.id; // Return the ID from the data object
    } else {
      console.log('❌ Failed to create lesson plan');
      return null;
    }
  } catch (error) {
    console.error('Error creating lesson plan:', error);
    return null;
  }
}

async function testGetLessonPlans(token) {
  console.log('\n=== Testing Get Lesson Plans ===');
  
  try {
    const response = await fetch(`${API_BASE}/teacher-planner/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Lesson plans retrieved successfully');
      return data;
    } else {
      console.log('❌ Failed to get lesson plans');
      return null;
    }
  } catch (error) {
    console.error('Error getting lesson plans:', error);
    return null;
  }
}

async function testGetLessonPlan(token, id) {
  console.log('\n=== Testing Get Single Lesson Plan ===');
  
  try {
    const response = await fetch(`${API_BASE}/teacher-planner/plans/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Lesson plan retrieved successfully');
      return data;
    } else {
      console.log('❌ Failed to get lesson plan');
      return null;
    }
  } catch (error) {
    console.error('Error getting lesson plan:', error);
    return null;
  }
}

async function testUpdateLessonPlan(token, id) {
  console.log('\n=== Testing Update Lesson Plan ===');
  
  const updateData = {
    title: 'Matematika - Aljabar Dasar (Updated)',
    description: 'Pengenalan konsep aljabar dasar dan persamaan linear - dengan tambahan materi fungsi'
  };
  
  try {
    const response = await fetch(`${API_BASE}/teacher-planner/plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Lesson plan updated successfully');
      return data;
    } else {
      console.log('❌ Failed to update lesson plan');
      return null;
    }
  } catch (error) {
    console.error('Error updating lesson plan:', error);
    return null;
  }
}

async function testDeleteLessonPlan(token, id) {
  console.log('\n=== Testing Delete Lesson Plan ===');
  
  try {
    const response = await fetch(`${API_BASE}/teacher-planner/plans/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Lesson plan deleted successfully');
      return true;
    } else {
      console.log('❌ Failed to delete lesson plan');
      return false;
    }
  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Teacher Planner API Tests...');
  
  // Get auth token
  const token = await getAuthToken();
  if (!token) {
    console.log('❌ Could not get auth token. Please check your login credentials.');
    return;
  }
  
  console.log('✅ Auth token obtained');
  
  // Test CRUD operations
  const lessonPlanId = await testCreateLessonPlan(token);
  if (lessonPlanId) {
    await testGetLessonPlans(token);
    await testGetLessonPlan(token, lessonPlanId);
    await testUpdateLessonPlan(token, lessonPlanId);
    await testDeleteLessonPlan(token, lessonPlanId);
  }
  
  console.log('\n🎉 Teacher Planner API Tests completed!');
}

// Run the tests
runTests().catch(console.error);
