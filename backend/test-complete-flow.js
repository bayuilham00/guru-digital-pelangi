// Complete Flow Test for Profile Photo Upload
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test data - sample base64 image (1x1 pixel PNG)
const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

let authToken = null;
let studentData = null;

async function step1_login() {
  console.log('\n🔑 STEP 1: Login as Student');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: '1234567891', // Student NISN
        password: '1234567891'    // Password same as NISN
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      authToken = result.data.token;
      studentData = result.data.user;
      console.log('✅ Login successful');
      console.log('👤 Student:', studentData.name, `(ID: ${studentData.id})`);
      return true;
    } else {
      console.error('❌ Login failed:', result.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function step2_getProfileBefore() {
  console.log('\n📋 STEP 2: Get Profile Photo Before Upload');
  
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentData.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const student = result.data.student || result.data;
      console.log('✅ Profile fetch successful');
      console.log('📸 Current photo:', student.profilePhoto ? 'Has photo' : 'No photo');
      console.log('📸 Photo preview:', student.profilePhoto ? student.profilePhoto.substring(0, 50) + '...' : 'null');
      return student;
    } else {
      console.error('❌ Profile fetch failed:', result.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error.message);
    return null;
  }
}

async function step3_uploadPhoto() {
  console.log('\n📤 STEP 3: Upload New Profile Photo');
  
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentData.id}/profile-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        profilePhoto: sampleBase64
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Upload successful');
      console.log('📸 Updated photo preview:', result.data.profilePhoto.substring(0, 50) + '...');
      return result.data;
    } else {
      console.error('❌ Upload failed:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return null;
  }
}

async function step4_getProfileAfter() {
  console.log('\n📋 STEP 4: Get Profile Photo After Upload');
  
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentData.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const student = result.data.student || result.data;
      console.log('✅ Profile fetch successful');
      console.log('📸 Updated photo:', student.profilePhoto ? 'Has photo' : 'No photo');
      console.log('📸 Photo preview:', student.profilePhoto ? student.profilePhoto.substring(0, 50) + '...' : 'null');
      return student;
    } else {
      console.error('❌ Profile fetch failed:', result.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error.message);
    return null;
  }
}

async function step5_getPhotoDirectly() {
  console.log('\n📸 STEP 5: Get Photo Using Direct Photo Endpoint');
  
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentData.id}/profile-photo`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Direct photo fetch successful');
      console.log('📸 Photo data:', result.data.profilePhoto ? 'Has photo' : 'No photo');
      console.log('📸 Photo preview:', result.data.profilePhoto ? result.data.profilePhoto.substring(0, 50) + '...' : 'null');
      return result.data;
    } else {
      console.error('❌ Direct photo fetch failed:', result.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Direct photo fetch error:', error.message);
    return null;
  }
}

async function runCompleteTest() {
  console.log('🧪 Starting Complete Profile Photo Flow Test...');
  
  // Step 1: Login
  const loginSuccess = await step1_login();
  if (!loginSuccess) {
    console.log('\n❌ Test failed at login step');
    return;
  }
  
  // Step 2: Get profile before upload
  const profileBefore = await step2_getProfileBefore();
  
  // Step 3: Upload photo
  const uploadResult = await step3_uploadPhoto();
  if (!uploadResult) {
    console.log('\n❌ Test failed at upload step');
    return;
  }
  
  // Step 4: Get profile after upload
  const profileAfter = await step4_getProfileAfter();
  
  // Step 5: Get photo directly
  const photoData = await step5_getPhotoDirectly();
  
  // Final analysis
  console.log('\n📊 FINAL ANALYSIS:');
  console.log('📋 Before upload photo:', profileBefore?.profilePhoto ? 'Has photo' : 'No photo');
  console.log('📤 Upload result:', uploadResult ? 'Success' : 'Failed');
  console.log('📋 After upload photo:', profileAfter?.profilePhoto ? 'Has photo' : 'No photo');
  console.log('📸 Direct photo fetch:', photoData?.profilePhoto ? 'Has photo' : 'No photo');
  
  if (profileAfter?.profilePhoto && photoData?.profilePhoto) {
    console.log('✅ Complete flow successful! Photo is stored and retrievable.');
  } else {
    console.log('❌ Flow failed - photo not properly stored or retrievable.');
  }
}

runCompleteTest();
