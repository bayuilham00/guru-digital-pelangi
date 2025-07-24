// Test script untuk membuat test data subject-based attendance
// Run: node create-subject-attendance-data.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSubjectAttendanceData() {
  try {
    console.log('🔍 Creating subject-based attendance test data...');

    // 1. Get Maya Sari (test student)
    const student = await prisma.student.findFirst({
      where: {
        fullName: 'Maya Sari'
      },
      include: {
        class: true
      }
    });

    if (!student) {
      console.log('❌ Student Maya Sari not found');
      return;
    }

    console.log('👩‍🎓 Found student:', student.fullName, 'in class:', student.class?.name);

    // 2. Get available subjects
    const subjects = await prisma.subject.findMany({
      take: 3, // Take first 3 subjects for testing
      select: {
        id: true,
        name: true,
        code: true
      }
    });

    if (subjects.length === 0) {
      console.log('❌ No subjects found');
      return;
    }

    console.log('📚 Found subjects:', subjects.map(s => `${s.name} (${s.code})`).join(', '));

    // 3. Create subject-based attendance records for July 2025
    const attendanceRecords = [];
    const startDate = new Date('2025-07-15'); // Start from July 15
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Create attendance for each subject on this date
      for (const subject of subjects) {
        const status = Math.random() > 0.1 ? 'PRESENT' : 'ABSENT'; // 90% attendance rate
        
        attendanceRecords.push({
          studentId: student.id,
          classId: student.classId,
          subjectId: subject.id, // NEW: Subject-based attendance
          date: date,
          status: status,
          notes: status === 'ABSENT' ? 'Izin keluarga' : null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    console.log('📝 Creating', attendanceRecords.length, 'subject-based attendance records...');

    // 4. Insert attendance records
    const createdRecords = await prisma.attendance.createMany({
      data: attendanceRecords,
      skipDuplicates: true // Skip if already exists
    });

    console.log('✅ Created', createdRecords.count, 'attendance records');

    // 5. Verify data
    const totalRecords = await prisma.attendance.count({
      where: {
        studentId: student.id,
        subjectId: { not: null }
      }
    });

    console.log('📊 Total subject-based attendance records for', student.fullName + ':', totalRecords);

    // 6. Show sample data
    const sampleRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        subjectId: { not: null }
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      },
      take: 5,
      orderBy: { date: 'desc' }
    });

    console.log('📋 Sample records:');
    sampleRecords.forEach(record => {
      console.log(`  ${record.date.toISOString().split('T')[0]} - ${record.subject.name} (${record.subject.code}): ${record.status}`);
    });

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSubjectAttendanceData();
