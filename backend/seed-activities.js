// Seed Activities - Add sample activities to the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedActivities() {
  try {
    console.log('🌱 Starting to seed activities...');

    // Get the first user to associate activities with
    const user = await prisma.user.findFirst({
      where: { role: 'GURU' }
    });

    if (!user) {
      console.log('❌ No user found to associate activities with');
      return;
    }

    // Check if activities already exist
    const existingActivities = await prisma.activity.count();
    if (existingActivities > 0) {
      console.log('✅ Activities already exist, skipping seed');
      return;
    }

    // Sample activities
    const activities = [
      {
        type: 'GRADE',
        title: 'Nilai Ditambahkan', 
        description: 'Menambahkan nilai untuk kuis Matematika kelas 5A',
        userId: user.id
      },
      {
        type: 'XP',
        title: 'XP Diberikan',
        description: 'Memberikan 50 XP kepada siswa atas partisipasi aktif',
        userId: user.id
      },
      {
        type: 'BADGE',
        title: 'Badge Diberikan',
        description: 'Memberikan badge "Siswa Rajin" kepada 3 siswa',
        userId: user.id
      },
      {
        type: 'EXERCISE',
        title: 'Latihan Dibuat',
        description: 'Membuat latihan soal untuk materi perkalian',
        userId: user.id
      },
      {
        type: 'QUESTION',
        title: 'Pertanyaan Dijawab',
        description: 'Menjawab pertanyaan siswa tentang materi pelajaran',
        userId: user.id
      },
      {
        type: 'GRADE',
        title: 'Penilaian Completed',
        description: 'Menyelesaikan penilaian tugas harian Bahasa Indonesia',
        userId: user.id
      },
      {
        type: 'XP',
        title: 'Bonus XP',
        description: 'Memberikan bonus XP untuk kelas terdisiplin',
        userId: user.id
      }
    ];

    // Create activities
    for (const activity of activities) {
      await prisma.activity.create({
        data: {
          ...activity,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
        }
      });
    }

    console.log(`✅ Successfully seeded ${activities.length} activities`);

  } catch (error) {
    console.error('❌ Error seeding activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedActivities();
