/**
 * Investigate Duplicate Kelas 7.1 Issue
 * 
 * This script investigates why there are multiple Kelas 7.1 with different subjects
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function investigateDuplicateClasses() {
  console.log('🕵️‍♂️ Investigating duplicate Kelas 7.1 issue...\n');

  try {
    // 1. Find all classes named "Kelas 7.1"
    console.log('📝 1. All classes named "Kelas 7.1":');
    const kelas71Classes = await prisma.class.findMany({
      where: {
        name: 'Kelas 7.1'
      },
      include: {
        classSubjects: {
          include: {
            subject: true
          }
        },
        students: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`   Found ${kelas71Classes.length} classes named "Kelas 7.1"`);
    
    for (let i = 0; i < kelas71Classes.length; i++) {
      const cls = kelas71Classes[i];
      console.log(`\n   📋 Kelas 7.1 #${i + 1}:`);
      console.log(`       ID: ${cls.id}`);
      console.log(`       Created: ${cls.createdAt}`);
      console.log(`       Physical Class: ${cls.isPhysicalClass}`);
      console.log(`       Students: ${cls.students.length}`);
      console.log(`       Student Count: ${cls.studentCount}`);
      console.log(`       Subjects: ${cls.classSubjects.length}`);
      
      cls.classSubjects.forEach((cs, index) => {
        console.log(`         ${index + 1}. ${cs.subject.name} (${cs.subject.code})`);
      });

      if (cls.students.length > 0) {
        console.log(`       Student names:`);
        cls.students.slice(0, 3).forEach(student => {
          console.log(`         - ${student.fullName}`);
        });
        if (cls.students.length > 3) {
          console.log(`         ... and ${cls.students.length - 3} more`);
        }
      }
    }

    // 2. Check the logic difference
    console.log('\n📝 2. Logic Analysis:');
    
    if (kelas71Classes.length >= 2) {
      const class1 = kelas71Classes[0];
      const class2 = kelas71Classes[1];
      
      console.log('\n   🔍 Comparison:');
      console.log(`   Class 1 (${class1.id}):`);
      console.log(`     - Created: ${class1.createdAt}`);
      console.log(`     - Subjects: ${class1.classSubjects.map(cs => cs.subject.name).join(', ')}`);
      console.log(`     - Students: ${class1.students.length}`);
      
      console.log(`   Class 2 (${class2.id}):`);
      console.log(`     - Created: ${class2.createdAt}`);
      console.log(`     - Subjects: ${class2.classSubjects.map(cs => cs.subject.name).join(', ')}`);
      console.log(`     - Students: ${class2.students.length}`);

      // Check if students are the same
      const class1StudentIds = new Set(class1.students.map(s => s.id));
      const class2StudentIds = new Set(class2.students.map(s => s.id));
      
      const sameStudents = class1StudentIds.size === class2StudentIds.size && 
                          [...class1StudentIds].every(id => class2StudentIds.has(id));
      
      console.log(`     - Same students: ${sameStudents}`);
    }

    // 3. Check what should be the correct structure
    console.log('\n📝 3. Recommended Structure:');
    console.log('   In a proper multi-subject system, there should be:');
    console.log('   ✅ ONE physical "Kelas 7.1"');
    console.log('   ✅ Multiple subjects within that class');
    console.log('   ❌ NOT multiple classes with same name');

    // 4. Proposed solution
    console.log('\n💡 4. Proposed Solution:');
    console.log('   Option A: Merge classes - combine all subjects into one class');
    console.log('   Option B: Rename classes - make them distinct (e.g., "Kelas 7.1-A", "Kelas 7.1-B")');
    console.log('   Option C: Keep separate but clarify purpose');

    if (kelas71Classes.length >= 2) {
      const oldClass = kelas71Classes[0]; // Older one with multiple subjects
      const newClass = kelas71Classes[1]; // Newer one with single subject
      
      console.log('\n   🎯 Recommended: Merge into one class');
      console.log(`   • Keep: ${oldClass.id} (older, has ${oldClass.classSubjects.length} subjects)`);
      console.log(`   • Add Bahasa Inggris to the older class`);
      console.log(`   • Remove: ${newClass.id} (newer, duplicate)`);
      console.log(`   • Result: One "Kelas 7.1" with 3 subjects (PKN + BI + ENG)`);
    }

    console.log('\n🤔 What would you prefer to do?');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
    throw error;
  }
}

investigateDuplicateClasses()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
