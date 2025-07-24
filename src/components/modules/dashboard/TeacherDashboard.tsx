import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  Button,
  Tabs,
  Tab
} from '@heroui/react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardList,
  BarChart3,
  Award,
  AlertCircle
} from 'lucide-react';
import { classService } from '../../../services/classService';
import { useAuthStore } from '../../../stores/authStore';
import EmptyState from '../../common/EmptyState';

interface TeacherClass {
  id: string;
  name: string;
  gradeLevel: string;
  studentCount: number;
  subjects: {
    id: string;
    name: string;
    code: string;
  }[];
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (user?.id && user?.role === 'TEACHER') {
      loadTeacherClasses();
    }
  }, [user]);

  const loadTeacherClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classService.getTeacherClasses(user!.id);
      
      if (response.success) {
        setTeacherClasses(response.data || []);
      } else {
        console.error('Failed to load teacher classes:', response.error);
      }
    } catch (error) {
      console.error('Error loading teacher classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalStudents = () => {
    return teacherClasses.reduce((total, cls) => total + cls.studentCount, 0);
  };

  const getTotalSubjects = () => {
    const allSubjects = teacherClasses.flatMap(cls => cls.subjects);
    const uniqueSubjects = new Set(allSubjects.map(s => s.id));
    return uniqueSubjects.size;
  };

  const getSubjectColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  if (user?.role !== 'TEACHER') {
    return (
      <div className="p-6">
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Akses Terbatas</h3>
            <p className="text-gray-600">Dashboard ini khusus untuk guru.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard Guru</h1>
            <p className="text-blue-100">Selamat datang, {user?.fullName}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Siswa</p>
                  <p className="text-2xl font-bold text-blue-700">{getTotalStudents()}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Mata Pelajaran</p>
                  <p className="text-2xl font-bold text-green-700">{getTotalSubjects()}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Kelas Aktif</p>
                  <p className="text-2xl font-bold text-purple-700">{teacherClasses.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key as string)}
            className="w-full"
          >
            <Tab key="overview" title="Overview Kelas" />
            <Tab key="assignments" title="Tugas" />
            <Tab key="grades" title="Nilai" />
            <Tab key="attendance" title="Presensi" />
          </Tabs>
        </CardHeader>
        <CardBody>
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Kelas Yang Diampu</h3>
                <p className="text-sm text-gray-500">
                  Anda mengajar di {teacherClasses.length} kelas
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardBody className="p-6">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : teacherClasses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Belum Ada Kelas"
                  description="Anda belum di-assign ke kelas manapun. Hubungi admin untuk mendapatkan assignment kelas."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherClasses.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <CardHeader className={`bg-gradient-to-r ${getSubjectColor(index)} text-white p-4`}>
                          <div className="flex justify-between items-start w-full">
                            <div>
                              <h4 className="text-lg font-bold">{cls.name}</h4>
                              <p className="text-sm opacity-90">Tingkat {cls.gradeLevel}</p>
                            </div>
                            <Chip 
                              size="sm" 
                              className="bg-white/20 text-white"
                            >
                              {cls.studentCount} siswa
                            </Chip>
                          </div>
                        </CardHeader>
                        <CardBody className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                Mata Pelajaran
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cls.subjects.map((subject) => (
                                  <Chip 
                                    key={subject.id}
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                  >
                                    {subject.code}
                                  </Chip>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                              <Button
                                size="sm"
                                variant="light"
                                startContent={<ClipboardList className="w-4 h-4" />}
                                className="text-blue-600"
                              >
                                Tugas
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                startContent={<BarChart3 className="w-4 h-4" />}
                                className="text-green-600"
                              >
                                Nilai
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                startContent={<Calendar className="w-4 h-4" />}
                                className="text-purple-600"
                              >
                                Presensi
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'assignments' && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Manajemen Tugas</h3>
              <p className="text-gray-500 mb-4">
                Fitur ini akan menampilkan tugas-tugas untuk mata pelajaran yang Anda ampu.
              </p>
              <p className="text-sm text-blue-600">Coming Soon...</p>
            </div>
          )}

          {selectedTab === 'grades' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Manajemen Nilai</h3>
              <p className="text-gray-500 mb-4">
                Fitur ini akan menampilkan dan mengelola nilai siswa per mata pelajaran.
              </p>
              <p className="text-sm text-blue-600">Coming Soon...</p>
            </div>
          )}

          {selectedTab === 'attendance' && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Manajemen Presensi</h3>
              <p className="text-gray-500 mb-4">
                Fitur ini akan menampilkan dan mengelola presensi siswa per mata pelajaran.
              </p>
              <p className="text-sm text-blue-600">Coming Soon...</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
