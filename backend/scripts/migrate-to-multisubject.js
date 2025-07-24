import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToMultiSubject() {
  console.log('🚀 Starting migration to multi-subject structure...');
  
  try {
    // Get all existing classes with their relationships
    const existingClasses = await prisma.class.findMany({
      include: {
        subject: true,
        classTeachers: {
          include: {
            teacher: true
          }
        },
        students: true
      }
    });

    console.log(`📊 Found ${existingClasses.length} classes to migrate`);

    for (const cls of existingClasses) {
      console.log(`\n🔄 Processing class: ${cls.name}`);
      
      // If class has a subject, create or find ClassSubject entry
      if (cls.subjectId) {
        console.log(`  📚 Processing ClassSubject for subject: ${cls.subject?.name}`);
        
        // Check if ClassSubject already exists
        let classSubject = await prisma.classSubject.findUnique({
          where: {
            classId_subjectId: {
              classId: cls.id,
              subjectId: cls.subjectId
            }
          }
        });
        
        if (!classSubject) {
          classSubject = await prisma.classSubject.create({
            data: {
              classId: cls.id,
              subjectId: cls.subjectId
            }
          });
          console.log(`  ✅ ClassSubject created with ID: ${classSubject.id}`);
        } else {
          console.log(`  ⚡ ClassSubject already exists with ID: ${classSubject.id}`);
        }
        
        // Migrate teachers for this class-subject combination
        if (cls.classTeachers && cls.classTeachers.length > 0) {
          console.log(`  👨‍🏫 Processing ${cls.classTeachers.length} teachers...`);
          
          for (const classTeacher of cls.classTeachers) {
            // Check if ClassTeacherSubject already exists
            const existingCTS = await prisma.classTeacherSubject.findUnique({
              where: {
                classId_teacherId_subjectId: {
                  classId: cls.id,
                  teacherId: classTeacher.teacherId,
                  subjectId: cls.subjectId
                }
              }
            });
            
            if (!existingCTS) {
              const classTeacherSubject = await prisma.classTeacherSubject.create({
                data: {
                  classId: cls.id,
                  teacherId: classTeacher.teacherId,
                  subjectId: cls.subjectId
                }
              });
              console.log(`    ✅ Teacher ${classTeacher.teacher.fullName} assigned to class-subject`);
            } else {
              console.log(`    ⚡ Teacher ${classTeacher.teacher.fullName} already assigned to class-subject`);
            }
          }
        }
        
        // Migrate student enrollments for this class-subject combination
        if (cls.students && cls.students.length > 0) {
          console.log(`  👥 Processing ${cls.students.length} student enrollments...`);
          
          for (const student of cls.students) {
            // Check if StudentSubjectEnrollment already exists
            const existingEnrollment = await prisma.studentSubjectEnrollment.findUnique({
              where: {
                studentId_classId_subjectId: {
                  studentId: student.id,
                  classId: cls.id,
                  subjectId: cls.subjectId
                }
              }
            });
            
            if (!existingEnrollment) {
              const enrollment = await prisma.studentSubjectEnrollment.create({
                data: {
                  studentId: student.id,
                  classId: cls.id,
                  subjectId: cls.subjectId,
                  enrolledAt: student.createdAt || new Date()
                }
              });
              console.log(`    ✅ Student ${student.fullName} enrolled in class-subject`);
            } else {
              console.log(`    ⚡ Student ${student.fullName} already enrolled in class-subject`);
            }
          }
        }
      } else {
        console.log(`  ⚠️  Class ${cls.name} has no subject - skipping subject migration`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📈 Migration Summary:');
    
    const classSubjectCount = await prisma.classSubject.count();
    const classTeacherSubjectCount = await prisma.classTeacherSubject.count();
    const studentEnrollmentCount = await prisma.studentSubjectEnrollment.count();
    
    console.log(`  • ClassSubject entries: ${classSubjectCount}`);
    console.log(`  • ClassTeacherSubject entries: ${classTeacherSubjectCount}`);
    console.log(`  • StudentSubjectEnrollment entries: ${studentEnrollmentCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToMultiSubject()
  .then(() => {
    console.log('\n✨ All done! Your database is now ready for multi-subject classes.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
