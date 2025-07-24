/**
 * Data Validation Script: Multi-Subject Class Management
 * 
 * This script validates the migration results and verifies data integrity
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function validateMigration() {
  console.log('🔍 Starting data validation for multi-subject class management...\n');

  try {
    // 1. Validate all students are properly enrolled
    console.log('📝 Validation 1: Student Enrollments');
    const studentsWithClasses = await prisma.student.findMany({
      where: {
        classId: { not: null }
      },
      include: {
        class: true,
        subjectEnrollments: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log(`   • Found ${studentsWithClasses.length} students with classes`);
    
    for (const student of studentsWithClasses) {
      const enrollmentCount = student.subjectEnrollments.length;
      console.log(`   • ${student.fullName} (${student.class.name}): ${enrollmentCount} subject(s) enrolled`);
      
      if (enrollmentCount === 0) {
        console.log(`   ⚠️  WARNING: ${student.fullName} has no subject enrollments!`);
      }
    }

    // 2. Validate all teachers are properly assigned
    console.log('\n📝 Validation 2: Teacher Assignments');
    const teachersWithAssignments = await prisma.user.findMany({
      where: {
        role: 'GURU',
        classTeacherSubjects: {
          some: {}
        }
      },
      include: {
        classTeacherSubjects: {
          include: {
            class: true,
            subject: true
          }
        }
      }
    });

    console.log(`   • Found ${teachersWithAssignments.length} teachers with assignments`);
    
    for (const teacher of teachersWithAssignments) {
      const assignmentCount = teacher.classTeacherSubjects.length;
      console.log(`   • ${teacher.fullName}: ${assignmentCount} class-subject assignment(s)`);
      
      teacher.classTeacherSubjects.forEach(assignment => {
        console.log(`     - ${assignment.class.name} → ${assignment.subject.name}`);
      });
    }

    // 3. Validate ClassSubject relationships
    console.log('\n📝 Validation 3: Class-Subject Relationships');
    const classSubjects = await prisma.classSubject.findMany({
      include: {
        class: true,
        subject: true
      }
    });

    console.log(`   • Found ${classSubjects.length} class-subject relationships`);
    
    for (const cs of classSubjects) {
      console.log(`   • ${cs.class.name} ↔ ${cs.subject.name} (Active: ${cs.isActive})`);
    }

    // 4. Check for orphaned data
    console.log('\n📝 Validation 4: Data Integrity Check');
    
    // Students without enrollments but with classes
    const studentsWithoutEnrollments = await prisma.student.findMany({
      where: {
        classId: { not: null },
        subjectEnrollments: { none: {} }
      },
      include: { class: true }
    });

    if (studentsWithoutEnrollments.length > 0) {
      console.log(`   ⚠️  WARNING: ${studentsWithoutEnrollments.length} students with classes but no subject enrollments:`);
      studentsWithoutEnrollments.forEach(student => {
        console.log(`     - ${student.fullName} in ${student.class.name}`);
      });
    } else {
      console.log(`   ✅ All students with classes have subject enrollments`);
    }

    // Classes without subjects
    const classesWithoutSubjects = await prisma.class.findMany({
      where: {
        classSubjects: { none: {} }
      }
    });

    if (classesWithoutSubjects.length > 0) {
      console.log(`   ⚠️  WARNING: ${classesWithoutSubjects.length} classes without subjects:`);
      classesWithoutSubjects.forEach(cls => {
        console.log(`     - ${cls.name}`);
      });
    } else {
      console.log(`   ✅ All classes have at least one subject`);
    }

    // 5. Summary statistics
    console.log('\n📊 Migration Summary Statistics:');
    
    const totalClasses = await prisma.class.count();
    const totalSubjects = await prisma.subject.count();
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.user.count({ where: { role: 'GURU' } });
    
    const totalClassSubjects = await prisma.classSubject.count();
    const totalTeacherAssignments = await prisma.classTeacherSubject.count();
    const totalEnrollments = await prisma.studentSubjectEnrollment.count();
    
    console.log(`   • Total Classes: ${totalClasses}`);
    console.log(`   • Total Subjects: ${totalSubjects}`);
    console.log(`   • Total Students: ${totalStudents}`);
    console.log(`   • Total Teachers: ${totalTeachers}`);
    console.log(`   • Class-Subject Relationships: ${totalClassSubjects}`);
    console.log(`   • Teacher Assignments: ${totalTeacherAssignments}`);
    console.log(`   • Student Enrollments: ${totalEnrollments}`);

    // 6. Test multi-subject functionality
    console.log('\n📝 Validation 5: Multi-Subject Functionality Test');
    
    // Find a class with multiple subjects (if any)
    const classWithMultipleSubjects = await prisma.class.findFirst({
      where: {
        classSubjects: {
          some: {}
        }
      },
      include: {
        classSubjects: {
          include: {
            subject: true
          }
        },
        students: true
      }
    });

    if (classWithMultipleSubjects) {
      console.log(`   • Testing class: ${classWithMultipleSubjects.name}`);
      console.log(`   • Subjects in this class: ${classWithMultipleSubjects.classSubjects.length}`);
      
      classWithMultipleSubjects.classSubjects.forEach(cs => {
        console.log(`     - ${cs.subject.name}`);
      });
      
      console.log(`   • Students in this class: ${classWithMultipleSubjects.students.length}`);
      
      // Check if students are enrolled in all subjects
      for (const student of classWithMultipleSubjects.students) {
        const enrollments = await prisma.studentSubjectEnrollment.count({
          where: {
            studentId: student.id,
            classId: classWithMultipleSubjects.id
          }
        });
        
        console.log(`     • ${student.fullName}: enrolled in ${enrollments}/${classWithMultipleSubjects.classSubjects.length} subjects`);
      }
    }

    console.log('\n🎉 Data validation completed!');
    
    // Return validation results
    return {
      success: true,
      studentsWithoutEnrollments: studentsWithoutEnrollments.length,
      classesWithoutSubjects: classesWithoutSubjects.length,
      totalStats: {
        classes: totalClasses,
        subjects: totalSubjects,
        students: totalStudents,
        teachers: totalTeachers,
        classSubjects: totalClassSubjects,
        teacherAssignments: totalTeacherAssignments,
        enrollments: totalEnrollments
      }
    };

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

validateMigration()
  .then(async (result) => {
    if (result.success) {
      console.log('\n✅ Migration validation: SUCCESS');
      if (result.studentsWithoutEnrollments === 0 && result.classesWithoutSubjects === 0) {
        console.log('✅ No data integrity issues found');
      } else {
        console.log('⚠️  Some data integrity issues found - please review');
      }
    } else {
      console.log('\n❌ Migration validation: FAILED');
      console.log('Error:', result.error);
    }
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
