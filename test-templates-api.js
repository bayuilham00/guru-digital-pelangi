// Test script for template functionality
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  identifier: 'admin@pelangi.sch.id',
  password: 'admin123'
};

let authToken = '';

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

// Test 1: Login
async function testLogin() {
  console.log('🔐 Testing login...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Login failed: ${response.status} - ${text}`);
    }

    const result = await response.json();
    
    if (result.success && result.data.token) {
      authToken = result.data.token;
      console.log('✅ Login successful');
      console.log('📝 User:', result.data.user.name, '- Role:', result.data.user.role);
      return true;
    } else {
      throw new Error('Invalid login response');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

// Test 2: Get templates
async function testGetTemplates() {
  console.log('\n📋 Testing get templates...');
  
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE_URL}/templates?page=1&limit=10`);
    
    if (result.success) {
      console.log('✅ Templates retrieved successfully');
      console.log('📊 Total templates:', result.pagination?.total || 0);
      console.log('📄 Templates in page:', result.data?.length || 0);
      
      if (result.data && result.data.length > 0) {
        console.log('🔍 First template:', {
          id: result.data[0].id,
          name: result.data[0].name,
          subject: result.data[0].subject?.name,
          creator: result.data[0].createdByUser?.name,
          isPublic: result.data[0].isPublic
        });
      }
      
      return result.data;
    } else {
      throw new Error('Failed to get templates');
    }
  } catch (error) {
    console.error('❌ Get templates failed:', error.message);
    return [];
  }
}

// Test 3: Create template
async function testCreateTemplate() {
  console.log('\n➕ Testing create template...');
  
  try {
    // First, get subjects to use in template
    const subjectsResponse = await makeAuthenticatedRequest(`${API_BASE_URL}/subjects`);
    const subjects = subjectsResponse.data || [];
    
    if (subjects.length === 0) {
      console.log('⚠️  No subjects available, skipping template creation');
      return null;
    }

    const templateData = {
      name: 'Test Template - ' + new Date().toISOString(),
      description: 'Template created by test script',
      subjectId: subjects[0].id,
      estimatedDuration: 90,
      isPublic: false,
      learningObjectives: [
        'Siswa dapat memahami konsep dasar',
        'Siswa dapat menerapkan pengetahuan dalam praktik'
      ],
      templateStructure: {
        introduction: 'Kegiatan pembuka pembelajaran',
        mainActivity: 'Kegiatan inti pembelajaran',
        conclusion: 'Kegiatan penutup dan refleksi',
        assessment: {
          type: 'written',
          criteria: 'Penilaian berdasarkan pemahaman dan penerapan'
        },
        resources: ['Buku teks', 'Papan tulis', 'Lembar kerja siswa']
      },
      difficultyLevel: 'MEDIUM',
      gradeLevel: '7-9'
    };

    const result = await makeAuthenticatedRequest(`${API_BASE_URL}/templates`, {
      method: 'POST',
      body: JSON.stringify(templateData)
    });

    if (result.success) {
      console.log('✅ Template created successfully');
      console.log('📝 Template ID:', result.data.id);
      console.log('📝 Template Name:', result.data.name);
      return result.data;
    } else {
      throw new Error('Failed to create template');
    }
  } catch (error) {
    console.error('❌ Create template failed:', error.message);
    return null;
  }
}

// Test 4: Get single template
async function testGetTemplate(templateId) {
  console.log('\n🔍 Testing get single template...');
  
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE_URL}/templates/${templateId}`);
    
    if (result.success) {
      console.log('✅ Template retrieved successfully');
      console.log('📝 Template:', {
        id: result.data.id,
        name: result.data.name,
        description: result.data.description,
        duration: result.data.estimatedDuration,
        objectives: result.data.learningObjectives?.length || 0,
        isPublic: result.data.isPublic
      });
      return result.data;
    } else {
      throw new Error('Failed to get template');
    }
  } catch (error) {
    console.error('❌ Get template failed:', error.message);
    return null;
  }
}

// Test 5: Update template
async function testUpdateTemplate(templateId) {
  console.log('\n✏️  Testing update template...');
  
  try {
    const updateData = {
      name: 'Updated Test Template - ' + new Date().toISOString(),
      description: 'Updated template description',
      estimatedDuration: 120,
      isPublic: true
    };

    const result = await makeAuthenticatedRequest(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    if (result.success) {
      console.log('✅ Template updated successfully');
      console.log('📝 Updated name:', result.data.name);
      console.log('📝 Updated duration:', result.data.estimatedDuration);
      console.log('📝 Updated isPublic:', result.data.isPublic);
      return result.data;
    } else {
      throw new Error('Failed to update template');
    }
  } catch (error) {
    console.error('❌ Update template failed:', error.message);
    return null;
  }
}

// Test 6: Duplicate template
async function testDuplicateTemplate(templateId) {
  console.log('\n📋 Testing duplicate template...');
  
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE_URL}/templates/${templateId}/duplicate`, {
      method: 'POST'
    });

    if (result.success) {
      console.log('✅ Template duplicated successfully');
      console.log('📝 Duplicated template ID:', result.data.id);
      console.log('📝 Duplicated template name:', result.data.name);
      return result.data;
    } else {
      throw new Error('Failed to duplicate template');
    }
  } catch (error) {
    console.error('❌ Duplicate template failed:', error.message);
    return null;
  }
}

// Test 7: Delete template
async function testDeleteTemplate(templateId) {
  console.log('\n🗑️  Testing delete template...');
  
  try {
    const result = await makeAuthenticatedRequest(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'DELETE'
    });

    if (result.success) {
      console.log('✅ Template deleted successfully');
      return true;
    } else {
      throw new Error('Failed to delete template');
    }
  } catch (error) {
    console.error('❌ Delete template failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting template functionality tests...\n');
  
  // Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot continue without authentication');
    return;
  }

  // Test get templates
  const existingTemplates = await testGetTemplates();

  // Test create template
  const createdTemplate = await testCreateTemplate();
  if (!createdTemplate) {
    console.log('❌ Cannot continue without creating template');
    return;
  }

  // Test get single template
  await testGetTemplate(createdTemplate.id);

  // Test update template
  await testUpdateTemplate(createdTemplate.id);

  // Test duplicate template
  const duplicatedTemplate = await testDuplicateTemplate(createdTemplate.id);

  // Test delete duplicated template
  if (duplicatedTemplate) {
    await testDeleteTemplate(duplicatedTemplate.id);
  }

  // Test delete original template
  await testDeleteTemplate(createdTemplate.id);

  console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
