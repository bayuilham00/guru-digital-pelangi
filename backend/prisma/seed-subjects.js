// Seed script untuk menambahkan mata pelajaran default
// Run: node prisma/seed-subjects.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const defaultSubjects = [
  { name: 'Matematika', code: 'MTK', description: 'Mata pelajaran Matematika' },
  { name: 'Bahasa Indonesia', code: 'BIND', description: 'Mata pelajaran Bahasa Indonesia' },
  { name: 'Bahasa Inggris', code: 'BING', description: 'Mata pelajaran Bahasa Inggris' },
  { name: 'IPA (Ilmu Pengetahuan Alam)', code: 'IPA', description: 'Mata pelajaran Ilmu Pengetahuan Alam' },
  { name: 'IPS (Ilmu Pengetahuan Sosial)', code: 'IPS', description: 'Mata pelajaran Ilmu Pengetahuan Sosial' },
  { name: 'Pendidikan Agama Islam', code: 'PAI', description: 'Mata pelajaran Pendidikan Agama Islam' },
  { name: 'Pendidikan Kewarganegaraan', code: 'PKN', description: 'Mata pelajaran Pendidikan Kewarganegaraan' },
  { name: 'Seni Budaya', code: 'SBK', description: 'Mata pelajaran Seni Budaya dan Keterampilan' },
  { name: 'Pendidikan Jasmani', code: 'PJOK', description: 'Mata pelajaran Pendidikan Jasmani, Olahraga, dan Kesehatan' },
  { name: 'Prakarya', code: 'PKY', description: 'Mata pelajaran Prakarya' },
  { name: 'Fisika', code: 'FIS', description: 'Mata pelajaran Fisika' },
  { name: 'Kimia', code: 'KIM', description: 'Mata pelajaran Kimia' },
  { name: 'Biologi', code: 'BIO', description: 'Mata pelajaran Biologi' },
  { name: 'Sejarah', code: 'SEJ', description: 'Mata pelajaran Sejarah' },
  { name: 'Geografi', code: 'GEO', description: 'Mata pelajaran Geografi' },
  { name: 'Ekonomi', code: 'EKO', description: 'Mata pelajaran Ekonomi' },
  { name: 'Sosiologi', code: 'SOS', description: 'Mata pelajaran Sosiologi' },
  { name: 'Bahasa Jawa', code: 'BJW', description: 'Mata pelajaran Bahasa Jawa' },
  { name: 'Teknologi Informasi', code: 'TIK', description: 'Mata pelajaran Teknologi Informasi dan Komunikasi' },
  { name: 'Bimbingan Konseling', code: 'BK', description: 'Bimbingan dan Konseling' }
];

async function seedSubjects() {
  console.log('🌱 Seeding subjects...');
  
  try {
    // Check if subjects already exist
    const existingSubjects = await prisma.subject.count();
    
    if (existingSubjects > 0) {
      console.log(`✅ Subjects already exist (${existingSubjects} subjects found)`);
      return;
    }

    // Create subjects
    for (const subject of defaultSubjects) {
      await prisma.subject.create({
        data: subject
      });
      console.log(`✅ Created subject: ${subject.name} (${subject.code})`);
    }

    console.log(`🎉 Successfully seeded ${defaultSubjects.length} subjects!`);
    
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSubjects()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
