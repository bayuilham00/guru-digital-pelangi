// Test Assignment Submissions API
import fetch from 'node-fetch';

async function testAssignmentSubmissions() {
  try {
    // First, let's login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: '198404032009052001',
        password: 'guru123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔐 Login response:', loginData.success ? 'Success' : 'Failed');
    console.log('📄 Full login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.data.token;
    console.log('🎫 Token:', token ? 'Received' : 'Missing');

    // Get assignments for the teacher
    console.log('\n📋 Fetching teacher assignments...');
    const assignmentsResponse = await fetch('http://localhost:5000/api/assignments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📋 Assignments Response Status:', assignmentsResponse.status);
    const assignmentsText = await assignmentsResponse.text();
    console.log('📋 Raw assignments response:', assignmentsText.substring(0, 500));

    const assignmentsData = JSON.parse(assignmentsText);
    console.log('📋 Assignments response:', assignmentsData.success ? 'Success' : 'Failed');
    console.log('📄 Assignments data:', JSON.stringify(assignmentsData, null, 2));
    
    if (!assignmentsData.success) {
      console.error('❌ Assignments fetch failed:', assignmentsData.error);
      return;
    }

    const assignments = assignmentsData.data?.assignments || [];
    console.log(`📊 Found ${assignments.length} assignments`);
    
    if (assignments.length === 0) {
      console.log('⚠️ No assignments found for this user');
      console.log('🔄 Let me try to fetch all assignments as admin...');
      
      // Try to get all assignments in the system
      const allAssignmentsResponse = await fetch('http://localhost:5000/api/assignments/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (allAssignmentsResponse.ok) {
        const allAssignmentsData = await allAssignmentsResponse.json();
        console.log('📋 All assignments response:', allAssignmentsData.success ? 'Success' : 'Failed');
        const allAssignments = allAssignmentsData.data || [];
        console.log(`📊 Found ${allAssignments.length} total assignments in system`);
        
        if (allAssignments.length > 0) {
          const firstAssignment = allAssignments[0];
          console.log(`\n🎯 Testing assignment: ${firstAssignment.title} (ID: ${firstAssignment.id})`);
          // Continue with the test using the first available assignment
          await testSubmissions(token, firstAssignment);
          return;
        }
      }
      
      console.log('⚠️ No assignments found in the entire system');
      return;
    }

    // Test the first assignment's submissions
    const firstAssignment = assignments[0];
    console.log(`\n🎯 Testing assignment: ${firstAssignment.title} (ID: ${firstAssignment.id})`);

    const submissionsResponse = await fetch(`http://localhost:5000/api/assignments/${firstAssignment.id}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📨 Response status:', submissionsResponse.status);
    console.log('📨 Response headers:', submissionsResponse.headers.get('content-type'));

    const submissionsText = await submissionsResponse.text();
    console.log('📨 Raw response:', submissionsText);

    // Try to parse as JSON
    try {
      const submissionsData = JSON.parse(submissionsText);
      console.log('✅ Submissions data parsed successfully');
      console.log('📊 Success:', submissionsData.success);
      
      if (submissionsData.success && submissionsData.data && submissionsData.data.students) {
        console.log(`👥 Found ${submissionsData.data.students.length} students`);
        
        // Show first few students
        submissionsData.data.students.slice(0, 3).forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
          if (student.submission) {
            console.log(`      → Submission: ${student.submission.status}`);
          } else {
            console.log(`      → No submission`);
          }
        });
      } else {
        console.log('❌ No students data found in response');
        console.log('📄 Data structure:', JSON.stringify(submissionsData, null, 2));
      }
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Helper function to test assignment submissions
async function testSubmissions(token, assignment) {
  try {
    console.log(`\n🎯 Testing assignment submissions for: ${assignment.title} (ID: ${assignment.id})`);

    const submissionsResponse = await fetch(`http://localhost:5000/api/assignments/${assignment.id}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📨 Response status:', submissionsResponse.status);
    console.log('📨 Response headers:', submissionsResponse.headers.get('content-type'));

    const submissionsText = await submissionsResponse.text();
    console.log('📨 Raw response length:', submissionsText.length);

    // Try to parse as JSON
    try {
      const submissionsData = JSON.parse(submissionsText);
      console.log('✅ Submissions data parsed successfully');
      console.log('📊 Success:', submissionsData.success);
      
      if (submissionsData.success && submissionsData.data && submissionsData.data.students) {
        console.log(`👥 Found ${submissionsData.data.students.length} students`);
        
        // Show first few students
        submissionsData.data.students.slice(0, 3).forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
          if (student.submission) {
            console.log(`      → Submission: ${student.submission.status}`);
          } else {
            console.log(`      → No submission`);
          }
        });
      } else {
        console.log('❌ No students data found in response');
        console.log('📄 Data structure:', JSON.stringify(submissionsData, null, 2));
      }
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.log('📄 Raw response:', submissionsText.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Test assignment submissions failed:', error.message);
  }
}

async function testAssignmentSubmissions2(token, assignment) {
  try {
    console.log(`\n🎯 Testing assignment: ${assignment.title} (ID: ${assignment.id})`);

    const submissionsResponse = await fetch(`http://localhost:5000/api/assignments/${assignment.id}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📨 Response status:', submissionsResponse.status);
    console.log('📨 Response headers:', submissionsResponse.headers.get('content-type'));

    const submissionsText = await submissionsResponse.text();
    console.log('📨 Raw response length:', submissionsText.length);

    // Try to parse as JSON
    try {
      const submissionsData = JSON.parse(submissionsText);
      console.log('✅ Submissions data parsed successfully');
      console.log('📊 Success:', submissionsData.success);
      
      if (submissionsData.success && submissionsData.data && submissionsData.data.students) {
        console.log(`👥 Found ${submissionsData.data.students.length} students`);
        
        // Show first few students
        submissionsData.data.students.slice(0, 3).forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
          if (student.submission) {
            console.log(`      → Submission: ${student.submission.status}`);
          } else {
            console.log(`      → No submission`);
          }
        });
      } else {
        console.log('❌ No students data found in response');
        console.log('📄 Data structure:', JSON.stringify(submissionsData, null, 2));
      }
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.log('📄 Raw response:', submissionsText.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Test assignment submissions failed:', error.message);
  }
}

// Run the test
testAssignmentSubmissions();
