import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTeacherClassAssignments() {
  try {
    console.log('📋 Checking teacher-class assignments...');
    
    const teachers = await prisma.teacher.findMany({
      include: {
        classTeachers: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                gradeLevel: true
              }
            }
          }
        }
      }
    });
    
    console.log('👨‍🏫 Found', teachers.length, 'teachers');
    teachers.forEach(teacher => {
      console.log('👤', teacher.fullName, '(', teacher.email, ') - Classes assigned:', teacher.classTeachers.length);
      teacher.classTeachers.forEach(ct => {
        console.log('  📚', ct.class.name, ct.class.gradeLevel);
      });
    });

    const allClassTeachers = await prisma.classTeacher.findMany({
      include: {
        teacher: { select: { fullName: true, email: true } },
        class: { select: { name: true } }
      }
    });
    
    console.log('\n📚 Total class-teacher assignments:', allClassTeachers.length);
    allClassTeachers.forEach(ct => {
      console.log('👥', ct.teacher.fullName, '(', ct.teacher.email, ') →', ct.class.name);
    });

    // Check all classes
    const allClasses = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        gradeLevel: true,
        _count: {
          select: { classTeachers: true, students: true }
        }
      }
    });

    console.log('\n🏫 All classes in system:');
    allClasses.forEach(cls => {
      console.log('📝', cls.name, cls.gradeLevel, '- Teachers:', cls._count.classTeachers, 'Students:', cls._count.students);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeacherClassAssignments();
