// Quick DB Test - Check students in Kelas 8.1
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStudentData() {
  console.log('🔍 Checking students in database...\n');
  
  try {
    // Get all classes first
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        fullName: true,
        classId: true,
        class: {
          select: {
            name: true
          }
        }
      }
    });
    
    const uniqueClasses = [...new Set(allStudents.map(s => s.class?.name).filter(Boolean))];
    console.log('📚 Available classes:', uniqueClasses);
    
    // Check specifically for 8.1
    const studentsIn8_1 = await prisma.student.findMany({
      where: {
        class: {
          name: '8.1'
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        fullName: true,
        class: {
          select: {
            name: true
          }
        },
        status: true
      }
    });
    
    console.log(`\n👥 Students in Kelas 8.1: ${studentsIn8_1.length}`);
    if (studentsIn8_1.length > 0) {
      studentsIn8_1.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.fullName} (${student.class?.name})`);
      });
    } else {
      console.log('❌ No students found in Kelas 8.1');
      
      // Show some sample students
      const sampleStudents = await prisma.student.findMany({
        take: 5,
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          fullName: true,
          class: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log('\n📝 Sample students:');
      sampleStudents.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.fullName} (${student.class?.name || 'No Class'})`);
      });
    }
    
    // Check total active students
    const totalStudents = await prisma.student.count({
      where: { status: 'ACTIVE' }
    });
    
    console.log(`\n📊 Total active students: ${totalStudents}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database error:', error);
    await prisma.$disconnect();
  }
}

testStudentData();
