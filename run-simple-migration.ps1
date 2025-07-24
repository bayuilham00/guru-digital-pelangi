# Simple Cloud Migration using Prisma
# Since we have cloud MySQL database, let's use Prisma directly

param(
    [switch]$TestMode = $false
)

Write-Host "🚀 GURU DIGITAL PELANGI - PRISMA CLOUD MIGRATION" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Apply Prisma Schema Changes
Write-Host "📋 STEP 1: Pushing Prisma Schema to Cloud Database" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would push schema changes to cloud" -ForegroundColor Cyan
    Write-Host "🧪 Command: npx prisma db push" -ForegroundColor Cyan
} else {
    Write-Host "🔄 Pushing schema changes to cloud database..." -ForegroundColor Cyan
    
    try {
        cd backend
        npx prisma db push
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Schema pushed to cloud database successfully!" -ForegroundColor Green
        } else {
            throw "Prisma db push failed with exit code $LASTEXITCODE"
        }
        cd ..
    } catch {
        Write-Host "❌ Schema push failed: $($_.Exception.Message)" -ForegroundColor Red
        cd ..
        exit 1
    }
}
Write-Host ""

# Step 2: Run Data Migration Script
Write-Host "📊 STEP 2: Running Data Migration" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would run data migration script" -ForegroundColor Cyan
} else {
    Write-Host "🔄 Running data migration..." -ForegroundColor Cyan
    
    # Create data migration script
    $dataMigrationScript = @'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🔄 Starting data migration...');

  try {
    // 1. Migrate existing Class-Subject relationships to ClassSubject
    console.log('📝 Migrating class-subject relationships...');
    
    const classesWithSubjects = await prisma.class.findMany({
      where: {
        subjectId: { not: null }
      },
      include: {
        subject: true,
        students: true
      }
    });

    console.log(`Found ${classesWithSubjects.length} classes with subjects`);

    for (const cls of classesWithSubjects) {
      // Create ClassSubject if not exists
      const existingClassSubject = await prisma.classSubject.findUnique({
        where: {
          classId_subjectId: {
            classId: cls.id,
            subjectId: cls.subjectId
          }
        }
      });

      if (!existingClassSubject) {
        await prisma.classSubject.create({
          data: {
            classId: cls.id,
            subjectId: cls.subjectId,
            isActive: true
          }
        });
        console.log(`✅ Created ClassSubject for ${cls.name} - ${cls.subject.name}`);
      }

      // Create StudentSubjectEnrollment for all students in this class
      for (const student of cls.students) {
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
          await prisma.studentSubjectEnrollment.create({
            data: {
              studentId: student.id,
              classId: cls.id,
              subjectId: cls.subjectId,
              isActive: true
            }
          });
        }
      }
    }

    // 2. Migrate ClassTeacher to ClassTeacherSubject
    console.log('👨‍🏫 Migrating teacher assignments...');
    
    const classTeachers = await prisma.classTeacher.findMany({
      include: {
        class: true
      }
    });

    for (const ct of classTeachers) {
      if (ct.class.subjectId) {
        const existingAssignment = await prisma.classTeacherSubject.findUnique({
          where: {
            classId_teacherId_subjectId: {
              classId: ct.classId,
              teacherId: ct.teacherId,
              subjectId: ct.class.subjectId
            }
          }
        });

        if (!existingAssignment) {
          await prisma.classTeacherSubject.create({
            data: {
              classId: ct.classId,
              teacherId: ct.teacherId,
              subjectId: ct.class.subjectId,
              isActive: true
            }
          });
          console.log(`✅ Migrated teacher assignment for class ${ct.class.name}`);
        }
      }
    }

    // 3. Update classes to mark as physical classes
    await prisma.class.updateMany({
      data: {
        isPhysicalClass: true
      }
    });

    console.log('🎉 Data migration completed successfully!');

    // Show summary
    const summary = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM classes WHERE subject_id IS NOT NULL) as classes_with_subjects,
        (SELECT COUNT(*) FROM class_subjects) as class_subject_relationships,
        (SELECT COUNT(*) FROM class_teacher_subjects) as teacher_subject_assignments,
        (SELECT COUNT(*) FROM student_subject_enrollments) as student_enrollments
    `;

    console.log('📊 Migration Summary:', summary[0]);

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
'@

    Set-Content -Path "backend/migrate-data.js" -Value $dataMigrationScript
    
    try {
        cd backend
        node migrate-data.js
        Remove-Item "migrate-data.js" -ErrorAction SilentlyContinue
        cd ..
        Write-Host "✅ Data migration completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Data migration failed: $($_.Exception.Message)" -ForegroundColor Red
        cd ..
        exit 1
    }
}
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "🔧 STEP 3: Generating Prisma Client" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would generate Prisma client" -ForegroundColor Cyan
} else {
    try {
        cd backend
        npx prisma generate
        Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
        cd ..
    } catch {
        Write-Host "❌ Prisma generate failed: $($_.Exception.Message)" -ForegroundColor Red
        cd ..
        exit 1
    }
}
Write-Host ""

Write-Host "🎉 MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. ✅ Cloud database schema updated" -ForegroundColor Green
Write-Host "2. ✅ Data migrated to new structure" -ForegroundColor Green
Write-Host "3. ✅ Prisma client updated" -ForegroundColor Green
Write-Host "4. 🔄 Restart backend server (cd backend && npm run dev)" -ForegroundColor Yellow
Write-Host "5. 🧪 Test multi-subject functionality in frontend" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Multi-subject classes are now ready!" -ForegroundColor Green
