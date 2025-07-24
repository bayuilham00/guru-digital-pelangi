import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Progress,
  Tab,
  Tabs,
  Select,
  SelectItem
} from '@heroui/react';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { classService } from '../services/classService';
import { Class, Student } from '../services/types';
import { useAuthStore } from '../stores/authStore';

interface ClassDetail extends Class {
  students?: Student[];
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    teachers?: Array<{
      id: string;
      fullName: string;
      email: string;
    }>;
  }>;
}

const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubjectForGrades, setSelectedSubjectForGrades] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [teacherAssignments, setTeacherAssignments] = useState<{[subjectId: string]: string[]}>({});
  const [availableTeachers, setAvailableTeachers] = useState<Array<{id: string; fullName: string; email: string}>>([]);

  // Helper function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    console.log('🔧 Getting auth token:', token ? 'Found' : 'Not found');
    return token;
  };

  // Helper function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper function to sort students
  const getSortedStudents = () => {
    if (!classDetail?.students || !sortField) {
      return classDetail?.students || [];
    }

    const sorted = [...classDetail.students].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'name': {
          aValue = a.fullName?.toLowerCase() || '';
          bValue = b.fullName?.toLowerCase() || '';
          break;
        }
        case 'nisn': {
          aValue = a.studentId || '';
          bValue = b.studentId || '';
          break;
        }
        case 'average': {
          // Calculate average for sorting - consistent with display logic
          const getGradeForSubject = (studentId: string, subjectId: string) => {
            // Use consistent seed for same student-subject combination
            const seed = studentId.length + subjectId.length;
            return Math.floor((seed * 37) % 40) + 60;
          };
          
          if (user?.role === 'ADMIN') {
            if (selectedSubjectForGrades === 'all') {
              const aGrades = classDetail.subjects?.map(subject => getGradeForSubject(a.id, subject.id)) || [];
              const bGrades = classDetail.subjects?.map(subject => getGradeForSubject(b.id, subject.id)) || [];
              aValue = aGrades.length > 0 ? aGrades.reduce((sum, grade) => sum + grade, 0) / aGrades.length : 0;
              bValue = bGrades.length > 0 ? bGrades.reduce((sum, grade) => sum + grade, 0) / bGrades.length : 0;
            } else {
              aValue = getGradeForSubject(a.id, selectedSubjectForGrades);
              bValue = getGradeForSubject(b.id, selectedSubjectForGrades);
            }
          } else {
            // For teachers
            const teacherSubjects = classDetail.subjects?.filter(subject => 
              subject.teachers?.some(teacher => teacher.id === user?.id)
            ) || [];
            const aGrades = teacherSubjects.map(subject => getGradeForSubject(a.id, subject.id));
            const bGrades = teacherSubjects.map(subject => getGradeForSubject(b.id, subject.id));
            aValue = aGrades.length > 0 ? aGrades.reduce((sum, grade) => sum + grade, 0) / aGrades.length : 0;
            bValue = bGrades.length > 0 ? bGrades.reduce((sum, grade) => sum + grade, 0) / bGrades.length : 0;
          }
          break;
        }
        default: {
          // Handle individual subject sorting
          const isSubjectId = classDetail.subjects?.some(subject => subject.id === sortField);
          if (isSubjectId) {
            const getGradeForSubject = (studentId: string, subjectId: string) => {
              const seed = studentId.length + subjectId.length;
              return Math.floor((seed * 37) % 40) + 60;
            };
            aValue = getGradeForSubject(a.id, sortField);
            bValue = getGradeForSubject(b.id, sortField);
          } else {
            return 0;
          }
          break;
        }
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  useEffect(() => {
    if (id) {
      loadClassDetail(id);
      loadAvailableTeachers();
    }
  }, [id]);

  // Initialize teacher assignments when class detail loads
  useEffect(() => {
    if (classDetail?.subjects) {
      const assignments: {[subjectId: string]: string[]} = {};
      classDetail.subjects.forEach(subject => {
        assignments[subject.id] = subject.teachers?.map(t => t.id) || [];
      });
      setTeacherAssignments(assignments);
    }
  }, [classDetail]);

  const loadAvailableTeachers = async () => {
    try {
      // Mock data - replace with real API call
      const mockTeachers = [
        { id: 'teacher1', fullName: 'Dr. Ahmad Rahman', email: 'ahmad.rahman@school.edu' },
        { id: 'teacher2', fullName: 'Prof. Siti Nurhaliza', email: 'siti.nurhaliza@school.edu' },
        { id: 'teacher3', fullName: 'Ir. Budi Santoso', email: 'budi.santoso@school.edu' },
        { id: 'teacher4', fullName: 'Dra. Maya Sari', email: 'maya.sari@school.edu' },
        { id: 'teacher5', fullName: 'M.Pd. Rini Handayani', email: 'rini.handayani@school.edu' },
      ];
      setAvailableTeachers(mockTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleTeacherAssignment = (subjectId: string, teacherIds: string[]) => {
    setTeacherAssignments(prev => ({
      ...prev,
      [subjectId]: teacherIds
    }));
    
    // Update the classDetail state to reflect the changes immediately
    if (classDetail) {
      const updatedSubjects = classDetail.subjects?.map(subject => {
        if (subject.id === subjectId) {
          const assignedTeachers = availableTeachers.filter(teacher => 
            teacherIds.includes(teacher.id)
          );
          return {
            ...subject,
            teachers: assignedTeachers
          };
        }
        return subject;
      });
      
      setClassDetail({
        ...classDetail,
        subjects: updatedSubjects
      });
    }
    
    // Auto-save the assignment (you can also add a manual save button)
    saveTeacherAssignment(subjectId, teacherIds);
  };

  const saveTeacherAssignment = async (subjectId: string, teacherIds: string[]) => {
    try {
      console.log('💾 Saving teacher assignment:', { subjectId, teacherIds });
      // TODO: Replace with actual API call
      // await classService.assignTeachers(id, subjectId, teacherIds);
      
      // Mock success
      console.log('✅ Teacher assignment saved successfully');
    } catch (error) {
      console.error('❌ Error saving teacher assignment:', error);
      // You might want to show a toast notification here
    }
  };

  const loadClassDetail = async (classId: string) => {
    try {
      setLoading(true);
      console.log('🔧 Loading class detail for classId:', classId);
      
      // Use the enhanced classService method for real backend integration
      const response = await classService.getClassDetail(classId);
      console.log('🔧 Class detail response:', response);
      
      if (response.success && response.data) {
        console.log('🔧 Setting class detail data:', response.data);
        console.log('🔧 Subjects in class detail:', response.data.subjects);
        console.log('🔧 Students in class detail:', response.data.students);
        console.log('🔧 Subjects length:', response.data.subjects?.length || 0);
        console.log('🔧 Students length:', response.data.students?.length || 0);
        
        // Log each subject
        if (response.data.subjects) {
          response.data.subjects.forEach((subject, index) => {
            console.log(`🔧 Subject ${index + 1}:`, {
              id: subject.id,
              name: subject.name,
              code: subject.code,
              teachers: subject.teachers
            });
          });
        }
        
        // Add missing properties to students for compatibility
        const processedData = {
          ...response.data,
          students: response.data.students?.map((student: { 
            id: string; 
            fullName: string; 
            email: string;
            studentId?: string;
            status?: string;
            [key: string]: unknown;
          }, index: number) => ({
            ...student,
            studentId: student.studentId || `NISN${String(index + 1).padStart(3, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            status: (student.status as 'ACTIVE' | 'INACTIVE' | 'GRADUATED') || 'ACTIVE'
          })) || [],
          subjects: response.data.subjects?.map((subject: {
            id: string;
            name: string;
            code: string;
            teachers: Array<{ id: string; fullName: string; email?: string; }>;
          }) => ({
            ...subject,
            teachers: subject.teachers?.map(teacher => ({
              ...teacher,
              email: teacher.email || `${teacher.fullName.toLowerCase().replace(/\s+/g, '.')}@school.edu`
            }))
          })) || []
        };
        
        setClassDetail(processedData);
      } else {
        console.error('Failed to load class detail:', response.error);
      }
    } catch (error) {
      console.error('Error loading class detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Memuat detail kelas...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Kelas Tidak Ditemukan</h1>
          <p className="mb-4">Kelas dengan ID tersebut tidak dapat ditemukan.</p>
          <Button color="primary" onPress={() => navigate('/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Debug logging saat render
  console.log('🔧 === ClassDetailPage Render Debug ===');
  console.log('🔧 classDetail state:', classDetail);
  console.log('🔧 classDetail.subjects:', classDetail.subjects);
  console.log('🔧 classDetail.students:', classDetail.students);
  console.log('🔧 ======================================');

  const gradientColors = [
    'from-cyan-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-teal-500',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-purple-500'
  ];

  const getGradientColor = () => {
    return gradientColors[Math.floor(Math.random() * gradientColors.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => navigate('/dashboard')}
            className="text-white mb-4"
          >
            Kembali ke Dashboard
          </Button>
          
          <Card className={`bg-gradient-to-r ${getGradientColor()} border-0`}>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full text-white">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{classDetail.name}</h1>
                  
                  {/* Multi-subject display - Using classDetail.subjects directly */}
                  {classDetail.subjects && classDetail.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {classDetail.subjects.slice(0, 3).map((subject, index) => (
                        <Chip 
                          key={subject.id} 
                          size="sm" 
                          variant="flat" 
                          className="bg-white/20 text-white"
                        >
                          {subject.name}
                        </Chip>
                      ))}
                      {classDetail.subjects.length > 3 && (
                        <Chip size="sm" variant="flat" className="bg-white/20 text-white">
                          +{classDetail.subjects.length - 3} lainnya
                        </Chip>
                      )}
                    </div>
                  ) : classDetail.subject?.name ? (
                    <p className="text-white/90 text-lg mb-2">{classDetail.subject.name}</p>
                  ) : (
                    <p className="text-white/90 text-lg mb-2">Belum ada mata pelajaran</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Tingkat {classDetail.gradeLevel || '-'}</span>
                    {user?.role === 'ADMIN' && (
                      <>
                        <span className="text-white/60">•</span>
                        <Settings className="w-4 h-4" />
                        <span>{classDetail.subjects?.length || 0} mata pelajaran</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{classDetail.students?.length || classDetail.studentCount || 0}</div>
                      <div className="text-white/80 text-sm">Siswa</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {user?.role === 'ADMIN' 
                          ? (classDetail.subjects?.length || 0)
                          : 1
                        }
                      </div>
                      <div className="text-white/80 text-sm">
                        {user?.role === 'ADMIN' ? 'Mata Pelajaran' : 'Subject Saya'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {user?.role === 'ADMIN' 
                          ? (classDetail.subjects?.reduce((total, s) => total + (s.teachers?.length || 0), 0) || 0)
                          : 1
                        }
                      </div>
                      <div className="text-white/80 text-sm">Guru</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            className="w-full"
            classNames={{
              tabList: "bg-white/10 backdrop-blur-lg border border-white/20",
              tab: "text-white data-[selected=true]:text-white",
              tabContent: "text-white/60 data-[selected=true]:text-white",
              cursor: "bg-white/20"
            }}
          >
            <Tab key="overview" title="Ringkasan" />
            <Tab key="students" title="Daftar Siswa" />
            {user?.role === 'ADMIN' && <Tab key="subjects" title="Mata Pelajaran" />}
            <Tab key="grades" title="Rekap Nilai" />
            <Tab key="performance" title="Kinerja" />
          </Tabs>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informasi Kelas */}
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                <CardHeader>
                  <h3 className="text-white text-xl font-semibold">Informasi Kelas</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">Deskripsi</p>
                    <p className="text-white">{classDetail.description || 'Tidak ada deskripsi'}</p>
                  </div>
                  <Divider className="bg-white/20" />
                  <div>
                    <p className="text-white/60 text-sm">Mata Pelajaran</p>
                    <p className="text-white">{classDetail.subject?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Tingkat Kelas</p>
                    <p className="text-white">Kelas {classDetail.gradeLevel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Status</p>
                    <Chip color="success" variant="flat">Aktif</Chip>
                  </div>
                </CardBody>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                <CardHeader>
                  <h3 className="text-white text-xl font-semibold">Statistik Cepat</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Kehadiran Rata-rata</span>
                    <span className="text-white font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="max-w-md" color="success" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Nilai Rata-rata</span>
                    <span className="text-white font-semibold">78</span>
                  </div>
                  <Progress value={78} className="max-w-md" color="primary" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Tugas Selesai</span>
                    <span className="text-white font-semibold">92%</span>
                  </div>
                  <Progress value={92} className="max-w-md" color="warning" />
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'students' && (
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <h3 className="text-white text-xl font-semibold">Daftar Siswa</h3>
              </CardHeader>
              <CardBody>
                {classDetail.students && classDetail.students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classDetail.students.map((student, index) => (
                      <Card key={student.id} className="bg-white/5 border border-white/10">
                        <CardBody className="flex flex-row items-center gap-3">
                          <Avatar
                            src={`https://i.pravatar.cc/40?img=${index + 1}`}
                            name={student.fullName}
                            size="md"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{student.fullName}</p>
                            <p className="text-white/60 text-sm">NISN: {student.studentId}</p>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Belum ada siswa dalam kelas ini</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === 'grades' && (
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-white text-xl font-semibold">Rekap Nilai</h3>
                  {user?.role === 'ADMIN' && classDetail.subjects && classDetail.subjects.length > 0 && (
                    <div className="w-80 ml-auto">
                      <Select
                        label="Filter Mata Pelajaran"
                        placeholder="Pilih mata pelajaran"
                        selectedKeys={selectedSubjectForGrades ? [selectedSubjectForGrades] : []}
                        onSelectionChange={(keys) => {
                          const key = Array.from(keys)[0] as string;
                          setSelectedSubjectForGrades(key);
                        }}
                        classNames={{
                          base: "w-full",
                          trigger: "bg-white/10 border-white/20 text-white",
                          value: "text-white",
                          label: "text-white/80"
                        }}
                      >
                        {[
                          <SelectItem key="all" textValue="Semua Mata Pelajaran">
                            Semua Mata Pelajaran
                          </SelectItem>,
                          ...(classDetail.subjects || []).map((subject) => (
                            <SelectItem key={subject.id} textValue={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))
                        ]}
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {classDetail.students && classDetail.students.length > 0 ? (
                  // Check if teacher has subjects in this class
                  user?.role === 'GURU' && !classDetail.subjects?.some(subject => 
                    subject.teachers?.some(teacher => teacher.id === user?.id)
                  ) ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">Anda tidak mengajar mata pelajaran di kelas ini</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-full bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                        {/* Custom Table Header */}
                        <div className="grid gap-4 bg-white/10 text-white font-semibold border-b border-white/20 px-4 py-3 items-center" style={{
                          gridTemplateColumns: `60px 200px 150px ${
                            user?.role === 'ADMIN' 
                              ? (selectedSubjectForGrades === 'all' 
                                  ? `repeat(${classDetail.subjects?.length || 0}, 120px)` 
                                  : '120px')
                              : `repeat(${classDetail.subjects?.filter(subject => 
                                  subject.teachers?.some(teacher => teacher.id === user?.id)
                                ).length || 0}, 120px)`
                          } 120px 140px`
                        }}>
                          <div className="text-center flex items-center justify-center h-10">NO.</div>
                          <div 
                            className="cursor-pointer hover:bg-white/20 transition-colors rounded px-2 py-1 flex items-center gap-2 h-10"
                            onClick={() => handleSort('name')}
                          >
                            NAMA SISWA
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                          <div 
                            className="cursor-pointer hover:bg-white/20 transition-colors rounded px-2 py-1 flex items-center justify-center gap-2 h-10"
                            onClick={() => handleSort('nisn')}
                          >
                            NISN
                            {sortField === 'nisn' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                          {user?.role === 'ADMIN' ? (
                            selectedSubjectForGrades === 'all' ? (
                              // Show all subjects for admin when "all" is selected
                              classDetail.subjects?.map((subject) => (
                                <div 
                                  key={subject.id} 
                                  className="text-center cursor-pointer hover:bg-white/20 transition-colors rounded px-2 py-1 flex items-center justify-center gap-2 h-10"
                                  onClick={() => handleSort(subject.id)}
                                >
                                  {subject.name}
                                  {sortField === subject.id && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="w-4 h-4" /> : 
                                      <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              ))
                            ) : (
                              // Show specific subject when filtered
                              <div 
                                className="text-center cursor-pointer hover:bg-white/20 transition-colors rounded px-2 py-1 flex items-center justify-center gap-2 h-10"
                                onClick={() => handleSort(selectedSubjectForGrades)}
                              >
                                {classDetail.subjects?.find(s => s.id === selectedSubjectForGrades)?.name || 'Nilai'}
                                {sortField === selectedSubjectForGrades && (
                                  sortDirection === 'asc' ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            )
                          ) : (
                            // For teachers, show only subjects they teach in this class
                            classDetail.subjects?.filter(subject => 
                              subject.teachers?.some(teacher => teacher.id === user?.id)
                            ).map((subject) => (
                              <div 
                                key={subject.id} 
                                className="text-center cursor-pointer hover:bg-white/20 transition-colors rounded px-2 py-1 flex items-center justify-center gap-2 h-10"
                                onClick={() => handleSort(subject.id)}
                              >
                                {subject.name}
                                {sortField === subject.id && (
                                  sortDirection === 'asc' ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            ))
                          )}
                          <div 
                            className="text-center cursor-pointer hover:bg-white/20 transition-colors rounded px-2 py-1 flex items-center justify-center gap-2 h-10"
                            onClick={() => handleSort('average')}
                          >
                            RATA-RATA
                            {sortField === 'average' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-center flex items-center justify-center h-10">STATUS</div>
                        </div>

                        {/* Custom Table Body */}
                        <div className="divide-y divide-white/5">
                          {getSortedStudents().map((student, index) => {
                            // Mock grade calculation - use consistent seed for same results
                            const getGradeForSubject = (subjectId: string) => {
                              // Use consistent seed for same student-subject combination
                              const seed = student.id.length + subjectId.length;
                              return Math.floor((seed * 37) % 40) + 60;
                            };
                            
                            const getAllGrades = () => {
                              if (!classDetail.subjects) return [];
                              return classDetail.subjects.map(subject => getGradeForSubject(subject.id));
                            };
                            
                            const averageGrade = user?.role === 'ADMIN' 
                              ? (selectedSubjectForGrades === 'all' 
                                  ? getAllGrades().reduce((sum, grade) => sum + grade, 0) / (getAllGrades().length || 1)
                                  : getGradeForSubject(selectedSubjectForGrades))
                              : (() => {
                                  const teacherSubjects = classDetail.subjects?.filter(subject => 
                                    subject.teachers?.some(teacher => teacher.id === user?.id)
                                  ) || [];
                                  const teacherGrades = teacherSubjects.map(subject => getGradeForSubject(subject.id));
                                  return teacherGrades.length > 0 
                                    ? teacherGrades.reduce((sum, grade) => sum + grade, 0) / teacherGrades.length
                                    : 0;
                                })();
                              
                            const getGradeColor = (grade: number) => {
                              if (grade >= 85) return 'success';
                              if (grade >= 75) return 'warning';
                              return 'danger';
                            };
                            
                            return (
                              <div key={student.id} className="grid gap-4 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors items-center" style={{
                                gridTemplateColumns: `60px 200px 150px ${
                                  user?.role === 'ADMIN' 
                                    ? (selectedSubjectForGrades === 'all' 
                                        ? `repeat(${classDetail.subjects?.length || 0}, 120px)` 
                                        : '120px')
                                    : `repeat(${classDetail.subjects?.filter(subject => 
                                        subject.teachers?.some(teacher => teacher.id === user?.id)
                                      ).length || 0}, 120px)`
                                } 120px 140px`
                              }}>
                                <div className="text-center font-medium">{index + 1}</div>
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    size="sm"
                                    name={student.fullName}
                                    className="flex-shrink-0 bg-gradient-to-r from-blue-400 to-purple-500 text-white"
                                  />
                                  <span className="font-medium text-white">{student.fullName}</span>
                                </div>
                                <div className="text-white/80 text-center">{student.studentId || '-'}</div>
                                {user?.role === 'ADMIN' ? (
                                  selectedSubjectForGrades === 'all' ? (
                                    // Show all subject grades
                                    classDetail.subjects?.map((subject) => (
                                      <div key={subject.id} className="text-center">
                                        <Chip
                                          size="sm"
                                          color={getGradeColor(getGradeForSubject(subject.id))}
                                          variant="solid"
                                          className="font-medium"
                                        >
                                          {getGradeForSubject(subject.id)}
                                        </Chip>
                                      </div>
                                    ))
                                  ) : (
                                    // Show specific subject grade
                                    <div className="text-center">
                                      <Chip
                                        size="sm"
                                        color={getGradeColor(getGradeForSubject(selectedSubjectForGrades))}
                                        variant="solid"
                                        className="font-medium"
                                      >
                                        {getGradeForSubject(selectedSubjectForGrades)}
                                      </Chip>
                                    </div>
                                  )
                                ) : (
                                  // Teacher view - show grades for subjects they teach
                                  classDetail.subjects?.filter(subject => 
                                    subject.teachers?.some(teacher => teacher.id === user?.id)
                                  ).map((subject) => (
                                    <div key={subject.id} className="text-center">
                                      <Chip
                                        size="sm"
                                        color={getGradeColor(getGradeForSubject(subject.id))}
                                        variant="solid"
                                        className="font-medium"
                                      >
                                        {getGradeForSubject(subject.id)}
                                      </Chip>
                                    </div>
                                  ))
                                )}
                                <div className="text-center">
                                  <Chip
                                    size="sm"
                                    color={getGradeColor(averageGrade)}
                                    variant="solid"
                                    className="font-medium"
                                  >
                                    {averageGrade.toFixed(1)}
                                  </Chip>
                                </div>
                                <div className="text-center">
                                  <Chip
                                    size="sm"
                                    color={averageGrade >= 75 ? 'success' : 'danger'}
                                    variant="solid"
                                    className="font-medium"
                                  >
                                    {averageGrade >= 75 ? 'Lulus' : 'Perlu Perbaikan'}
                                  </Chip>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Belum ada siswa dalam kelas ini</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                <CardHeader>
                  <h3 className="text-white text-xl font-semibold">Tren Kinerja</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Data kinerja akan ditampilkan di sini</p>
                  </div>
                </CardBody>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                <CardHeader>
                  <h3 className="text-white text-xl font-semibold">Aktivitas Terbaru</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Belum ada aktivitas terbaru</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'subjects' && user?.role === 'ADMIN' && (
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <h3 className="text-white text-xl font-semibold">Mata Pelajaran & Guru</h3>
                <p className="text-white/60 text-sm">Kelola mata pelajaran dan guru pengajar untuk kelas ini</p>
              </CardHeader>
              <CardBody>
                {classDetail.subjects && classDetail.subjects.length > 0 ? (
                  <div className="space-y-4">
                    {classDetail.subjects.map((subject, index) => (
                      <Card key={subject.id} className="bg-white/5 border border-white/10">
                        <CardBody>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-white text-lg font-semibold">
                                {subject.name}
                              </h4>
                              <p className="text-white/60 text-sm">
                                Kode: {subject.code}
                              </p>
                            </div>
                            <Chip size="sm" className="bg-blue-500/20 text-blue-300">
                              {teacherAssignments[subject.id]?.length || 0} Guru
                            </Chip>
                          </div>
                          
                          {/* Teacher Assignment Select */}
                          <div className="mb-4">
                            <Select
                              label="Assign Guru"
                              placeholder="Pilih guru untuk mata pelajaran ini"
                              selectionMode="multiple"
                              selectedKeys={teacherAssignments[subject.id] || []}
                              onSelectionChange={(keys) => {
                                const selectedIds = Array.from(keys) as string[];
                                handleTeacherAssignment(subject.id, selectedIds);
                              }}
                              classNames={{
                                base: "w-full",
                                trigger: "bg-white/10 border-white/20 text-white",
                                value: "text-white",
                                label: "text-white/80"
                              }}
                            >
                              {availableTeachers.map((teacher) => (
                                <SelectItem key={teacher.id} textValue={teacher.fullName}>
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      name={teacher.fullName}
                                      size="sm"
                                      className="bg-gradient-to-r from-green-400 to-blue-500"
                                    />
                                    <div>
                                      <p className="font-medium">{teacher.fullName}</p>
                                      <p className="text-xs text-gray-500">{teacher.email}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </Select>
                          </div>
                          
                          {/* Currently Assigned Teachers */}
                          {teacherAssignments[subject.id] && teacherAssignments[subject.id].length > 0 ? (
                            <div>
                              <p className="text-white/80 text-sm mb-2 font-medium">Guru yang di-assign:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {teacherAssignments[subject.id].map((teacherId) => {
                                  const teacher = availableTeachers.find(t => t.id === teacherId);
                                  if (!teacher) return null;
                                  
                                  return (
                                    <div key={teacher.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                      <Avatar
                                        name={teacher.fullName}
                                        size="sm"
                                        className="bg-gradient-to-r from-green-400 to-blue-500"
                                      />
                                      <div className="flex-1">
                                        <p className="text-white font-medium text-sm">{teacher.fullName}</p>
                                        <p className="text-white/60 text-xs">{teacher.email}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-white/60 text-sm bg-white/5 rounded-lg">
                              Belum ada guru yang di-assign untuk mata pelajaran ini
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">Belum ada mata pelajaran dalam kelas ini</p>
                    <Button 
                      color="primary" 
                      variant="flat" 
                      onPress={() => navigate(`/admin/classes`)}
                      startContent={<Settings className="w-4 h-4" />}
                    >
                      Kelola Mata Pelajaran
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
