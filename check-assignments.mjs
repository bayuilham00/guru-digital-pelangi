import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAssignments() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('Total assignments found:', assignments.length);
    console.log('');
    
    assignments.forEach((assignment, index) => {
      console.log(`Assignment ${index + 1}:`);
      console.log('  ID:', assignment.id);
      console.log('  Title:', assignment.title);
      console.log('  Teacher ID:', assignment.teacherId);
      console.log('  Teacher Name:', assignment.teacher.name);
      console.log('  Teacher Email:', assignment.teacher.email);
      console.log('  Teacher Role:', assignment.teacher.role);
      console.log('  Class:', assignment.class.name);
      console.log('  Subject:', assignment.subject?.name || 'No subject');
      console.log('  Status:', assignment.status);
      console.log('  Created At:', assignment.createdAt);
      console.log('  ---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssignments();
