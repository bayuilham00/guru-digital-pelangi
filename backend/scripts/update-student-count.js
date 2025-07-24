/**
 * Update Student Count Logic
 * 
 * This script updates the student count calculation to be dynamic
 * based on StudentSubjectEnrollment rather than static Class.studentCount
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateStudentCountLogic() {
  console.log('🔧 Updating student count logic for all classes...\n');

  try {
    // Get all classes with their enrollments
    const classes = await prisma.class.findMany({
      include: {
        classSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log(`📋 Processing ${classes.length} classes...`);

    for (const cls of classes) {
      console.log(`\n🔍 Processing: ${cls.name} (ID: ${cls.id})`);
      
      if (cls.classSubjects.length === 0) {
        console.log(`   ⚠️  No subjects in this class - keeping current studentCount: ${cls.studentCount}`);
        continue;
      }

      // For multi-subject classes, count unique students enrolled in ANY subject
      const uniqueStudentIds = await prisma.studentSubjectEnrollment.findMany({
        where: {
          classId: cls.id,
          isActive: true
        },
        select: {
          studentId: true
        },
        distinct: ['studentId']
      });

      const actualStudentCount = uniqueStudentIds.length;
      
      console.log(`   • Current studentCount: ${cls.studentCount}`);
      console.log(`   • Actual enrolled students: ${actualStudentCount}`);
      console.log(`   • Subjects: ${cls.classSubjects.map(cs => cs.subject.name).join(', ')}`);

      // Update the studentCount if different
      if (cls.studentCount !== actualStudentCount) {
        await prisma.class.update({
          where: { id: cls.id },
          data: { studentCount: actualStudentCount }
        });
        console.log(`   ✅ Updated studentCount: ${cls.studentCount} → ${actualStudentCount}`);
      } else {
        console.log(`   ✓ studentCount already correct`);
      }
    }

    // Summary report
    console.log('\n📊 Updated Student Count Summary:');
    const updatedClasses = await prisma.class.findMany({
      include: {
        classSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    for (const cls of updatedClasses) {
      const subjectNames = cls.classSubjects.map(cs => cs.subject.name).join(', ') || 'No subjects';
      console.log(`   • ${cls.name}: ${cls.studentCount} students (${subjectNames})`);
    }

    console.log('\n🎉 Student count logic updated successfully!');

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

updateStudentCountLogic()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
