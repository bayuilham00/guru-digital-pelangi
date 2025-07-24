// Test script to check gamification data in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking gamification data...');

  try {
    // Check students
    const students = await prisma.student.findMany({
      include: {
        studentXp: true,
        class: {
          include: {
            subject: true
          }
        },
        _count: {
          select: {
            achievements: true
          }
        }
      },
      take: 10
    });

    console.log(`\n📊 Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.fullName} (${student.studentId})`);
      console.log(`  Class: ${student.class?.name || 'No class'}`);
      console.log(`  XP: ${student.studentXp?.totalXp || 0}`);
      console.log(`  Level: ${student.studentXp?.level || 1} (${student.studentXp?.levelName || 'Pemula'})`);
      console.log(`  Badges: ${student._count.achievements}`);
      console.log('');
    });

    // Check studentXp table specifically
    const studentXps = await prisma.studentXp.findMany({
      include: {
        student: {
          include: {
            class: true
          }
        }
      }
    });

    console.log(`\n⚡ Found ${studentXps.length} StudentXP records:`);
    studentXps.forEach(xp => {
      console.log(`- ${xp.student.fullName}: ${xp.totalXp} XP, Level ${xp.level} (${xp.levelName})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
