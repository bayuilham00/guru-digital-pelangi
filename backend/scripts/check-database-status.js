/**
 * Check Current Database Status for Multi-Subject Classes
 * 
 * This script checks the current state of classes, subjects, and enrollments
 * to diagnose student count issues
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  console.log('🔍 Checking current database status...\n');

  try {
    // 1. Check all classes and their subjects
    console.log('📝 1. Classes and their subjects:');
    const classes = await prisma.class.findMany({
      include: {
        classSubjects: {
          include: {
            subject: true
          }
        },
        students: true
      }
    });

    for (const cls of classes) {
      console.log(`\n📋 Class: ${cls.name} (ID: ${cls.id})`);
      console.log(`   • Physical students in class: ${cls.students.length}`);
      console.log(`   • Subjects in this class: ${cls.classSubjects.length}`);
      
      for (const cs of cls.classSubjects) {
        console.log(`     - ${cs.subject.name} (${cs.subject.code}) - Active: ${cs.isActive}`);
        
        // Check enrollments for this class-subject combination
        const enrollments = await prisma.studentSubjectEnrollment.count({
          where: {
            classId: cls.id,
            subjectId: cs.subjectId,
            isActive: true
          }
        });
        console.log(`       → Students enrolled: ${enrollments}`);
      }
    }

    // 2. Check for Bahasa Inggris specifically
    console.log('\n📝 2. Bahasa Inggris specific check:');
    const englishSubject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: { contains: 'Bahasa Inggris' } },
          { name: { contains: 'English' } },
          { code: 'ENG' }
        ]
      }
    });

    if (englishSubject) {
      console.log(`   ✅ Found Bahasa Inggris subject: ${englishSubject.name} (ID: ${englishSubject.id})`);
      
      // Check which classes have this subject
      const englishClassSubjects = await prisma.classSubject.findMany({
        where: {
          subjectId: englishSubject.id
        },
        include: {
          class: true
        }
      });

      console.log(`   • Classes teaching Bahasa Inggris: ${englishClassSubjects.length}`);
      for (const ecs of englishClassSubjects) {
        console.log(`     - ${ecs.class.name}`);
        
        // Check enrollments
        const enrollments = await prisma.studentSubjectEnrollment.findMany({
          where: {
            classId: ecs.classId,
            subjectId: englishSubject.id,
            isActive: true
          },
          include: {
            student: true
          }
        });
        
        console.log(`       → Students enrolled in Bahasa Inggris: ${enrollments.length}`);
        enrollments.forEach(enrollment => {
          console.log(`         • ${enrollment.student.fullName}`);
        });
      }
    } else {
      console.log('   ❌ No Bahasa Inggris subject found');
    }

    // 3. Check Kelas 7.1 specifically
    console.log('\n📝 3. Kelas 7.1 detailed check:');
    const kelas71 = await prisma.class.findFirst({
      where: {
        name: 'Kelas 7.1'
      },
      include: {
        students: true,
        classSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (kelas71) {
      console.log(`   ✅ Found Kelas 7.1 (ID: ${kelas71.id})`);
      console.log(`   • Physical students in class: ${kelas71.students.length}`);
      console.log(`   • Subjects: ${kelas71.classSubjects.length}`);
      
      for (const cs of kelas71.classSubjects) {
        console.log(`     - ${cs.subject.name}`);
        
        const enrollments = await prisma.studentSubjectEnrollment.count({
          where: {
            classId: kelas71.id,
            subjectId: cs.subjectId,
            isActive: true
          }
        });
        console.log(`       → Enrolled students: ${enrollments}`);
      }

      // List all students in Kelas 7.1
      console.log('   • Students in Kelas 7.1:');
      kelas71.students.forEach(student => {
        console.log(`     - ${student.fullName} (${student.studentId})`);
      });

    } else {
      console.log('   ❌ Kelas 7.1 not found');
    }

    // 4. Summary statistics
    console.log('\n📊 4. Summary Statistics:');
    const totalClasses = await prisma.class.count();
    const totalClassSubjects = await prisma.classSubject.count();
    const totalEnrollments = await prisma.studentSubjectEnrollment.count();
    const totalStudents = await prisma.student.count();

    console.log(`   • Total classes: ${totalClasses}`);
    console.log(`   • Total class-subject relationships: ${totalClassSubjects}`);
    console.log(`   • Total student enrollments: ${totalEnrollments}`);
    console.log(`   • Total students: ${totalStudents}`);

    // 5. Check for missing enrollments
    console.log('\n📝 5. Missing enrollment check:');
    const studentsWithoutEnrollments = await prisma.student.findMany({
      where: {
        classId: { not: null },
        subjectEnrollments: { none: {} }
      },
      include: { class: true }
    });

    if (studentsWithoutEnrollments.length > 0) {
      console.log(`   ⚠️  Students with classes but no subject enrollments: ${studentsWithoutEnrollments.length}`);
      studentsWithoutEnrollments.forEach(student => {
        console.log(`     - ${student.fullName} in ${student.class?.name}`);
      });
    } else {
      console.log('   ✅ All students with classes have subject enrollments');
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  }
}

checkDatabaseStatus()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
