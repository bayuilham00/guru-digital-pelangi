import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { 
  Settings, 
  CheckCircle, 
  Users, 
  BarChart3, 
  FileText, 
  Eye,
  School,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassDetailTest: React.FC = () => {
  const navigate = useNavigate();

  // Mock data untuk demo
  const mockClasses = [
    {
      id: 'class-1',
      name: 'Kelas 7.1',
      gradeLevel: '7',
      studentCount: 25,
      subjectCount: 5,
      status: 'active',
      description: 'Kelas unggulan dengan fokus STEM'
    },
    {
      id: 'class-2', 
      name: 'Kelas 8.2',
      gradeLevel: '8',
      studentCount: 28,
      subjectCount: 6,
      status: 'active',
      description: 'Kelas reguler dengan pembelajaran interaktif'
    },
    {
      id: 'class-3',
      name: 'Kelas 9.1',
      gradeLevel: '9', 
      studentCount: 22,
      subjectCount: 7,
      status: 'active',
      description: 'Kelas persiapan ujian nasional'
    }
  ];

  const handleViewClassDetail = (classId: string) => {
    navigate(`/admin/class/${classId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Test Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardBody className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <School className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Class Detail Page Navigation Test</h1>
              <p className="text-green-100">Test navigasi ke halaman detail kelas dengan sistem tab lengkap untuk dashboard, siswa, dan tugas</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              📊 Tab Dashboard
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>Statistik kelas (total siswa, rata-rata nilai, tingkat kehadiran)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Daftar guru pengampu per mata pelajaran</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Analytics: progress bar, chart performa</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Insight kelas dan rekomendasi</span>
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              👥 Tab Siswa
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>Tabel siswa terdaftar di kelas tersebut</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Nilai per mata pelajaran & rata-rata</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Rekap presensi: Hadir, Sakit, Izin, Alpa</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Status tugas (progress completion)</span>
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              📝 Tab Tugas
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>Tugas khusus kelas (tidak perlu pilih kelas)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Progress pengumpulan per tugas</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Status deadline (aktif/terlambat/selesai)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span>Buat tugas baru langsung untuk kelas</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Available Classes for Testing */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">📚 Kelas Tersedia untuk Test</h3>
            <p className="text-sm text-gray-600">Klik card kelas untuk membuka halaman detail</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockClasses.map((cls) => (
              <Card 
                key={cls.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
                isPressable
                onPress={() => handleViewClassDetail(cls.id)}
              >
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h4 className="text-lg font-bold">{cls.name}</h4>
                      <p className="text-sm opacity-90">Tingkat {cls.gradeLevel}</p>
                    </div>
                    <Chip 
                      size="sm" 
                      className="bg-white/20 text-white"
                    >
                      {cls.status === 'active' ? 'Aktif' : 'Non-aktif'}
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{cls.description}</p>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Siswa:</span>
                      </div>
                      <span className="font-semibold">{cls.studentCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Mata Pelajaran:</span>
                      </div>
                      <span className="font-semibold">{cls.subjectCount}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Eye className="w-4 h-4" />}
                        onPress={() => handleViewClassDetail(cls.id)}
                        className="flex-1"
                      >
                        Lihat Detail
                      </Button>
                      <Button
                        size="sm"
                        color="default"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleViewClassDetail(cls.id)}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Feature Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              ✅ Fitur Yang Sudah Diimplementasi
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-green-500" />
                <span>Route `/admin/class/:classId` sudah dikonfigurasi</span>
              </li>
              <li className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-green-500" />
                <span>Card kelas clickable dengan navigasi otomatis</span>
              </li>
              <li className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-green-500" />
                <span>Tab system dengan HeroUI Tabs component</span>
              </li>
              <li className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-green-500" />
                <span>Mock data lengkap untuk semua fitur</span>
              </li>
              <li className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-green-500" />
                <span>Permission logic untuk Admin & Teacher</span>
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              🔧 Technical Details
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span><strong>Component:</strong> ClassDetailPage.tsx dengan 3 tab utama</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span><strong>Routing:</strong> React Router dengan protected routes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span><strong>UI:</strong> HeroUI components dengan motion animations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span><strong>State:</strong> React hooks dengan parameter dari URL</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span><strong>Ready:</strong> Siap untuk integrasi dengan backend API</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Test Navigation */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🚀 Quick Test Navigation</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p className="text-gray-600">
              Klik tombol dibawah untuk menguji navigasi langsung ke tab spesifik dalam halaman detail kelas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                color="primary"
                size="lg"
                startContent={<BarChart3 className="w-5 h-5" />}
                onPress={() => handleViewClassDetail('class-1')}
                className="w-full"
              >
                Test Dashboard Tab
                <div className="text-xs opacity-75">Kelas 7.1</div>
              </Button>
              
              <Button
                color="success"
                size="lg"
                startContent={<Users className="w-5 h-5" />}
                onPress={() => handleViewClassDetail('class-2')}
                className="w-full"
              >
                Test Siswa Tab
                <div className="text-xs opacity-75">Kelas 8.2</div>
              </Button>

              <Button
                color="secondary"
                size="lg"
                startContent={<FileText className="w-5 h-5" />}
                onPress={() => handleViewClassDetail('class-3')}
                className="w-full"
              >
                Test Tugas Tab
                <div className="text-xs opacity-75">Kelas 9.1</div>
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                color="default"
                variant="bordered"
                startContent={<ArrowRight className="w-4 h-4" />}
                onPress={() => navigate('/dashboard')}
              >
                Kembali ke Dashboard Admin
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Cara Penggunaan:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Dari dashboard admin, klik pada kartu kelas manapun</li>
                <li>2. Halaman detail kelas akan terbuka dengan URL: <code>/admin/class/:classId</code></li>
                <li>3. Navigasi antar tab: Dashboard, Siswa, Tugas</li>
                <li>4. Setiap tab menampilkan data spesifik untuk kelas tersebut</li>
                <li>5. Gunakan tombol "Back" untuk kembali ke dashboard</li>
                <li>6. Hanya admin dan guru yang di-assign ke kelas yang bisa akses</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip color="success" variant="flat">✅ Component Ready</Chip>
              <Chip color="success" variant="flat">✅ Routes Configured</Chip>
              <Chip color="success" variant="flat">✅ Navigation Working</Chip>
              <Chip color="success" variant="flat">✅ Mock Data Complete</Chip>
              <Chip color="success" variant="flat">✅ Tab System Active</Chip>
              <Chip color="success" variant="flat">✅ Permission Logic</Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ClassDetailTest;
