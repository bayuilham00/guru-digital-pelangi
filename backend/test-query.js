import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testAssignmentQuery() {
  try {
    const userId = 'cmd7drq5r000du8n8ym2alv3p'; // Teacher ID
    
    console.log('=== TESTING ASSIGNMENT QUERY ===');
    console.log('Teacher ID:', userId);
    
    // Test query with filter
    const whereClause = {
      teacherId: userId,
      status: 'PUBLISHED'
    };
    
    console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        teacherId: true,
        status: true
      }
    });
    
    console.log('Assignments found:', assignments.length);
    console.log('Assignment details:', JSON.stringify(assignments, null, 2));
    
    // Test count
    const count = await prisma.assignment.count({
      where: whereClause
    });
    
    console.log('Count result:', count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAssignmentQuery();
