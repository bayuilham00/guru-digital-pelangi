import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Avatar,
  Badge,
  Divider
} from '@heroui/react';
import {
  ArrowLeft,
  Users,
  BookOpen,
  FileText,
  CalendarCheck,
  BarChart3,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  UserCheck
} from 'lucide-react';
import { classService } from '../../../services/classService';
import { useAuthStore } from '../../../stores/authStore';
import EmptyState from '../../common/EmptyState';

interface ClassDetail {
  id: string;
  name: string;
  gradeLevel: string;
  description?: string;
  studentCount: number;
  subjects: {
    id: string;
    name: string;
    code: string;
    teachers: {
      id: string;
      fullName: string;
    }[];
  }[];
  students: {
    id: string;
    fullName: string;
    email: string;
    assignments: {
      completed: number;
      total: number;
      averageScore: number;
    };
    attendance: {
      present: number;
      absent: number;
      sick: number;
      permission: number;
      total: number;
    };
    grades: {
      subject: string;
      score: number;
      type: string; // 'assignment' | 'quiz' | 'exam'
    }[];
    averageGrade: number;
  }[];
  assignments: {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    submissions: number;
    totalStudents: number;
    status: 'active' | 'completed' | 'overdue';
  }[];
  statistics: {
    totalStudents: number;
    averageGrade: number;
    attendanceRate: number;
    assignmentCompletionRate: number;
    activeAssignments: number;
  };
}

