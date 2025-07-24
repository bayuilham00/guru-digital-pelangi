// Create sample attendance data for testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleAttendanceData() {
  try {
    console.log('📅 Creating sample attendance data...');

    // Get Maya Sari's student ID
    const student = await prisma.student.findFirst({
      where: { studentId: '1002025004' }
    });

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('Found student:', student.fullName);

    // Create attendance records for the past 10 days
    const attendanceData = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Create mostly PRESENT with some variations
      let status = 'PRESENT';
      if (i === 2) status = 'LATE'; // One late day
      if (i === 7) status = 'SICK'; // One sick day
      
      attendanceData.push({
        studentId: student.id,
        classId: student.classId,
        date: date,
        status: status,
        notes: status === 'LATE' ? 'Terlambat 15 menit' : 
               status === 'SICK' ? 'Sakit demam' : null
      });
    }

    // Insert attendance records
    for (const record of attendanceData) {
      // Check if record already exists
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: record.studentId,
          classId: record.classId,
          date: record.date
        }
      });

      if (!existing) {
        await prisma.attendance.create({
          data: record
        });
      } else {
        console.log('Record already exists for', record.date.toISOString().split('T')[0]);
      }
    }

    console.log('✅ Created', attendanceData.length, 'attendance records');
    console.log('Records:', attendanceData.map(r => ({
      date: r.date.toISOString().split('T')[0],
      status: r.status
    })));

  } catch (error) {
    console.error('Error creating attendance data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleAttendanceData();
