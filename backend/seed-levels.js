// Seed levels script
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedLevels() {
  try {
    // Clear existing levels
    await prisma.level.deleteMany({});
    console.log('Cleared existing levels');

    // Insert new levels
    const levels = [
      { level: 1, name: 'Pemula', xpRequired: 0, benefits: 'Akses dasar ke semua fitur' },
      { level: 2, name: 'Berkembang', xpRequired: 100, benefits: 'Akses ke quiz tambahan' },
      { level: 3, name: 'Mahir', xpRequired: 300, benefits: 'Akses ke materi advanced' },
      { level: 4, name: 'Ahli', xpRequired: 600, benefits: 'Akses ke proyek khusus' },
      { level: 5, name: 'Master', xpRequired: 1000, benefits: 'Akses ke semua fitur premium' },
      { level: 6, name: 'Grandmaster', xpRequired: 1500, benefits: 'Akses mentor untuk siswa lain' },
      { level: 7, name: 'Legend', xpRequired: 2200, benefits: 'Akses ke kompetisi eksklusif' },
      { level: 8, name: 'Mythic', xpRequired: 3000, benefits: 'Akses ke program beasiswa' },
      { level: 9, name: 'Divine', xpRequired: 4000, benefits: 'Akses ke universitas partner' },
      { level: 10, name: 'Immortal', xpRequired: 5500, benefits: 'Status legend sekolah' }
    ];

    for (const levelData of levels) {
      await prisma.level.create({ data: levelData });
      console.log(`Created level ${levelData.level}: ${levelData.name}`);
    }

    console.log('All levels seeded successfully!');
  } catch (error) {
    console.error('Error seeding levels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLevels();
