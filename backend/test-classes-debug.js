import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testClassesData() {
  console.log('🔍 Testing classes data...\n');
  
  try {
    // 1. Get basic classes from database
    const classes = await prisma.class.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`📊 Found ${classes.length} classes in database:`);
    classes.forEach((cls, index) => {
      console.log(`\n${index + 1}. Class: "${cls.name}" (ID: ${cls.id})`);
      console.log(`   - Grade: ${cls.gradeLevel || 'Not set'}`);
      console.log(`   - Created: ${cls.createdAt.toLocaleDateString()}`);
      console.log(`   - Description: ${cls.description || 'No description'}`);
      console.log(`   - Subject ID: ${cls.subjectId || 'None'}`);
      console.log(`   - Subject Name: ${cls.subject?.name || 'No subject'}`);
      console.log(`   - Students: ${cls.students?.length || 0}`);
      console.log(`   - Teachers (old): ${cls.classTeachers?.length || 0}`);
      console.log(`   - Subjects (multi): ${cls.classSubjects?.length || 0}`);
      console.log(`   - Teacher-Subject assignments: ${cls.classTeacherSubjects?.length || 0}`);
      
      // Show multi-subject data
      if (cls.classSubjects?.length > 0) {
        console.log(`   - Multi-subject details:`);
        cls.classSubjects.forEach((cs, i) => {
          const teachersForSubject = cls.classTeacherSubjects?.filter(cts => cts.subjectId === cs.subjectId) || [];
          console.log(`     ${i + 1}. ${cs.subject.name} (${cs.subject.code}) - ${teachersForSubject.length} teachers`);
        });
      }
    });
    
    // 2. Check subjects
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
    console.log(`\n📚 Found ${subjects.length} subjects available`);
    
    // 3. Check teachers
    const teachers = await prisma.user.findMany({
      where: { role: 'GURU' },
      select: { id: true, fullName: true, email: true }
    });
    console.log(`👨‍🏫 Found ${teachers.length} teachers available`);
    
    // 4. Test API endpoint simulation
    console.log('\n🔌 Testing API logic simulation...');
    
    // Simulate what the /api/classes endpoint should return
    const apiResult = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      description: cls.description,
      subjectId: cls.subjectId,
      subject: cls.subject,
      classTeachers: cls.classTeachers,
      students: cls.students,
      studentCount: cls.students?.length || 0,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt
    }));
    
    console.log(`✅ API should return ${apiResult.length} classes`);
    console.log('Sample class data:', JSON.stringify(apiResult[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClassesData();
