// Teacher-specific class controller for attendance
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get classes that a teacher can manage attendance for
export const getTeacherClasses = async (req, res) => {
  try {
    const { user } = req;
    
    console.log('🎓 Getting teacher classes for attendance. Teacher ID:', user.id);
    
    if (user.role !== 'GURU') {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can access this endpoint'
      });
    }

    // Get classes where this teacher teaches (using classTeacherSubjects)
    const teacherClassSubjects = await prisma.classTeacherSubject.findMany({
      where: {
        teacherId: user.id,
        isActive: true
      },
      include: {
        class: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    console.log('📚 Found teacher-class-subject assignments:', teacherClassSubjects.length);

    // Group by class to avoid duplicates (teacher might teach multiple subjects in same class)
    const classMap = new Map();
    
    teacherClassSubjects.forEach(tcs => {
      const classId = tcs.class.id;
      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: tcs.class.id,
          name: tcs.class.name,
          gradeLevel: tcs.class.gradeLevel,
          studentCount: tcs.class._count.students,
          subjects: []
        });
      }
      
      classMap.get(classId).subjects.push({
        id: tcs.subject.id,
        name: tcs.subject.name,
        code: tcs.subject.code
      });
    });

    const classes = Array.from(classMap.values());
    
    console.log('🏫 Unique classes for teacher:', classes.length);
    classes.forEach(cls => {
      console.log(`  📝 ${cls.name} ${cls.gradeLevel} - ${cls.studentCount} students, ${cls.subjects.length} subjects`);
    });

    res.json({
      success: true,
      data: {
        classes: classes,
        pagination: {
          page: 1,
          limit: classes.length,
          total: classes.length,
          pages: 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting teacher classes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get teacher classes'
    });
  }
};