const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (classId) {
        await loadClassDetail();
      }
    };
    loadData();
  }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadClassDetail = async () => {
    try {
      setIsLoading(true);
      console.log('🔧 Loading class detail for classId:', classId);
      
      // Use the enhanced classService method for real backend integration
      const response = await classService.getClassDetail(classId!);
      console.log('🔧 Class detail response:', response);
      
      if (response.success && response.data) {
        console.log('🔧 Setting class detail data:', response.data);
        console.log('🔧 Subjects in class detail:', response.data.subjects);
        console.log('🔧 Students in class detail:', response.data.students);
        setClassDetail(response.data);
      } else {
        console.error('🔧 Failed to load class detail:', response.error);
        // Fallback to empty state - will be handled by the component
        setClassDetail(null);
      }
    } catch (error: unknown) {
      console.error('🔧 Error loading class detail:', error);
      setClassDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'danger';
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return 'success';
    if (grade >= 75) return 'warning';
    return 'danger';
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };

  const handleViewStudentDetail = (studentId: string) => {
    // Navigate to student detail page or open modal
    console.log('Viewing student detail:', studentId);
    // TODO: Implement student detail modal or navigation
    // navigate(`/student/${studentId}`);
  };

  const handleEditStudent = (studentId: string) => {
    // Navigate to student edit page or open edit modal
    console.log('Editing student:', studentId);
    // TODO: Implement student edit functionality
    // navigate(`/student/${studentId}/edit`);
  };

  const handleViewAssignmentDetail = (assignmentId: string) => {
    // Navigate to assignment detail page
    console.log('Viewing assignment detail:', assignmentId);
    // TODO: Implement assignment detail modal or navigation
    // navigate(`/assignment/${assignmentId}`);
  };

  const handleEditAssignment = (assignmentId: string) => {
    // Navigate to assignment edit page or open edit modal
    console.log('Editing assignment:', assignmentId);
    // TODO: Implement assignment edit functionality
    // navigate(`/assignment/${assignmentId}/edit`);
  };

  const handleCreateNewAssignment = () => {
    // Navigate to create assignment page with class pre-selected
    console.log('Creating new assignment for class:', classId);
    // navigate(`/assignment/create?classId=${classId}`);
    alert(`Creating new assignment for class: ${classId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertTriangle}
          title="Kelas Tidak Ditemukan"
          description="Kelas yang Anda cari tidak ditemukan atau Anda tidak memiliki akses."
        />
      </div>
    );
  }

  // Debug logging untuk melihat data saat render
  console.log('🔧 Rendering class detail with data:', classDetail);
  console.log('🔧 Subjects available for rendering:', classDetail.subjects);
  console.log('🔧 Students available for rendering:', classDetail.students);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => navigate('/class-manager')}
          title="Kembali ke Daftar Kelas"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{classDetail.name}</h1>
          <p className="text-gray-600">Tingkat {classDetail.gradeLevel} • {classDetail.studentCount} Siswa</p>
        </div>
        <div className="flex gap-2">
          {classDetail.subjects && classDetail.subjects.length > 0 ? (
            classDetail.subjects.map((subject) => (
              <Chip key={subject.id} size="sm" variant="flat" color="primary">
                {subject.code}
              </Chip>
            ))
          ) : (
            <Chip size="sm" variant="flat" color="default">
              Belum ada mata pelajaran
            </Chip>
          )}
        </div>
      </div>

      {/* Class Info Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{classDetail.statistics.totalStudents}</div>
              <div className="text-white/80 text-sm font-medium">Total Siswa</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{classDetail.statistics.averageGrade.toFixed(1)}</div>
              <div className="text-white/80 text-sm font-medium">Rata-rata Nilai</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{classDetail.statistics.attendanceRate.toFixed(1)}%</div>
              <div className="text-white/80 text-sm font-medium">Tingkat Kehadiran</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{classDetail.statistics.activeAssignments}</div>
              <div className="text-white/80 text-sm font-medium">Tugas Aktif</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab
              key="dashboard"
              title={
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              }
            />
            <Tab
              key="students"
              title={
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Siswa</span>
                </div>
              }
            />
            <Tab
              key="assignments"
              title={
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Tugas</span>
                </div>
              }
            />
          </Tabs>
        </CardHeader>
        <CardBody>
          {/* Dashboard Tab */}
          {selectedTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teacher Assignment */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Guru Pengampu
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {classDetail.subjects && classDetail.subjects.length > 0 ? (
                        classDetail.subjects.map((subject) => (
                          <div key={subject.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-sm text-gray-600">{subject.code}</div>
                            </div>
                            <div className="text-right">
                              {subject.teachers && subject.teachers.length > 0 ? (
                                subject.teachers.map((teacher) => (
                                  <div key={teacher.id} className="text-sm font-medium">
                                    {teacher.fullName}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500 italic">Belum ada guru assigned</div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Belum ada mata pelajaran</p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Aktivitas Terbaru
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Essay Lingkungan</div>
                          <div className="text-sm text-gray-600">25/25 siswa telah mengumpulkan</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Aljabar Linear</div>
                          <div className="text-sm text-gray-600">Tugas baru untuk Matematika</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <div>
                          <div className="font-medium">Vocabulary Quiz</div>
                          <div className="text-sm text-gray-600">Deadline terlewat, 7 siswa belum mengumpulkan</div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Distribusi Nilai</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sangat Baik (85-100)</span>
                        <span className="text-sm font-medium">12 siswa</span>
                      </div>
                      <Progress value={48} color="success" size="sm" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Baik (75-84)</span>
                        <span className="text-sm font-medium">8 siswa</span>
                      </div>
                      <Progress value={32} color="warning" size="sm" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cukup (65-74)</span>
                        <span className="text-sm font-medium">5 siswa</span>
                      </div>
                      <Progress value={20} color="danger" size="sm" />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Tingkat Kehadiran</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hadir</span>
                        <span className="text-sm font-medium">87.5%</span>
                      </div>
                      <Progress value={87.5} color="success" size="sm" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sakit</span>
                        <span className="text-sm font-medium">8.3%</span>
                      </div>
                      <Progress value={8.3} color="warning" size="sm" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Alpa</span>
                        <span className="text-sm font-medium">4.2%</span>
                      </div>
                      <Progress value={4.2} color="danger" size="sm" />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Penyelesaian Tugas</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {classDetail.statistics.assignmentCompletionRate.toFixed(0)}%
                      </div>
                      <Progress 
                        value={classDetail.statistics.assignmentCompletionRate} 
                        color="primary" 
                        size="lg" 
                        className="mb-3"
                      />
                      <div className="text-sm text-gray-600">
                        Rata-rata penyelesaian tugas
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {selectedTab === 'students' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Siswa Kelas {classDetail.name}</h3>
                <div className="text-sm text-gray-600">
                  Siswa dikelola melalui Student Manager
                </div>
              </div>

              <Table aria-label="Students table">
                <TableHeader>
                  <TableColumn>NAMA SISWA</TableColumn>
                  <TableColumn>RATA-RATA NILAI</TableColumn>
                  <TableColumn>TUGAS SELESAI</TableColumn>
                  <TableColumn>KEHADIRAN</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>AKSI</TableColumn>
                </TableHeader>
                <TableBody>
                  {classDetail.students && classDetail.students.length > 0 ? (
                    classDetail.students.map((student) => {
                      const attendanceRate = student.attendance.total > 0 
                        ? (student.attendance.present / student.attendance.total) * 100 
                        : 0;
                      const assignmentRate = student.assignments.total > 0 
                        ? (student.assignments.completed / student.assignments.total) * 100 
                        : 0;
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="sm"
                                name={student.fullName}
                                className="flex-shrink-0"
                              />
                              <div>
                                <div className="font-medium">{student.fullName}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{student.averageGrade.toFixed(1)}</span>
                              <Chip
                                size="sm"
                                color={getGradeColor(student.averageGrade)}
                                variant="flat"
                              >
                                {student.averageGrade >= 85 ? 'Sangat Baik' : 
                                 student.averageGrade >= 75 ? 'Baik' : 'Perlu Perbaikan'}
                              </Chip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {student.assignments.completed}/{student.assignments.total}
                              </div>
                              <Progress
                                value={assignmentRate}
                                size="sm"
                                color={assignmentRate >= 80 ? 'success' : assignmentRate >= 60 ? 'warning' : 'danger'}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {attendanceRate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                H:{student.attendance.present} S:{student.attendance.sick} I:{student.attendance.permission} A:{student.attendance.absent}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={getAttendanceColor(attendanceRate)}
                              variant="flat"
                            >
                              {attendanceRate >= 90 ? 'Aktif' : 
                               attendanceRate >= 80 ? 'Cukup Aktif' : 'Perlu Perhatian'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                onPress={() => handleViewStudentDetail(student.id)}
                                title="Lihat Detail Siswa"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                onPress={() => handleEditStudent(student.id)}
                                title="Edit Siswa"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Belum ada siswa di kelas ini</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Assignments Tab */}
          {selectedTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tugas Kelas {classDetail.name}</h3>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  size="sm"
                  onPress={handleCreateNewAssignment}
                >
                  Buat Tugas Baru
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classDetail.assignments.map((assignment) => {
                  const completionRate = (assignment.submissions / assignment.totalStudents) * 100;
                  const isOverdue = assignment.status === 'overdue';
                  const dueDate = new Date(assignment.dueDate);
                  const now = new Date();
                  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`${isOverdue ? 'border-red-200 bg-red-50' : ''} hover:shadow-lg transition-shadow`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg line-clamp-2">{assignment.title}</h4>
                              <p className="text-sm text-gray-600">{assignment.subject}</p>
                            </div>
                            <Chip
                              size="sm"
                              color={getAssignmentStatusColor(assignment.status)}
                              variant="flat"
                            >
                              {assignment.status === 'completed' ? 'Selesai' :
                               assignment.status === 'active' ? 'Aktif' : 'Terlambat'}
                            </Chip>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-2">
                          <div className="space-y-3">
                            {/* Submission Progress */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Pengumpulan</span>
                                <span className="text-sm">{assignment.submissions}/{assignment.totalStudents}</span>
                              </div>
                              <Progress
                                value={completionRate}
                                size="sm"
                                color={completionRate === 100 ? 'success' : completionRate >= 75 ? 'warning' : 'danger'}
                              />
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Batas Waktu:</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {dueDate.toLocaleDateString('id-ID')}
                                </div>
                                <div className={`text-xs ${isOverdue ? 'text-red-600' : daysLeft <= 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                                  {isOverdue ? 'Terlambat' : 
                                   daysLeft === 0 ? 'Hari ini' :
                                   daysLeft === 1 ? 'Besok' :
                                   `${daysLeft} hari lagi`}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <Divider />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<Eye className="w-4 h-4" />}
                                className="flex-1"
                                onPress={() => handleViewAssignmentDetail(assignment.id)}
                              >
                                Lihat Detail
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                color="default"
                                startContent={<Edit className="w-4 h-4" />}
                                className="flex-1"
                                onPress={() => handleEditAssignment(assignment.id)}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty State for Assignments */}
              {classDetail.assignments.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="Belum Ada Tugas"
                  description="Belum ada tugas yang dibuat untuk kelas ini. Klik tombol 'Buat Tugas Baru' untuk memulai."
                />
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ClassDetailPage;
