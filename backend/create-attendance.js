// Create more realistic attendance data
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createRealisticAttendanceData() {
  try {
    console.log('📅 Creating realistic attendance data...');

    // Find Maya Sari
    const maya = await prisma.student.findUnique({
      where: { studentId: '1002025004' }
    });

    if (!maya) {
      console.log('❌ Maya Sari not found');
      return;
    }

    console.log('Found Maya Sari:', maya.fullName, 'ID:', maya.id);

    // Create attendance records for the past 2 weeks (10 school days)
    const attendanceData = [
      { date: '2025-07-07', status: 'PRESENT' },   // Week 1
      { date: '2025-07-08', status: 'PRESENT' },
      { date: '2025-07-09', status: 'PRESENT' },
      { date: '2025-07-10', status: 'LATE' },
      { date: '2025-07-11', status: 'PRESENT' },
      { date: '2025-07-14', status: 'PRESENT' },   // Week 2
      { date: '2025-07-15', status: 'PRESENT' },
      { date: '2025-07-16', status: 'PRESENT' },
      { date: '2025-07-17', status: 'ABSENT' },    // This one already exists
      { date: '2025-07-18', status: 'PRESENT' },
    ];

    for (const record of attendanceData) {
      const existingRecord = await prisma.attendance.findFirst({
        where: {
          studentId: maya.id,
          date: new Date(record.date)
        }
      });

      if (!existingRecord) {
        await prisma.attendance.create({
          data: {
            studentId: maya.id,
            date: new Date(record.date),
            status: record.status,
            classId: maya.classId
          }
        });
        console.log('✅ Created attendance:', record.date, '-', record.status);
      } else {
        console.log('⏭️  Skipped existing record:', record.date, '-', existingRecord.status);
      }
    }

    console.log('✅ Realistic attendance data created successfully!');

    // Check final attendance
    const allAttendance = await prisma.attendance.findMany({
      where: { studentId: maya.id },
      orderBy: { date: 'desc' }
    });

    console.log('\n📊 Final attendance records:', allAttendance.length);
    allAttendance.forEach(record => {
      console.log(`- ${record.date.toISOString().split('T')[0]}: ${record.status}`);
    });

    const totalDays = allAttendance.length;
    const presentDays = allAttendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    console.log('\n📈 Final Attendance Summary:');
    console.log('- Total days:', totalDays);
    console.log('- Present days (including late):', presentDays);
    console.log('- Attendance percentage:', attendancePercentage + '%');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createRealisticAttendanceData();
