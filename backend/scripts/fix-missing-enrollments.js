/**
 * Fix Missing Enrollments for Multi-Subject Classes
 * 
 * This script fixes missing ClassSubject relationships and student enrollments
 * for manually created classes
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixMissingEnrollments() {
  console.log('🔧 Fixing missing enrollments for multi-subject classes...\n');

  try {
    // 1. Find Bahasa Inggris subject
    const englishSubject = await prisma.subject.findFirst({
      where: {
        name: 'Bahasa Inggris'
      }
    });

    if (!englishSubject) {
      console.log('❌ Bahasa Inggris subject not found');
      return;
    }

    console.log(`✅ Found Bahasa Inggris subject: ${englishSubject.name} (ID: ${englishSubject.id})`);

    // 2. Find the new Kelas 7.1 that has no subjects
    const emptyKelas71 = await prisma.class.findFirst({
      where: {
        name: 'Kelas 7.1',
        classSubjects: { none: {} }
      },
      include: {
        students: true,
        classSubjects: true
      }
    });

    if (!emptyKelas71) {
      console.log('❌ No empty Kelas 7.1 found');
      return;
    }

    console.log(`✅ Found empty Kelas 7.1: ${emptyKelas71.name} (ID: ${emptyKelas71.id})`);
    console.log(`   • Current students: ${emptyKelas71.students.length}`);
    console.log(`   • Current subjects: ${emptyKelas71.classSubjects.length}`);

    // 3. If the new class has no students, transfer students from the original Kelas 7.1
    if (emptyKelas71.students.length === 0) {
      console.log('\n🔄 Transferring students from original Kelas 7.1...');
      
      const originalKelas71 = await prisma.class.findFirst({
        where: {
          name: 'Kelas 7.1',
          id: { not: emptyKelas71.id }
        },
        include: {
          students: true
        }
      });

      if (originalKelas71 && originalKelas71.students.length > 0) {
        console.log(`   ✅ Found original Kelas 7.1 with ${originalKelas71.students.length} students`);
        
        // Option 1: Update students to point to new class
        // Option 2: Copy students to new class
        // Let's use Option 1 - move students to the Bahasa Inggris class
        
        const updateResult = await prisma.student.updateMany({
          where: {
            classId: originalKelas71.id
          },
          data: {
            classId: emptyKelas71.id
          }
        });
        
        console.log(`   ✅ Moved ${updateResult.count} students to new Kelas 7.1`);
      }
    }

    // 4. Add Bahasa Inggris subject to the new Kelas 7.1
    console.log('\n🎯 Adding Bahasa Inggris to Kelas 7.1...');
    
    const existingClassSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId: emptyKelas71.id,
          subjectId: englishSubject.id
        }
      }
    });

    if (!existingClassSubject) {
      const newClassSubject = await prisma.classSubject.create({
        data: {
          classId: emptyKelas71.id,
          subjectId: englishSubject.id,
          isActive: true
        }
      });
      console.log(`   ✅ Created ClassSubject relationship`);
    } else {
      console.log(`   → ClassSubject relationship already exists`);
    }

    // 5. Auto-enroll all students in the class to Bahasa Inggris
    console.log('\n👥 Auto-enrolling students to Bahasa Inggris...');
    
    const studentsInClass = await prisma.student.findMany({
      where: {
        classId: emptyKelas71.id
      }
    });

    let enrollmentCount = 0;
    for (const student of studentsInClass) {
      const existingEnrollment = await prisma.studentSubjectEnrollment.findUnique({
        where: {
          studentId_classId_subjectId: {
            studentId: student.id,
            classId: emptyKelas71.id,
            subjectId: englishSubject.id
          }
        }
      });

      if (!existingEnrollment) {
        await prisma.studentSubjectEnrollment.create({
          data: {
            studentId: student.id,
            classId: emptyKelas71.id,
            subjectId: englishSubject.id,
            isActive: true
          }
        });
        enrollmentCount++;
        console.log(`   ✓ Enrolled ${student.fullName} in Bahasa Inggris`);
      } else {
        console.log(`   → ${student.fullName} already enrolled`);
      }
    }

    console.log(`\n✅ Auto-enrolled ${enrollmentCount} students to Bahasa Inggris`);

    // 6. Verification
    console.log('\n📊 Verification:');
    const updatedClass = await prisma.class.findUnique({
      where: { id: emptyKelas71.id },
      include: {
        students: true,
        classSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (updatedClass) {
      console.log(`   • Class: ${updatedClass.name}`);
      console.log(`   • Students: ${updatedClass.students.length}`);
      console.log(`   • Subjects: ${updatedClass.classSubjects.length}`);
      
      updatedClass.classSubjects.forEach(cs => {
        console.log(`     - ${cs.subject.name}`);
      });

      // Check enrollments
      const totalEnrollments = await prisma.studentSubjectEnrollment.count({
        where: {
          classId: updatedClass.id,
          isActive: true
        }
      });
      console.log(`   • Total active enrollments: ${totalEnrollments}`);
    }

    console.log('\n🎉 Fix completed successfully!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  }
}

fixMissingEnrollments()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
