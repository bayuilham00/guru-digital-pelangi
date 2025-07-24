// Seed script for Teacher Plans - Guru Digital Pelangi
// This script will populate the database with sample teacher plans

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Teacher Plans...');

  try {
    // First, get available subjects, classes, and teachers
    const subjects = await prisma.subject.findMany();
    const classes = await prisma.class.findMany();
    const teachers = await prisma.user.findMany({
      where: { role: 'GURU' }
    });

    console.log(`📚 Found ${subjects.length} subjects`);
    console.log(`🏫 Found ${classes.length} classes`);
    console.log(`👨‍🏫 Found ${teachers.length} teachers`);

    if (subjects.length === 0 || classes.length === 0 || teachers.length === 0) {
      console.log('❌ Missing required data. Please seed subjects, classes, and teachers first.');
      return;
    }

    // Sample teacher plans data
    const teacherPlansData = [
      {
        title: 'Pengenalan Aljabar Linear',
        description: 'Pembelajaran dasar tentang konsep aljabar linear, matriks, dan sistem persamaan linear.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat memahami konsep dasar aljabar linear',
            'Siswa dapat menyelesaikan sistem persamaan linear',
            'Siswa dapat melakukan operasi matriks'
          ]
        },
        lessonContent: {
          introduction: 'Pengenalan konsep aljabar linear dalam matematika',
          mainContent: [
            'Definisi dan konsep dasar aljabar linear',
            'Sistem persamaan linear',
            'Operasi matriks',
            'Determinan dan invers matriks'
          ],
          activities: [
            'Diskusi kelompok tentang aplikasi aljabar linear',
            'Latihan soal sistem persamaan linear',
            'Praktik operasi matriks'
          ]
        },
        assessment: {
          type: 'Ujian Tertulis',
          criteria: [
            'Pemahaman konsep (30%)',
            'Kemampuan menyelesaikan soal (50%)',
            'Partisipasi dalam diskusi (20%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Matematika SMA',
            'Papan tulis dan spidol',
            'Kalkulator',
            'Worksheet latihan'
          ],
          digitalResources: [
            'Video pembelajaran aljabar linear',
            'Aplikasi kalkulator matriks online'
          ]
        },
        notes: 'Pastikan siswa membawa kalkulator untuk latihan perhitungan matriks.'
      },
      {
        title: 'Teks Eksposisi dalam Bahasa Indonesia',
        description: 'Pembelajaran tentang struktur, ciri-ciri, dan cara menulis teks eksposisi yang baik.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat mengidentifikasi struktur teks eksposisi',
            'Siswa dapat menganalisis ciri-ciri teks eksposisi',
            'Siswa dapat menulis teks eksposisi dengan benar'
          ]
        },
        lessonContent: {
          introduction: 'Pengenalan jenis-jenis teks dalam bahasa Indonesia',
          mainContent: [
            'Definisi dan fungsi teks eksposisi',
            'Struktur teks eksposisi (tesis, argumen, penegasan ulang)',
            'Ciri-ciri kebahasaan teks eksposisi',
            'Contoh-contoh teks eksposisi'
          ],
          activities: [
            'Membaca dan menganalisis contoh teks eksposisi',
            'Identifikasi struktur teks eksposisi',
            'Menulis teks eksposisi sederhana'
          ]
        },
        assessment: {
          type: 'Tugas Menulis',
          criteria: [
            'Kelengkapan struktur (25%)',
            'Kesesuaian isi dengan tema (25%)',
            'Penggunaan bahasa (25%)',
            'Kreativitas (25%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Bahasa Indonesia',
            'Contoh artikel dari koran/majalah',
            'Lembar kerja siswa'
          ],
          digitalResources: [
            'Video tutorial menulis teks eksposisi',
            'Artikel online sebagai referensi'
          ]
        },
        notes: 'Berikan contoh teks eksposisi yang menarik dan relevan dengan kehidupan siswa.'
      },
      {
        title: 'Sistem Reproduksi Manusia',
        description: 'Pembelajaran tentang anatomi, fisiologi, dan kesehatan sistem reproduksi manusia.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menjelaskan struktur sistem reproduksi pria dan wanita',
            'Siswa dapat memahami proses reproduksi manusia',
            'Siswa dapat menjelaskan pentingnya kesehatan reproduksi'
          ]
        },
        lessonContent: {
          introduction: 'Pengenalan sistem organ manusia',
          mainContent: [
            'Anatomi sistem reproduksi pria',
            'Anatomi sistem reproduksi wanita',
            'Proses gametogenesis',
            'Fertilisasi dan perkembangan embrio',
            'Kesehatan reproduksi'
          ],
          activities: [
            'Observasi gambar anatomi sistem reproduksi',
            'Diskusi tentang kesehatan reproduksi',
            'Presentasi kelompok tentang penyakit reproduksi'
          ]
        },
        assessment: {
          type: 'Ujian Lisan dan Tertulis',
          criteria: [
            'Pemahaman anatomi (30%)',
            'Penjelasan proses reproduksi (40%)',
            'Kesadaran kesehatan reproduksi (30%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Biologi SMA',
            'Model anatomi sistem reproduksi',
            'Gambar dan diagram'
          ],
          digitalResources: [
            'Video animasi proses reproduksi',
            'Aplikasi anatomi 3D'
          ]
        },
        notes: 'Sampaikan materi dengan sensitif dan profesional, fokus pada aspek edukatif.'
      },
      {
        title: 'Newton\'s Laws of Motion',
        description: 'Comprehensive study of Newton\'s three laws of motion and their applications.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Students can state Newton\'s three laws of motion',
            'Students can apply Newton\'s laws to solve problems',
            'Students can relate Newton\'s laws to everyday phenomena'
          ]
        },
        lessonContent: {
          introduction: 'Review of basic concepts in mechanics',
          mainContent: [
            'Newton\'s First Law (Law of Inertia)',
            'Newton\'s Second Law (F = ma)',
            'Newton\'s Third Law (Action-Reaction)',
            'Applications in daily life',
            'Problem-solving techniques'
          ],
          activities: [
            'Demonstration of inertia using objects',
            'Calculating forces using F = ma',
            'Identifying action-reaction pairs'
          ]
        },
        assessment: {
          type: 'Problem-solving Test',
          criteria: [
            'Understanding of concepts (40%)',
            'Problem-solving accuracy (40%)',
            'Application to real situations (20%)'
          ]
        },
        resources: {
          materials: [
            'Physics textbook',
            'Demonstration materials',
            'Calculator',
            'Worksheet problems'
          ],
          digitalResources: [
            'Physics simulation software',
            'Online problem bank'
          ]
        },
        notes: 'Use practical demonstrations to make abstract concepts concrete.'
      },
      {
        title: 'Sistem Ekonomi dan Pasar',
        description: 'Pembelajaran tentang berbagai sistem ekonomi dan mekanisme pasar dalam perekonomian.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat membedakan sistem ekonomi tradisional, komando, dan pasar',
            'Siswa dapat menjelaskan mekanisme pasar',
            'Siswa dapat menganalisis kelebihan dan kekurangan setiap sistem ekonomi'
          ]
        },
        lessonContent: {
          introduction: 'Pengenalan konsep dasar ekonomi',
          mainContent: [
            'Sistem ekonomi tradisional',
            'Sistem ekonomi komando/terpusat',
            'Sistem ekonomi pasar/liberal',
            'Sistem ekonomi campuran',
            'Mekanisme pasar: permintaan dan penawaran'
          ],
          activities: [
            'Analisis kasus sistem ekonomi di berbagai negara',
            'Simulasi pasar sederhana',
            'Debat tentang sistem ekonomi terbaik'
          ]
        },
        assessment: {
          type: 'Studi Kasus',
          criteria: [
            'Pemahaman konsep (30%)',
            'Kemampuan analisis (40%)',
            'Argumentasi (30%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Ekonomi SMA',
            'Artikel ekonomi terkini',
            'Data statistik ekonomi'
          ],
          digitalResources: [
            'Video dokumenter sistem ekonomi',
            'Website data ekonomi Indonesia'
          ]
        },
        notes: 'Gunakan contoh nyata dari perekonomian Indonesia untuk mempermudah pemahaman.'
      },
      {
        title: 'Revolusi Industri dan Dampaknya',
        description: 'Pembelajaran tentang proses, karakteristik, dan dampak Revolusi Industri terhadap kehidupan manusia.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menjelaskan latar belakang Revolusi Industri',
            'Siswa dapat mengidentifikasi karakteristik Revolusi Industri',
            'Siswa dapat menganalisis dampak Revolusi Industri'
          ]
        },
        lessonContent: {
          introduction: 'Kondisi Eropa sebelum Revolusi Industri',
          mainContent: [
            'Latar belakang Revolusi Industri',
            'Penemuan-penemuan teknologi penting',
            'Perubahan sistem produksi',
            'Dampak sosial dan ekonomi',
            'Revolusi Industri di berbagai negara'
          ],
          activities: [
            'Analisis gambar kondisi sebelum dan sesudah Revolusi Industri',
            'Presentasi tentang tokoh-tokoh penting',
            'Diskusi dampak positif dan negatif'
          ]
        },
        assessment: {
          type: 'Ujian Tertulis dan Presentasi',
          criteria: [
            'Pemahaman kronologi (25%)',
            'Analisis sebab-akibat (35%)',
            'Kemampuan presentasi (40%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Sejarah SMA',
            'Gambar dan ilustrasi historis',
            'Peta Eropa abad 18-19'
          ],
          digitalResources: [
            'Video dokumenter Revolusi Industri',
            'Timeline interaktif online'
          ]
        },
        notes: 'Kaitkan dengan perkembangan teknologi modern untuk membuat pembelajaran lebih relevan.'
      }
    ];

    // Create teacher plans
    const createdPlans = [];
    
    for (let i = 0; i < teacherPlansData.length; i++) {
      const planData = teacherPlansData[i];
      
      // Get random subject, class, and teacher
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      // Generate random scheduled date (next 30 days)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30));
      
      // Random status
      const statuses = ['DRAFT', 'PUBLISHED', 'COMPLETED'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      try {
        const teacherPlan = await prisma.teacherPlan.create({
          data: {
            title: planData.title,
            description: planData.description,
            classId: randomClass.id,
            subjectId: randomSubject.id,
            teacherId: randomTeacher.id,
            scheduledDate: scheduledDate,
            duration: planData.duration,
            learningObjectives: planData.learningObjectives,
            lessonContent: planData.lessonContent,
            assessment: planData.assessment,
            resources: planData.resources,
            notes: planData.notes,
            status: randomStatus
          }
        });
        
        createdPlans.push(teacherPlan);
        console.log(`✅ Created teacher plan: ${teacherPlan.title}`);
      } catch (error) {
        console.error(`❌ Error creating teacher plan: ${planData.title}`, error.message);
      }
    }

    console.log(`\n🎉 Successfully seeded ${createdPlans.length} teacher plans!`);
    
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`- Total Plans Created: ${createdPlans.length}`);
    console.log(`- Subjects Used: ${[...new Set(createdPlans.map(p => p.subjectId))].length}`);
    console.log(`- Classes Used: ${[...new Set(createdPlans.map(p => p.classId))].length}`);
    console.log(`- Teachers Used: ${[...new Set(createdPlans.map(p => p.teacherId))].length}`);
    
    // Show status distribution
    const statusCount = createdPlans.reduce((acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Status Distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`- ${status}: ${count} plans`);
    });

  } catch (error) {
    console.error('❌ Error seeding teacher plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
