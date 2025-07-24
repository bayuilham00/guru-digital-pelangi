import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVIIIBClassAPI() {
  console.log('🔍 Testing VIII B Class API...\n');
  
  try {
    // 1. Find VIII B class
    const viiiB = await prisma.class.findFirst({
      where: { name: 'VIII B' },
      include: {
        subject: true,
        classTeachers: {
          include: {
            teacher: true
          }
        },
        students: true,
        classSubjects: {
          include: {
            subject: true
          }
        },
        classTeacherSubjects: {
          include: {
            teacher: true,
            subject: true
          }
        }
      }
    });
    
    if (!viiiB) {
      console.log('❌ VIII B class not found');
      return;
    }
    
    console.log(`✅ Found VIII B class: ${viiiB.name} (ID: ${viiiB.id})`);
    console.log(`   - Students: ${viiiB.students.length}`);
    console.log(`   - Class Subjects: ${viiiB.classSubjects.length}`);
    console.log(`   - Teacher Subject Assignments: ${viiiB.classTeacherSubjects.length}`);
    
    // 2. Show detailed subject data
    console.log('\n📚 Class Subjects Details:');
    viiiB.classSubjects.forEach((cs, index) => {
      console.log(`${index + 1}. Subject: ${cs.subject.name} (${cs.subject.code})`);
      console.log(`   - Subject ID: ${cs.subject.id}`);
      console.log(`   - ClassSubject ID: ${cs.id}`);
    });
    
    // 3. Show teacher assignments
    console.log('\n👨‍🏫 Teacher Subject Assignments:');
    viiiB.classTeacherSubjects.forEach((cts, index) => {
      console.log(`${index + 1}. Teacher: ${cts.teacher.fullName}`);
      console.log(`   - Subject: ${cts.subject.name} (${cts.subject.code})`);
      console.log(`   - Teacher ID: ${cts.teacher.id}`);
      console.log(`   - Subject ID: ${cts.subject.id}`);
    });
    
    // 4. Simulate the API response structure
    console.log('\n🔌 Simulating API Response Structure:');
    
    // Group subjects with their teachers
    const subjectsWithTeachers = viiiB.classSubjects.map(cs => {
      const subjectTeachers = viiiB.classTeacherSubjects
        .filter(cts => cts.subjectId === cs.subjectId)
        .map(cts => cts.teacher);
      
      return {
        id: cs.subjectId, // This is the actual subject ID
        name: cs.subject.name,
        code: cs.subject.code,
        description: cs.subject.description,
        teachers: subjectTeachers,
        isActive: cs.isActive,
        classSubjectId: cs.id // ClassSubject relation ID
      };
    });
    
    const apiResponse = {
      message: 'Full class data retrieved successfully',
      data: {
        id: viiiB.id,
        name: viiiB.name,
        gradeLevel: viiiB.gradeLevel,
        description: viiiB.description,
        subjects: subjectsWithTeachers,
        students: viiiB.students,
        createdAt: viiiB.createdAt,
        updatedAt: viiiB.updatedAt
      },
      meta: {
        totalSubjects: subjectsWithTeachers.length,
        totalStudents: viiiB.students.length
      }
    };
    
    console.log('📋 Expected API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // 5. Test the actual API endpoint
    console.log('\n🌐 Testing actual API endpoint...');
    
    // We need a valid token - let's check if there's one in the database
    const teacher = await prisma.user.findFirst({
      where: { role: 'GURU' }
    });
    
    if (teacher) {
      console.log(`🔑 Found teacher for testing: ${teacher.fullName} (${teacher.email})`);
      console.log('   - To test API, you need to:');
      console.log('   - 1. Login with this teacher credentials');
      console.log('   - 2. Get the JWT token');
      console.log(`   - 3. Call: GET http://localhost:5000/api/classes/${viiiB.id}`);
      console.log('   - 4. With Authorization: Bearer <token>');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVIIIBClassAPI();
