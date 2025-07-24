/**
 * Check existing classes in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClasses() {
  try {
    console.log('🔍 Checking classes in database...\n');
    
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        gradeLevel: true,
        isPhysicalClass: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      take: 10
    });

    if (classes.length === 0) {
      console.log('❌ No classes found in database');
    } else {
      console.log(`✅ Found ${classes.length} classes:`);
      classes.forEach((cls, index) => {
        console.log(`${index + 1}. ID: ${cls.id}`);
        console.log(`   Name: ${cls.name}`);
        console.log(`   Grade: ${cls.gradeLevel || 'N/A'}`);
        console.log(`   Students: ${cls._count.students}`);
        console.log(`   Physical: ${cls.isPhysicalClass}`);
        console.log('');
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error checking classes:', error);
    await prisma.$disconnect();
  }
}

checkClasses();
