import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkClasses() {
  try {
    console.log('🔧 Checking classes in database...');
    
    const classes = await prisma.class.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        subject: true
      }
    });
    
    console.log(`📊 Total classes found: ${classes.length}`);
    console.log('\n📋 Recent classes:');
    
    if (classes.length === 0) {
      console.log('❌ No classes found in database');
    } else {
      classes.forEach((cls, i) => {
        console.log(`${i+1}. Name: "${cls.name}" | Grade: ${cls.gradeLevel} | Subject: ${cls.subject?.name || 'None'} | Created: ${cls.createdAt.toISOString()}`);
      });
    }

    // Check for duplicate class names
    console.log('\n🔍 Checking for potential duplicates...');
    const duplicateCheck = await prisma.class.groupBy({
      by: ['name', 'gradeLevel'],
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicateCheck.length > 0) {
      console.log('⚠️  Found potential duplicates:');
      duplicateCheck.forEach(dup => {
        console.log(`   - "${dup.name}" Grade ${dup.gradeLevel}: ${dup._count.id} entries`);
      });
    } else {
      console.log('✅ No duplicates found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkClasses();
