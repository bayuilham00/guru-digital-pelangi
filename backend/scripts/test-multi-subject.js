/**
 * Manual Test: Add New Subject to Existing Class
 * 
 * Test script to verify multi-subject functionality by adding a new subject
 * to an existing class and auto-enrolling all students
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testAddSubjectToClass() {
  console.log('🧪 Testing: Add new subject to existing class...\n');

  try {
    // Find Kelas 7.1
    const targetClass = await prisma.class.findFirst({
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
      }
    });

    if (!targetClass) {
      console.log('❌ Kelas 7.1 not found');
      return;
    }

    console.log(`📝 Target Class: ${targetClass.name}`);
    console.log(`   Current subjects: ${targetClass.classSubjects.length}`);
    targetClass.classSubjects.forEach(cs => {
      console.log(`   - ${cs.subject.name}`);
    });
    console.log(`   Students in class: ${targetClass.students.length}`);

    // Find a subject that's not yet in this class
    const allSubjects = await prisma.subject.findMany();
    const currentSubjectIds = targetClass.classSubjects.map(cs => cs.subjectId);
    const availableSubjects = allSubjects.filter(s => !currentSubjectIds.includes(s.id));

    if (availableSubjects.length === 0) {
      console.log('❌ No available subjects to add');
      return;
    }

    // Let's add "Bahasa Indonesia" or first available subject
    const subjectToAdd = availableSubjects.find(s => s.name === 'Bahasa Indonesia') || availableSubjects[0];
    
    console.log(`\n🎯 Adding subject: ${subjectToAdd.name} to ${targetClass.name}`);

    // Step 1: Create ClassSubject relationship
    const newClassSubject = await prisma.classSubject.create({
      data: {
        classId: targetClass.id,
        subjectId: subjectToAdd.id,
        isActive: true
      }
    });
    console.log(`✅ Created ClassSubject relationship`);

    // Step 2: Auto-enroll all students in the class to this new subject
    let enrollmentCount = 0;
    for (const student of targetClass.students) {
      const enrollment = await prisma.studentSubjectEnrollment.create({
        data: {
          studentId: student.id,
          classId: targetClass.id,
          subjectId: subjectToAdd.id,
          isActive: true
        }
      });
      enrollmentCount++;
      console.log(`   ✓ Auto-enrolled ${student.fullName} in ${subjectToAdd.name}`);
    }

    console.log(`\n✅ Successfully added ${subjectToAdd.name} to ${targetClass.name}`);
    console.log(`   • ${enrollmentCount} students auto-enrolled`);

    // Verification: Check the class now has multiple subjects
    const updatedClass = await prisma.class.findUnique({
      where: { id: targetClass.id },
      include: {
        classSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log(`\n📊 Verification - ${updatedClass.name} now has:`);
    updatedClass.classSubjects.forEach(cs => {
      console.log(`   • ${cs.subject.name} (Active: ${cs.isActive})`);
    });

    // Test: Can we find teachers for different subjects in same class?
    const teacherAssignments = await prisma.classTeacherSubject.findMany({
      where: {
        classId: targetClass.id
      },
      include: {
        teacher: true,
        subject: true
      }
    });

    console.log(`\n👥 Teacher assignments for ${targetClass.name}:`);
    if (teacherAssignments.length > 0) {
      teacherAssignments.forEach(assignment => {
        console.log(`   • ${assignment.teacher.fullName} → ${assignment.subject.name}`);
      });
    } else {
      console.log(`   • No teacher assignments yet for new subject`);
    }

    console.log('\n🎉 Multi-subject test completed successfully!');
    console.log(`✅ ${targetClass.name} now supports multiple subjects`);
    console.log(`✅ Students auto-enrolled in new subjects`);
    console.log(`✅ Multi-subject class management is working!`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testAddSubjectToClass()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
