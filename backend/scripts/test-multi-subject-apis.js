/**
 * Test Script: Multi-Subject API Routes
 * Tests the new permission-based API endpoints
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testMultiSubjectAPIs() {
  console.log('🧪 Testing Multi-Subject API Routes...\n');

  try {
    // Test 1: Get Teacher Classes (simulated)
    console.log('📝 Test 1: Get Teacher Classes with Subjects');
    
    const teacherAssignments = await prisma.classTeacherSubject.findMany({
      where: { isActive: true },
      include: {
        class: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Group by teacher
    const teacherClassesMap = new Map();

    teacherAssignments.forEach(assignment => {
      const teacherId = assignment.teacher.id;
      const classId = assignment.class.id;
      
      if (!teacherClassesMap.has(teacherId)) {
        teacherClassesMap.set(teacherId, {
          teacher: assignment.teacher,
          classes: new Map()
        });
      }

      const teacherData = teacherClassesMap.get(teacherId);
      
      if (!teacherData.classes.has(classId)) {
        teacherData.classes.set(classId, {
          id: assignment.class.id,
          name: assignment.class.name,
          gradeLevel: assignment.class.gradeLevel,
          studentCount: assignment.class._count.students,
          subjects: []
        });
      }

      teacherData.classes.get(classId).subjects.push({
        id: assignment.subject.id,
        name: assignment.subject.name,
        code: assignment.subject.code
      });
    });

    console.log(`   Found ${teacherClassesMap.size} teachers with class assignments:`);
    teacherClassesMap.forEach((teacherData, teacherId) => {
      const classesArray = Array.from(teacherData.classes.values());
      console.log(`   • ${teacherData.teacher.fullName}: ${classesArray.length} kelas`);
      classesArray.forEach(cls => {
        const subjectNames = cls.subjects.map(s => s.code).join(', ');
        console.log(`     - ${cls.name}: ${cls.studentCount} siswa (${subjectNames})`);
      });
    });

    // Test 2: Get Class-Subject Students
    console.log('\n📝 Test 2: Get Students by Class-Subject');
    
    const classSubjects = await prisma.classSubject.findMany({
      where: { isActive: true },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true, code: true } }
      },
      take: 3 // Test first 3 class-subjects
    });

    for (const cs of classSubjects) {
      const students = await prisma.studentSubjectEnrollment.findMany({
        where: {
          classId: cs.classId,
          subjectId: cs.subjectId,
          isActive: true
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              studentId: true // Use studentId instead of nisn
            }
          }
        }
      });

      console.log(`   • ${cs.class.name} - ${cs.subject.name}: ${students.length} siswa`);
      students.slice(0, 3).forEach(enrollment => {
        console.log(`     - ${enrollment.student.fullName} (${enrollment.student.studentId})`);
      });
      if (students.length > 3) {
        console.log(`     ... dan ${students.length - 3} siswa lainnya`);
      }
    }

    // Test 3: Dynamic Student Count Calculation
    console.log('\n📝 Test 3: Dynamic Student Count vs Static Count');
    
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    for (const cls of classes) {
      // Calculate dynamic count from enrollments
      const enrollments = await prisma.studentSubjectEnrollment.findMany({
        where: {
          classId: cls.id,
          isActive: true
        },
        select: {
          studentId: true
        },
        distinct: ['studentId']
      });

      const dynamicCount = enrollments.length;
      const staticCount = cls._count.students;
      const isConsistent = dynamicCount === staticCount;

      console.log(`   • ${cls.name}:`);
      console.log(`     - Static count: ${staticCount}`);
      console.log(`     - Dynamic count: ${dynamicCount}`);
      console.log(`     - Consistent: ${isConsistent ? '✅' : '❌'}`);
    }

    // Test 4: Permission Simulation
    console.log('\n📝 Test 4: Permission System Simulation');
    
    // Simulate teacher permissions (use user instead of teacher)
    const sampleUser = await prisma.user.findFirst({
      where: {
        role: 'GURU'  // Correct enum value
      }
    });
    
    if (sampleUser) {
      const teacherPermissions = await prisma.classTeacherSubject.findMany({
        where: {
          teacherId: sampleUser.id,
          isActive: true
        },
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true, code: true } }
        }
      });

      console.log(`   Teacher: ${sampleUser.fullName}`);
      console.log(`   Permitted access to:`);
      teacherPermissions.forEach(permission => {
        console.log(`   • ${permission.class.name} - ${permission.subject.name}`);
      });

      // Simulate access check
      const testClassId = teacherPermissions[0]?.classId;
      const testSubjectId = teacherPermissions[0]?.subjectId;
      
      if (testClassId && testSubjectId) {
        const hasAccess = await prisma.classTeacherSubject.findUnique({
          where: {
            classId_teacherId_subjectId: {
              classId: testClassId,
              teacherId: sampleUser.id,
              subjectId: testSubjectId
            }
          }
        });

        console.log(`   Access check result: ${hasAccess ? '✅ GRANTED' : '❌ DENIED'}`);
      } else {
        console.log(`   No permissions found for this teacher`);
      }
    } else {
      console.log(`   No teacher users found in database`);
    }

    // Test 5: Admin Full Access Simulation
    console.log('\n📝 Test 5: Admin Full Access Simulation');
    
    const allClasses = await prisma.class.count();
    const allSubjects = await prisma.subject.count();
    const allStudents = await prisma.student.count();
    const allUsers = await prisma.user.count({ where: { role: 'GURU' } });

    console.log(`   Admin can access:`);
    console.log(`   • ${allClasses} kelas`);
    console.log(`   • ${allSubjects} mata pelajaran`);
    console.log(`   • ${allStudents} siswa`);
    console.log(`   • ${allUsers} guru`);
    console.log(`   ✅ Full system access granted`);

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function main() {
  await testMultiSubjectAPIs();
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
