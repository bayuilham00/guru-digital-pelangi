// Check existing attendance data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAttendanceData() {
  try {
    console.log('📅 Checking existing attendance data...');

    // Get Maya Sari's student ID
    const student = await prisma.student.findFirst({
      where: { studentId: '1002025004' }
    });

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('Found student:', student.fullName, 'ID:', student.id);

    // Get all attendance records for this student
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' }
    });

    console.log('\n📊 Existing attendance records:', attendanceRecords.length);
    attendanceRecords.forEach(record => {
      console.log(`- ${record.date.toISOString().split('T')[0]}: ${record.status}`);
    });

    // Calculate attendance percentage
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => 
      ['PRESENT', 'LATE'].includes(r.status)
    ).length;
    const attendancePercentage = totalDays > 0 ? 
      Math.round((presentDays / totalDays) * 100) : 0;

    console.log('\n📈 Attendance Summary:');
    console.log(`- Total days: ${totalDays}`);
    console.log(`- Present days (including late): ${presentDays}`);
    console.log(`- Attendance percentage: ${attendancePercentage}%`);

  } catch (error) {
    console.error('Error checking attendance data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendanceData();
