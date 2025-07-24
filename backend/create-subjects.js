// Test script to create sample subjects
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleSubjects() {
  try {
    console.log('Creating sample subjects...');
    
    const subjects = [
      { name: 'Matematika', code: 'MTK' },
      { name: 'Bahasa Indonesia', code: 'IND' },
      { name: 'Bahasa Inggris', code: 'ENG' },
      { name: 'IPA (Sains)', code: 'IPA' },
      { name: 'IPS', code: 'IPS' },
      { name: 'Pendidikan Agama', code: 'PAI' },
      { name: 'Pendidikan Kewarganegaraan', code: 'PKN' },
      { name: 'Seni Budaya', code: 'SBK' },
      { name: 'Pendidikan Jasmani', code: 'PJOK' },
      { name: 'Prakarya', code: 'PRK' }
    ];

    for (const subject of subjects) {
      const existing = await prisma.subject.findFirst({
        where: { code: subject.code }
      });

      if (!existing) {
        await prisma.subject.create({
          data: subject
        });
        console.log(`✅ Created subject: ${subject.name} (${subject.code})`);
      } else {
        console.log(`⚠️ Subject already exists: ${subject.name} (${subject.code})`);
      }
    }

    console.log('✅ Sample subjects creation completed!');
    
    // List all subjects
    const allSubjects = await prisma.subject.findMany();
    console.log('\n📚 All subjects in database:');
    allSubjects.forEach(subject => {
      console.log(`- ${subject.name} (${subject.code})`);
    });

  } catch (error) {
    console.error('❌ Error creating subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleSubjects();
