/**
 * Data Migration Script: Convert to Multi-Subject Class Management
 * 
 * This script migrates existing single-subject classes to the new multi-subject structure:
 * 1. Creates ClassSubject entries from existing Class.subjectId
 * 2. Creates ClassTeacherSubject entries from existing ClassTeacher
 * 3. Auto-enrolls existing students to all subjects in their class
 * 4. Marks existing classes as physical classes
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting data migration to multi-subject class management...\n');

  try {
    // Step 1: Update existing classes to be physical classes
    console.log('📝 Step 1: Updating existing classes...');
    const updateClassesResult = await prisma.class.updateMany({
      data: {
        isPhysicalClass: true
      }
    });
    console.log(`✅ Updated ${updateClassesResult.count} classes as physical classes\n`);

    // Step 2: Create ClassSubject entries from existing Class.subjectId
    console.log('📝 Step 2: Creating ClassSubject entries...');
    const classesWithSubjects = await prisma.class.findMany({
      where: {
        subjectId: {
          not: null
        }
      },
      select: {
        id: true,
        subjectId: true,
        name: true
      }
    });

    let classSubjectCount = 0;
    for (const classItem of classesWithSubjects) {
      // Check if ClassSubject entry already exists
      const existingClassSubject = await prisma.classSubject.findUnique({
        where: {
          classId_subjectId: {
            classId: classItem.id,
            subjectId: classItem.subjectId
          }
        }
      });

      if (!existingClassSubject) {
        await prisma.classSubject.create({
          data: {
            classId: classItem.id,
            subjectId: classItem.subjectId,
            isActive: true
          }
        });
        classSubjectCount++;
        console.log(`   ✓ Created ClassSubject for class "${classItem.name}" with subject`);
      } else {
        console.log(`   → ClassSubject already exists for class "${classItem.name}"`);
      }
    }
    console.log(`✅ Created ${classSubjectCount} new ClassSubject entries\n`);

    // Step 3: Create ClassTeacherSubject entries from existing ClassTeacher
    console.log('📝 Step 3: Creating ClassTeacherSubject entries...');
    const existingClassTeachers = await prisma.classTeacher.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subjectId: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    let classTeacherSubjectCount = 0;
    for (const classTeacher of existingClassTeachers) {
      if (classTeacher.class.subjectId) {
        // Check if ClassTeacherSubject entry already exists
        const existingClassTeacherSubject = await prisma.classTeacherSubject.findUnique({
          where: {
            classId_teacherId_subjectId: {
              classId: classTeacher.classId,
              teacherId: classTeacher.teacherId,
              subjectId: classTeacher.class.subjectId
            }
          }
        });

        if (!existingClassTeacherSubject) {
          await prisma.classTeacherSubject.create({
            data: {
              classId: classTeacher.classId,
              teacherId: classTeacher.teacherId,
              subjectId: classTeacher.class.subjectId,
              isActive: true
            }
          });
          classTeacherSubjectCount++;
          console.log(`   ✓ Created ClassTeacherSubject for teacher "${classTeacher.teacher.fullName}" in class "${classTeacher.class.name}"`);
        } else {
          console.log(`   → ClassTeacherSubject already exists for teacher "${classTeacher.teacher.fullName}" in class "${classTeacher.class.name}"`);
        }
      }
    }
    console.log(`✅ Created ${classTeacherSubjectCount} new ClassTeacherSubject entries\n`);

    // Step 4: Auto-enroll existing students to all subjects in their class
    console.log('📝 Step 4: Auto-enrolling students to class subjects...');
    const studentsWithClasses = await prisma.student.findMany({
      where: {
        classId: {
          not: null
        }
      },
      include: {
        class: {
          include: {
            classSubjects: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    let enrollmentCount = 0;
    for (const student of studentsWithClasses) {
      if (student.class && student.class.classSubjects.length > 0) {
        for (const classSubject of student.class.classSubjects) {
          // Check if enrollment already exists
          const existingEnrollment = await prisma.studentSubjectEnrollment.findUnique({
            where: {
              studentId_classId_subjectId: {
                studentId: student.id,
                classId: student.classId,
                subjectId: classSubject.subjectId
              }
            }
          });

          if (!existingEnrollment) {
            await prisma.studentSubjectEnrollment.create({
              data: {
                studentId: student.id,
                classId: student.classId,
                subjectId: classSubject.subjectId,
                isActive: true
              }
            });
            enrollmentCount++;
            console.log(`   ✓ Enrolled student "${student.fullName}" in subject (class: ${student.class.name})`);
          } else {
            console.log(`   → Student "${student.fullName}" already enrolled in subject`);
          }
        }
      }
    }
    console.log(`✅ Created ${enrollmentCount} new student enrollments\n`);

    // Step 5: Summary report
    console.log('📊 Migration Summary:');
    console.log(`   • Classes updated as physical: ${updateClassesResult.count}`);
    console.log(`   • ClassSubject entries created: ${classSubjectCount}`);
    console.log(`   • ClassTeacherSubject entries created: ${classTeacherSubjectCount}`);
    console.log(`   • Student enrollments created: ${enrollmentCount}`);

    console.log('\n🎉 Data migration completed successfully!');
    
    // Verification queries
    console.log('\n📋 Post-migration verification:');
    const totalClasses = await prisma.class.count();
    const totalClassSubjects = await prisma.classSubject.count();
    const totalClassTeacherSubjects = await prisma.classTeacherSubject.count();
    const totalEnrollments = await prisma.studentSubjectEnrollment.count();
    
    console.log(`   • Total classes: ${totalClasses}`);
    console.log(`   • Total class-subject relationships: ${totalClassSubjects}`);
    console.log(`   • Total teacher assignments: ${totalClassTeacherSubjects}`);
    console.log(`   • Total student enrollments: ${totalEnrollments}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
