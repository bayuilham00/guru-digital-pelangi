// Additional seed script for more Teacher Plans - Guru Digital Pelangi
// This script will add more diverse teacher plans to the database

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding more Teacher Plans...');

  try {
    // Get available subjects, classes, and teachers
    const subjects = await prisma.subject.findMany();
    const classes = await prisma.class.findMany();
    const teachers = await prisma.user.findMany({
      where: { role: 'GURU' }
    });

    // Additional teacher plans data
    const additionalPlansData = [
      {
        title: 'Integral dan Aplikasinya',
        description: 'Pembelajaran lanjutan tentang integral tak tentu, integral tentu, dan aplikasinya dalam kehidupan sehari-hari.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menghitung integral tak tentu',
            'Siswa dapat menghitung integral tentu',
            'Siswa dapat menerapkan integral untuk menghitung luas daerah'
          ]
        },
        lessonContent: {
          introduction: 'Review turunan dan hubungannya dengan integral',
          mainContent: [
            'Konsep integral sebagai anti-turunan',
            'Teknik integrasi dasar',
            'Integral tentu dan teorema dasar kalkulus',
            'Aplikasi integral untuk luas daerah'
          ],
          activities: [
            'Latihan soal integral tak tentu',
            'Menghitung luas daerah menggunakan integral',
            'Proyek aplikasi integral dalam kehidupan nyata'
          ]
        },
        assessment: {
          type: 'Ujian Tertulis dan Proyek',
          criteria: [
            'Kemampuan perhitungan (40%)',
            'Pemahaman konsep (30%)',
            'Kreativitas proyek (30%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Matematika SMA',
            'Kalkulator grafik',
            'Lembar kerja integral'
          ],
          digitalResources: [
            'Software grafik fungsi',
            'Video tutorial integral'
          ]
        },
        notes: 'Berikan banyak contoh aplikasi integral dalam bidang lain seperti fisika dan ekonomi.'
      },
      {
        title: 'Puisi Modern Indonesia',
        description: 'Analisis dan apresiasi puisi-puisi modern Indonesia dari berbagai angkatan.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat mengidentifikasi ciri-ciri puisi modern Indonesia',
            'Siswa dapat menganalisis makna puisi',
            'Siswa dapat menulis puisi dengan gaya modern'
          ]
        },
        lessonContent: {
          introduction: 'Perkembangan puisi Indonesia dari masa ke masa',
          mainContent: [
            'Karakteristik puisi modern Indonesia',
            'Tokoh-tokoh penyair modern Indonesia',
            'Analisis puisi: tema, diksi, dan gaya bahasa',
            'Teknik penulisan puisi modern'
          ],
          activities: [
            'Membaca dan menganalisis puisi Chairil Anwar',
            'Diskusi makna puisi dalam konteks sejarah',
            'Workshop menulis puisi'
          ]
        },
        assessment: {
          type: 'Analisis Puisi dan Karya Tulis',
          criteria: [
            'Ketepatan analisis (40%)',
            'Kreativitas karya tulis (35%)',
            'Kemampuan presentasi (25%)'
          ]
        },
        resources: {
          materials: [
            'Antologi puisi Indonesia modern',
            'Biografi penyair Indonesia',
            'Audio rekaman pembacaan puisi'
          ],
          digitalResources: [
            'Portal sastra digital',
            'Video dokumenter sastrawan Indonesia'
          ]
        },
        notes: 'Gunakan puisi yang sesuai dengan tingkat perkembangan siswa.'
      },
      {
        title: 'Ekosistem dan Keanekaragaman Hayati',
        description: 'Pembelajaran tentang konsep ekosistem, interaksi antar komponen, dan pentingnya keanekaragaman hayati.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menjelaskan komponen ekosistem',
            'Siswa dapat menganalisis hubungan antar komponen ekosistem',
            'Siswa dapat menjelaskan pentingnya keanekaragaman hayati'
          ]
        },
        lessonContent: {
          introduction: 'Pengertian ekosistem dan peranannya',
          mainContent: [
            'Komponen biotik dan abiotik',
            'Rantai makanan dan jaring-jaring makanan',
            'Aliran energi dalam ekosistem',
            'Keanekaragaman hayati dan konservasinya'
          ],
          activities: [
            'Observasi ekosistem di lingkungan sekolah',
            'Membuat diagram rantai makanan',
            'Proyek konservasi keanekaragaman hayati'
          ]
        },
        assessment: {
          type: 'Observasi dan Laporan Proyek',
          criteria: [
            'Ketepatan observasi (30%)',
            'Kualitas laporan (40%)',
            'Kreatifitas proyek konservasi (30%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Biologi SMA',
            'Alat observasi (lup, termometer)',
            'Lembar observasi'
          ],
          digitalResources: [
            'Aplikasi identifikasi tumbuhan',
            'Video dokumenter ekosistem'
          ]
        },
        notes: 'Manfaatkan lingkungan sekitar sekolah untuk praktik observasi langsung.'
      },
      {
        title: 'Hukum Thermodynamika',
        description: 'Pembelajaran tentang hukum-hukum thermodynamika dan aplikasinya dalam kehidupan sehari-hari.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menjelaskan hukum pertama thermodynamika',
            'Siswa dapat menjelaskan hukum kedua thermodynamika',
            'Siswa dapat menerapkan hukum thermodynamika dalam pemecahan masalah'
          ]
        },
        lessonContent: {
          introduction: 'Konsep dasar energi dan kalor',
          mainContent: [
            'Hukum pertama thermodynamika',
            'Hukum kedua thermodynamika',
            'Entropi dan arah proses alamiah',
            'Aplikasi dalam mesin kalor'
          ],
          activities: [
            'Eksperimen sederhana hukum pertama',
            'Analisis efisiensi mesin kalor',
            'Diskusi aplikasi dalam teknologi'
          ]
        },
        assessment: {
          type: 'Ujian Tertulis dan Laporan Eksperimen',
          criteria: [
            'Pemahaman konsep (35%)',
            'Kemampuan problem solving (40%)',
            'Kualitas laporan eksperimen (25%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Fisika SMA',
            'Alat eksperimen kalor',
            'Termometer'
          ],
          digitalResources: [
            'Simulasi thermodynamika',
            'Video eksperimen virtual'
          ]
        },
        notes: 'Tekankan pada aplikasi konsep dalam teknologi modern.'
      },
      {
        title: 'Sistem Perbankan dan Keuangan',
        description: 'Pembelajaran tentang peran bank, sistem pembayaran, dan literasi keuangan.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menjelaskan fungsi dan peran bank',
            'Siswa dapat memahami sistem pembayaran modern',
            'Siswa dapat menerapkan prinsip literasi keuangan'
          ]
        },
        lessonContent: {
          introduction: 'Pentingnya sistem keuangan dalam perekonomian',
          mainContent: [
            'Fungsi dan jenis bank',
            'Produk dan layanan perbankan',
            'Sistem pembayaran digital',
            'Literasi keuangan dan perencanaan keuangan'
          ],
          activities: [
            'Kunjungan ke bank atau simulasi transaksi',
            'Membuat rencana keuangan pribadi',
            'Presentasi produk perbankan'
          ]
        },
        assessment: {
          type: 'Studi Kasus dan Proyek Perencanaan Keuangan',
          criteria: [
            'Pemahaman konsep (30%)',
            'Kemampuan analisis (35%)',
            'Kualitas perencanaan keuangan (35%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Ekonomi SMA',
            'Brosur produk perbankan',
            'Contoh rekening koran'
          ],
          digitalResources: [
            'Aplikasi mobile banking',
            'Website simulator investasi'
          ]
        },
        notes: 'Gunakan contoh nyata dari dunia perbankan Indonesia.'
      },
      {
        title: 'Kemerdekaan Indonesia',
        description: 'Pembelajaran tentang proses kemerdekaan Indonesia dan tokoh-tokoh yang berperan.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat menjelaskan proses kemerdekaan Indonesia',
            'Siswa dapat mengidentifikasi peran tokoh kemerdekaan',
            'Siswa dapat menganalisis makna kemerdekaan'
          ]
        },
        lessonContent: {
          introduction: 'Kondisi Indonesia menjelang kemerdekaan',
          mainContent: [
            'Persiapan kemerdekaan Indonesia',
            'Proklamasi 17 Agustus 1945',
            'Tokoh-tokoh kemerdekaan',
            'Perjuangan mempertahankan kemerdekaan'
          ],
          activities: [
            'Analisis teks proklamasi',
            'Presentasi biografi tokoh kemerdekaan',
            'Diskusi makna kemerdekaan bagi generasi muda'
          ]
        },
        assessment: {
          type: 'Ujian Tertulis dan Presentasi',
          criteria: [
            'Pemahaman kronologi (30%)',
            'Analisis peran tokoh (35%)',
            'Kemampuan presentasi (35%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Sejarah Indonesia',
            'Dokumentasi foto kemerdekaan',
            'Biografi tokoh kemerdekaan'
          ],
          digitalResources: [
            'Video dokumenter kemerdekaan',
            'Museum virtual kemerdekaan'
          ]
        },
        notes: 'Kaitkan dengan semangat nasionalisme dan cinta tanah air.'
      },
      {
        title: 'Interaksi Sosial dan Konflik',
        description: 'Pembelajaran tentang bentuk-bentuk interaksi sosial dan penyelesaian konflik.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat mengidentifikasi bentuk-bentuk interaksi sosial',
            'Siswa dapat menganalisis penyebab konflik sosial',
            'Siswa dapat menjelaskan cara penyelesaian konflik'
          ]
        },
        lessonContent: {
          introduction: 'Manusia sebagai makhluk sosial',
          mainContent: [
            'Bentuk-bentuk interaksi sosial',
            'Faktor-faktor interaksi sosial',
            'Konflik sosial dan penyebabnya',
            'Cara penyelesaian konflik'
          ],
          activities: [
            'Observasi interaksi sosial di lingkungan sekolah',
            'Studi kasus konflik sosial',
            'Role play penyelesaian konflik'
          ]
        },
        assessment: {
          type: 'Observasi dan Studi Kasus',
          criteria: [
            'Ketepatan observasi (30%)',
            'Analisis studi kasus (40%)',
            'Kemampuan role play (30%)'
          ]
        },
        resources: {
          materials: [
            'Buku teks Sosiologi SMA',
            'Artikel kasus konflik sosial',
            'Lembar observasi'
          ],
          digitalResources: [
            'Video dokumenter konflik sosial',
            'Portal berita online'
          ]
        },
        notes: 'Pilih kasus yang sesuai dengan konteks lokal dan nasional.'
      },
      {
        title: 'Seni Rupa Kontemporer Indonesia',
        description: 'Apresiasi dan analisis karya seni rupa kontemporer Indonesia.',
        duration: 90,
        learningObjectives: {
          objectives: [
            'Siswa dapat mengidentifikasi ciri seni rupa kontemporer',
            'Siswa dapat menganalisis karya seni rupa Indonesia',
            'Siswa dapat membuat karya seni sederhana'
          ]
        },
        lessonContent: {
          introduction: 'Perkembangan seni rupa Indonesia',
          mainContent: [
            'Karakteristik seni rupa kontemporer',
            'Seniman rupa kontemporer Indonesia',
            'Analisis karya seni rupa',
            'Teknik berkarya seni rupa'
          ],
          activities: [
            'Apresiasi karya seni rupa melalui gambar',
            'Diskusi tentang makna karya seni',
            'Praktik membuat karya seni sederhana'
          ]
        },
        assessment: {
          type: 'Karya Seni dan Presentasi',
          criteria: [
            'Kualitas karya seni (40%)',
            'Kreativitas (35%)',
            'Kemampuan presentasi (25%)'
          ]
        },
        resources: {
          materials: [
            'Buku seni budaya SMA',
            'Alat gambar dan lukis',
            'Reproduksi karya seni'
          ],
          digitalResources: [
            'Galeri seni virtual',
            'Video tutorial teknik seni'
          ]
        },
        notes: 'Berikan kesempatan siswa untuk mengekspresikan kreativitas mereka.'
      }
    ];

    // Create additional teacher plans
    const createdPlans = [];
    
    for (let i = 0; i < additionalPlansData.length; i++) {
      const planData = additionalPlansData[i];
      
      // Get random subject, class, and teacher
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      
      // Generate random scheduled date (next 45 days)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 45));
      
      // Random status with more variety
      const statuses = ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'];
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

    console.log(`\n🎉 Successfully seeded ${createdPlans.length} additional teacher plans!`);
    
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`- Additional Plans Created: ${createdPlans.length}`);
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

    // Get total count
    const totalPlans = await prisma.teacherPlan.count();
    console.log(`\n📚 Total teacher plans in database: ${totalPlans}`);

  } catch (error) {
    console.error('❌ Error seeding additional teacher plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
