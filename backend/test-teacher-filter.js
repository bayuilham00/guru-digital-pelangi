import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testTeacherFilter() {
  try {
    const teacherId = 'cmd7drq5r000du8n8ym2alv3p'; // Drs. Budi Santoso
    
    // Test query with teacherId filter
    const assignments = await prisma.assignment.count({
      where: {
        teacherId: teacherId,
        status: 'PUBLISHED'
      }
    });
    
    console.log('Assignments for teacher', teacherId, ':', assignments);
    
    // Test without filter
    const allAssignments = await prisma.assignment.count({
      where: {
        status: 'PUBLISHED'
      }
    });
    
    console.log('All assignments:', allAssignments);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeacherFilter();
