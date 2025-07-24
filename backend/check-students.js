// Check students in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    console.log('📋 Checking students in database...');
    
    const students = await prisma.student.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        fullName: true,
        email: true,
        status: true,
        classId: true,
        profilePhoto: true
      }
    });
    
    console.log(`Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.fullName} (${student.studentId}) - Status: ${student.status}, Photo: ${student.profilePhoto ? 'Yes' : 'No'}`);
    });
    
    if (students.length === 0) {
      console.log('❌ No students found! You may need to seed the database.');
    }
    
  } catch (error) {
    console.error('❌ Error checking students:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
