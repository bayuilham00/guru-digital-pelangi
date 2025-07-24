/**
 * Merge Duplicate Classes Script
 * Combines duplicate classes with the same name into a single multi-subject class
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting merge duplicate classes process...\n');

  try {
    // Step 1: Find duplicate class names
    console.log('📝 Step 1: Finding duplicate class names...');
    
    const duplicateClassNames = await prisma.class.groupBy({
      by: ['name'],
      where: {
        isPhysicalClass: true
      },
      having: {
        name: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        name: true
      }
    });

    if (duplicateClassNames.length === 0) {
      console.log('✅ No duplicate class names found. All good!');
      return;
    }

    console.log(`Found ${duplicateClassNames.length} duplicate class name(s):`);
    duplicateClassNames.forEach(dup => {
      console.log(`   • "${dup.name}" appears ${dup._count.name} times`);
    });
    console.log('');

    // Step 2: Process each duplicate group
    for (const duplicateGroup of duplicateClassNames) {
      console.log(`🔄 Processing duplicate classes named "${duplicateGroup.name}"...`);
      
      // Get all classes with this name
      const classesWithSameName = await prisma.class.findMany({
        where: {
          name: duplicateGroup.name,
          isPhysicalClass: true
        },
        include: {
          classSubjects: {
            include: {
              subject: true
            },
            where: {
              isActive: true
            }
          },
          students: true,
          classTeachers: {
            include: {
              teacher: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc' // Keep the oldest one as primary
        }
      });

      if (classesWithSameName.length < 2) {
        console.log(`   ⚠️ Skipping "${duplicateGroup.name}" - not actually duplicate`);
        continue;
      }

      const primaryClass = classesWithSameName[0]; // Oldest class becomes primary
      const duplicateClasses = classesWithSameName.slice(1); // Rest will be merged into primary

      console.log(`   📋 Primary class: ${primaryClass.id} (created: ${primaryClass.createdAt})`);
      console.log(`   📋 Will merge ${duplicateClasses.length} duplicate class(es) into primary`);

      // Step 3: Merge subjects from duplicates into primary class
      let mergedSubjectsCount = 0;
      let mergedTeachersCount = 0;
      let transferredStudentsCount = 0;

      for (const duplicateClass of duplicateClasses) {
        console.log(`   🔄 Merging class ${duplicateClass.id}...`);

        // Merge subjects
        for (const classSubject of duplicateClass.classSubjects) {
          // Check if subject already exists in primary class
          const existingSubject = await prisma.classSubject.findUnique({
            where: {
              classId_subjectId: {
                classId: primaryClass.id,
                subjectId: classSubject.subjectId
              }
            }
          });

          if (!existingSubject) {
            await prisma.classSubject.create({
              data: {
                classId: primaryClass.id,
                subjectId: classSubject.subjectId,
                isActive: true
              }
            });
            mergedSubjectsCount++;
            console.log(`     ✓ Added subject "${classSubject.subject.name}" to primary class`);
          } else {
            console.log(`     → Subject "${classSubject.subject.name}" already exists in primary class`);
          }
        }

        // Merge teacher assignments
        const teacherAssignments = await prisma.classTeacherSubject.findMany({
          where: {
            classId: duplicateClass.id,
            isActive: true
          },
          include: {
            teacher: true,
            subject: true
          }
        });

        for (const assignment of teacherAssignments) {
          // Check if teacher assignment already exists for this subject in primary class
          const existingAssignment = await prisma.classTeacherSubject.findUnique({
            where: {
              classId_teacherId_subjectId: {
                classId: primaryClass.id,
                teacherId: assignment.teacherId,
                subjectId: assignment.subjectId
              }
            }
          });

          if (!existingAssignment) {
            await prisma.classTeacherSubject.create({
              data: {
                classId: primaryClass.id,
                teacherId: assignment.teacherId,
                subjectId: assignment.subjectId,
                isActive: true
              }
            });
            mergedTeachersCount++;
            console.log(`     ✓ Assigned teacher "${assignment.teacher.fullName}" to "${assignment.subject.name}" in primary class`);
          } else {
            console.log(`     → Teacher "${assignment.teacher.fullName}" already assigned to "${assignment.subject.name}" in primary class`);
          }
        }

        // Transfer students
        for (const student of duplicateClass.students) {
          // Update student's classId to primary class
          await prisma.student.update({
            where: { id: student.id },
            data: { classId: primaryClass.id }
          });

          // Get all subjects in primary class
          const primaryClassSubjects = await prisma.classSubject.findMany({
            where: {
              classId: primaryClass.id,
              isActive: true
            }
          });

          // Enroll student in all subjects of primary class
          for (const classSubject of primaryClassSubjects) {
            // Check if enrollment already exists
            const existingEnrollment = await prisma.studentSubjectEnrollment.findUnique({
              where: {
                studentId_classId_subjectId: {
                  studentId: student.id,
                  classId: primaryClass.id,
                  subjectId: classSubject.subjectId
                }
              }
            });

            if (!existingEnrollment) {
              await prisma.studentSubjectEnrollment.create({
                data: {
                  studentId: student.id,
                  classId: primaryClass.id,
                  subjectId: classSubject.subjectId,
                  isActive: true
                }
              });
            }
          }

          transferredStudentsCount++;
          console.log(`     ✓ Transferred student "${student.fullName}" to primary class`);
        }

        // Deactivate old enrollments from duplicate class
        await prisma.studentSubjectEnrollment.updateMany({
          where: {
            classId: duplicateClass.id
          },
          data: {
            isActive: false
          }
        });

        // Deactivate old teacher assignments
        await prisma.classTeacherSubject.updateMany({
          where: {
            classId: duplicateClass.id
          },
          data: {
            isActive: false
          }
        });

        // Deactivate old class subjects
        await prisma.classSubject.updateMany({
          where: {
            classId: duplicateClass.id
          },
          data: {
            isActive: false
          }
        });

        // Delete the duplicate class
        await prisma.class.delete({
          where: { id: duplicateClass.id }
        });

        console.log(`     ✅ Removed duplicate class ${duplicateClass.id}`);
      }

      console.log(`   📊 Merge summary for "${duplicateGroup.name}":`);
      console.log(`     • Subjects merged: ${mergedSubjectsCount}`);
      console.log(`     • Teachers merged: ${mergedTeachersCount}`);
      console.log(`     • Students transferred: ${transferredStudentsCount}`);
      console.log('');
    }

    // Step 4: Final verification
    console.log('📋 Post-merge verification:');
    const remainingDuplicates = await prisma.class.groupBy({
      by: ['name'],
      where: {
        isPhysicalClass: true
      },
      having: {
        name: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        name: true
      }
    });

    if (remainingDuplicates.length === 0) {
      console.log('✅ All duplicate classes successfully merged!');
    } else {
      console.log(`⚠️ Still have ${remainingDuplicates.length} duplicate groups remaining`);
    }

    // Show final class summary
    const allClasses = await prisma.class.findMany({
      where: {
        isPhysicalClass: true
      },
      include: {
        classSubjects: {
          include: {
            subject: true
          },
          where: {
            isActive: true
          }
        },
        students: true
      }
    });

    console.log('\n📊 Final class structure:');
    for (const cls of allClasses) {
      const subjectNames = cls.classSubjects.map(cs => cs.subject.name).join(', ');
      console.log(`   • ${cls.name}: ${cls.students.length} students (${subjectNames || 'No subjects'})`);
    }

    console.log('\n🎉 Merge operation completed successfully!');

  } catch (error) {
    console.error('❌ Merge failed:', error);
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
