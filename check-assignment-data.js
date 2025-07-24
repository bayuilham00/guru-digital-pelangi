// Quick check for assignment data and student grades
import fetch from 'node-fetch';

async function checkAssignmentData() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '198404032009052001', password: 'guru123' })
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    // Get assignment details
    const assignmentResponse = await fetch('http://localhost:5000/api/assignments/cmd7dseho008hu8n8n6mo79r0', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const assignmentData = await assignmentResponse.json();

    // Get submissions
    const submissionsResponse = await fetch('http://localhost:5000/api/assignments/cmd7dseho008hu8n8n6mo79r0/submissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const submissionsData = await submissionsResponse.json();

    console.log('🎯 Assignment Details:');
    console.log('- Title:', assignmentData.data.title);
    console.log('- Points:', assignmentData.data.points);
    console.log('- Type:', assignmentData.data.type);
    console.log('');

    console.log('👥 Student Grades:');
    submissionsData.data.students.forEach(student => {
      console.log(`- ${student.fullName} (${student.studentId}):`);
      if (student.submission) {
        console.log(`  Submission ID: ${student.submission.id}`);
        console.log(`  Status: ${student.submission.status}`);
        console.log(`  Grade: ${student.submission.grade} / ${assignmentData.data.points}`);
        console.log(`  Submitted: ${student.submission.submittedAt}`);
        if (student.submission.feedback) {
          console.log(`  Feedback: ${student.submission.feedback}`);
        }
      } else {
        console.log('  No submission');
      }
      console.log('');
    });

    // Check for issues
    console.log('🔍 Issue Analysis:');
    const assignment = assignmentData.data;
    const submissions = submissionsData.data.students;
    
    submissions.forEach(student => {
      if (student.submission && student.submission.grade) {
        if (student.submission.grade > assignment.points) {
          console.log(`❌ Grade Issue: ${student.fullName} has grade ${student.submission.grade} > assignment points ${assignment.points}`);
        }
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAssignmentData();
