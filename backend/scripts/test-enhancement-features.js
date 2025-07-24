/**
 * Test Script: Assignment & Grade Management Enhancement
 * Tests the new approval system, assignment management, and grade management
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testEnhancementFeatures() {
  console.log('🧪 Testing Assignment & Grade Management Enhancement...\n');

  try {
    // Test 1: Approval System Simulation
    console.log('📝 Test 1: Approval System Simulation');
    
    // Check existing approval requests
    const pendingApprovals = await prisma.enrollmentApproval.findMany({
      where: { status: 'PENDING' },
      include: {
        student: { select: { fullName: true } },
        class: { select: { name: true } },
        subject: { select: { name: true } }
      }
    });

    console.log(`   • Found ${pendingApprovals.length} pending approval requests`);
    
    if (pendingApprovals.length > 0) {
      pendingApprovals.slice(0, 3).forEach(approval => {
        console.log(`     - ${approval.student.fullName}: ${approval.class.name} - ${approval.subject.name}`);
      });
    } else {
      console.log(`     → No pending approvals found`);
    }

    // Check approval history
    const allApprovals = await prisma.enrollmentApproval.count();
    const approvedCount = await prisma.enrollmentApproval.count({
      where: { status: 'APPROVED' }
    });
    const rejectedCount = await prisma.enrollmentApproval.count({
      where: { status: 'REJECTED' }
    });

    console.log(`   • Total approvals: ${allApprovals}`);
    console.log(`   • Approved: ${approvedCount}, Rejected: ${rejectedCount}, Pending: ${pendingApprovals.length}`);

    // Test 2: Assignment Management Simulation
    console.log('\n📝 Test 2: Assignment Management Simulation');
    
    // Get assignments by teacher
    const assignments = await prisma.assignment.findMany({
      where: { isActive: true },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        teacher: { select: { fullName: true } },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      take: 5
    });

    console.log(`   • Found ${assignments.length} active assignments:`);
    assignments.forEach(assignment => {
      console.log(`     - "${assignment.title}" by ${assignment.teacher.fullName}`);
      console.log(`       Class: ${assignment.class.name}, Subject: ${assignment.subject.code}`);
      console.log(`       Due: ${assignment.dueDate.toLocaleDateString()}, Max Points: ${assignment.maxPoints}`);
      console.log(`       Submissions: ${assignment._count.submissions}`);
    });

    // Check submissions statistics
    const submissionStats = await prisma.submission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log(`   • Submission Statistics:`);
    submissionStats.forEach(stat => {
      console.log(`     - ${stat.status}: ${stat._count.status} submissions`);
    });

    // Test 3: Grade Management Analysis
    console.log('\n📝 Test 3: Grade Management Analysis');
    
    // Get grades by subject
    const gradesBySubject = await prisma.grade.groupBy({
      by: ['subjectId'],
      _avg: {
        value: true
      },
      _count: {
        value: true
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    console.log(`   • Grade averages by subject:`);
    for (const gradeData of gradesBySubject) {
      const subject = await prisma.subject.findUnique({
        where: { id: gradeData.subjectId },
        select: { name: true, code: true }
      });
      
      console.log(`     - ${subject.name} (${subject.code}): ${Math.round(gradeData._avg.value * 100) / 100} avg (${gradeData._count.value} grades)`);
    }

    // Grade distribution analysis
    const gradeDistribution = await prisma.grade.groupBy({
      by: ['gradeType'],
      _avg: {
        value: true
      },
      _count: {
        value: true
      }
    });

    console.log(`   • Grade distribution by type:`);
    gradeDistribution.forEach(dist => {
      console.log(`     - ${dist.gradeType}: ${Math.round(dist._avg.value * 100) / 100} avg (${dist._count.value} total)`);
    });

    // Test 4: Student Performance Analysis
    console.log('\n📝 Test 4: Student Performance Analysis');
    
    // Get students with multiple subjects
    const studentsWithGrades = await prisma.student.findMany({
      where: {
        grades: {
          some: {}
        }
      },
      include: {
        grades: {
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            }
          }
        },
        class: {
          select: {
            name: true
          }
        }
      },
      take: 3
    });

    console.log(`   • Student performance analysis (top 3):`);
    studentsWithGrades.forEach(student => {
      const subjectGrades = student.grades.reduce((acc, grade) => {
        const subjectKey = grade.subject.code;
        if (!acc[subjectKey]) acc[subjectKey] = [];
        acc[subjectKey].push(grade.value);
        return acc;
      }, {});

      const subjectAverages = Object.keys(subjectGrades).map(subjectCode => {
        const grades = subjectGrades[subjectCode];
        const avg = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
        return { subject: subjectCode, average: Math.round(avg * 100) / 100 };
      });

      const overallAverage = subjectAverages.length > 0
        ? subjectAverages.reduce((sum, subj) => sum + subj.average, 0) / subjectAverages.length
        : 0;

      console.log(`     - ${student.fullName} (${student.class.name}):`);
      console.log(`       Overall Average: ${Math.round(overallAverage * 100) / 100}`);
      subjectAverages.forEach(subj => {
        console.log(`       ${subj.subject}: ${subj.average}`);
      });
    });

    // Test 5: Teacher Workload Analysis
    console.log('\n📝 Test 5: Teacher Workload Analysis');
    
    // Analyze teacher workload
    const teacherWorkload = await prisma.user.findMany({
      where: { role: 'GURU' },
      include: {
        classTeacherSubjects: {
          where: { isActive: true },
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true, code: true } }
          }
        },
        assignments: {
          where: { isActive: true }
        },
        gradedSubmissions: true
      }
    });

    console.log(`   • Teacher workload analysis:`);
    teacherWorkload.forEach(teacher => {
      const classCount = new Set(teacher.classTeacherSubjects.map(cts => cts.classId)).size;
      const subjectCount = new Set(teacher.classTeacherSubjects.map(cts => cts.subjectId)).size;
      
      console.log(`     - ${teacher.fullName}:`);
      console.log(`       Classes: ${classCount}, Subjects: ${subjectCount}`);
      console.log(`       Assignments: ${teacher.assignments.length}, Graded: ${teacher.gradedSubmissions.length}`);
      
      // Show class-subject combinations
      teacher.classTeacherSubjects.slice(0, 3).forEach(cts => {
        console.log(`       • ${cts.class.name} - ${cts.subject.code}`);
      });
      if (teacher.classTeacherSubjects.length > 3) {
        console.log(`       ... and ${teacher.classTeacherSubjects.length - 3} more`);
      }
    });

    // Test 6: System Health Check
    console.log('\n📝 Test 6: System Health Check');
    
    const healthStats = {
      totalClasses: await prisma.class.count(),
      totalSubjects: await prisma.subject.count(),
      totalStudents: await prisma.student.count(),
      totalTeachers: await prisma.user.count({ where: { role: 'GURU' } }),
      totalAssignments: await prisma.assignment.count({ where: { isActive: true } }),
      totalGrades: await prisma.grade.count(),
      totalEnrollments: await prisma.studentSubjectEnrollment.count({ where: { isActive: true } }),
      totalApprovals: await prisma.enrollmentApproval.count()
    };

    console.log(`   • System Statistics:`);
    Object.entries(healthStats).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`     - ${label}: ${value}`);
    });

    // Data consistency checks
    const consistencyChecks = {
      classesWithoutSubjects: await prisma.class.count({
        where: {
          classSubjects: {
            none: {}
          }
        }
      }),
      studentsWithoutEnrollments: await prisma.student.count({
        where: {
          subjectEnrollments: {
            none: {}
          }
        }
      }),
      assignmentsWithoutSubmissions: await prisma.assignment.count({
        where: {
          submissions: {
            none: {}
          },
          isActive: true
        }
      })
    };

    console.log(`   • Data Consistency:`);
    Object.entries(consistencyChecks).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const status = value === 0 ? '✅' : '⚠️';
      console.log(`     ${status} ${label}: ${value}`);
    });

    console.log('\n🎉 All enhancement tests completed successfully!');

  } catch (error) {
    console.error('❌ Enhancement test failed:', error);
    throw error;
  }
}

async function main() {
  await testEnhancementFeatures();
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
