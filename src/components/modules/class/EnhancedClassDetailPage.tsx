import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip
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
  UserCheck,
  Trash2,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { classService } from '../../../services/classService';
import { useAuthStore } from '../../../stores/authStore';
import EmptyState from '../../common/EmptyState';
import { toast } from 'react-hot-toast';

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

const EnhancedClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ClassDetail['students'][0] | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassDetail['assignments'][0] | null>(null);

  // Modal controls
  const { isOpen: isStudentModalOpen, onOpen: onStudentModalOpen, onClose: onStudentModalClose } = useDisclosure();
  const { isOpen: isAssignmentModalOpen, onOpen: onAssignmentModalOpen, onClose: onAssignmentModalClose } = useDisclosure();

  const loadClassDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await classService.getClassDetail(classId!);
      
      if (response.success && response.data) {
        setClassDetail(response.data);
      } else {
        setError(response.error || 'Gagal memuat detail kelas');
        toast.error(response.error || 'Gagal memuat detail kelas');
      }
    } catch (err: unknown) {
      const errorMessage = 'Terjadi kesalahan saat memuat detail kelas';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading class detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    const loadData = async () => {
      if (classId) {
        await loadClassDetail();
      }
    };
    loadData();
  }, [classId, loadClassDetail]);

  const handleRefresh = async () => {
    await loadClassDetail();
    toast.success('Data berhasil dimuat ulang');
  };

  // Student action handlers
  const handleViewStudentDetail = (student: ClassDetail['students'][0]) => {
    setSelectedStudent(student);
    onStudentModalOpen();
  };

  const handleEditStudent = (studentId: string) => {
    // Navigate to student edit page or open edit modal
    console.log('Edit student:', studentId);
    toast('Fitur edit siswa akan segera tersedia', { icon: '💡' });
  };

  const handleRemoveStudent = (studentId: string) => {
    // Implement student removal logic
    console.log('Remove student:', studentId);
    toast('Fitur hapus siswa akan segera tersedia', { icon: '💡' });
  };

  // Assignment action handlers
  const handleViewAssignmentDetail = (assignment: ClassDetail['assignments'][0]) => {
    setSelectedAssignment(assignment);
    onAssignmentModalOpen();
  };

  const handleEditAssignment = (assignmentId: string) => {
    // Navigate to assignment edit page
    console.log('Edit assignment:', assignmentId);
    toast('Fitur edit tugas akan segera tersedia', { icon: '💡' });
  };

  const handleCreateAssignment = () => {
    // Navigate to assignment creation page
    console.log('Create new assignment for class:', classId);
    toast('Fitur buat tugas baru akan segera tersedia', { icon: '💡' });
  };

  // Utility functions
  const getAttendanceStatusColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'danger';
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'warning';
    if (grade >= 70) return 'default';
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

  const calculateAttendanceRate = (attendance: ClassDetail['students'][0]['attendance']) => {
    if (!attendance.total) return 0;
    return Math.round((attendance.present / attendance.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" label="Memuat detail kelas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-danger">
          <CardBody className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-danger mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                color="danger" 
                variant="flat" 
                onPress={handleRefresh}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                Coba Lagi
              </Button>
              <Button 
                variant="ghost" 
                onPress={() => navigate('/class-manager')}
                startContent={<ArrowLeft className="w-4 h-4" />}
              >
                Kembali
              </Button>
            </div>
          </CardBody>
        </Card>
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
          actionLabel="Kembali ke Daftar Kelas"
          onAction={() => navigate('/class-manager')}
        />
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{classDetail.name}</h1>
            <Tooltip content="Muat ulang data">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={handleRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
          <p className="text-gray-600">
            Tingkat {classDetail.gradeLevel} • {classDetail.studentCount} Siswa
            {classDetail.description && ` • ${classDetail.description}`}
          </p>
        </div>
        <div className="flex gap-2">
          {classDetail.subjects.map((subject) => (
            <Chip key={subject.id} size="sm" variant="flat" color="primary">
              {subject.code}
            </Chip>
          ))}
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
                  <span>Siswa ({classDetail.students.length})</span>
                </div>
              }
            />
            <Tab
              key="assignments"
              title={
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Tugas ({classDetail.assignments.length})</span>
                </div>
              }
            />
          </Tabs>
        </CardHeader>

        <CardBody>
          {/* Dashboard Tab */}
          {selectedTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Subjects and Teachers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Mata Pelajaran & Pengajar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classDetail.subjects.map((subject) => (
                    <Card key={subject.id} className="border">
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{subject.name}</h4>
                            <p className="text-sm text-gray-600">{subject.code}</p>
                          </div>
                          <Chip size="sm" variant="flat" color="secondary">
                            {subject.teachers.length} Guru
                          </Chip>
                        </div>
                        <div className="space-y-2">
                          {subject.teachers.map((teacher) => (
                            <div key={teacher.id} className="flex items-center gap-2">
                              <Avatar size="sm" name={teacher.fullName} />
                              <span className="text-sm">{teacher.fullName}</span>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Performance Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ringkasan Performa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardBody className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold mb-1">{classDetail.statistics.averageGrade.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Rata-rata Nilai Kelas</div>
                      <Progress 
                        value={classDetail.statistics.averageGrade} 
                        size="sm" 
                        color="primary" 
                        className="mt-2"
                      />
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="text-center p-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CalendarCheck className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold mb-1">{classDetail.statistics.attendanceRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Tingkat Kehadiran</div>
                      <Progress 
                        value={classDetail.statistics.attendanceRate} 
                        size="sm" 
                        color="success" 
                        className="mt-2"
                      />
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="text-center p-6">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-8 h-8 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold mb-1">{classDetail.statistics.assignmentCompletionRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Penyelesaian Tugas</div>
                      <Progress 
                        value={classDetail.statistics.assignmentCompletionRate} 
                        size="sm" 
                        color="warning" 
                        className="mt-2"
                      />
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {selectedTab === 'students' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Siswa</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" startContent={<Download className="w-4 h-4" />}>
                    Export
                  </Button>
                  <Button size="sm" variant="flat" startContent={<Filter className="w-4 h-4" />}>
                    Filter
                  </Button>
                </div>
              </div>

              {classDetail.students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableColumn>SISWA</TableColumn>
                    <TableColumn>RATA-RATA NILAI</TableColumn>
                    <TableColumn>KEHADIRAN</TableColumn>
                    <TableColumn>TUGAS</TableColumn>
                    <TableColumn>AKSI</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {classDetail.students.map((student) => {
                      const attendanceRate = calculateAttendanceRate(student.attendance);
                      const assignmentProgress = (student.assignments.completed / student.assignments.total) * 100;

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar size="sm" name={student.fullName} />
                              <div>
                                <div className="font-medium">{student.fullName}</div>
                                <div className="text-sm text-gray-600">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{student.averageGrade.toFixed(1)}</span>
                              <Chip 
                                size="sm" 
                                variant="flat"
                                color={getGradeColor(student.averageGrade)}
                              >
                                {student.averageGrade >= 90 ? 'A' : 
                                 student.averageGrade >= 80 ? 'B' :
                                 student.averageGrade >= 70 ? 'C' : 'D'}
                              </Chip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{attendanceRate}%</span>
                                <Chip 
                                  size="sm" 
                                  variant="flat"
                                  color={getAttendanceStatusColor(attendanceRate)}
                                >
                                  {attendanceRate >= 90 ? 'Baik' : 
                                   attendanceRate >= 80 ? 'Cukup' : 'Kurang'}
                                </Chip>
                              </div>
                              <Progress 
                                value={attendanceRate} 
                                size="sm"
                                color={getAttendanceStatusColor(attendanceRate)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {student.assignments.completed}/{student.assignments.total}
                              </div>
                              <Progress 
                                value={assignmentProgress} 
                                size="sm"
                                color={assignmentProgress === 100 ? 'success' : 
                                       assignmentProgress >= 75 ? 'warning' : 'danger'}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Tooltip content="Lihat Detail">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => handleViewStudentDetail(student)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Edit">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => handleEditStudent(student.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Hapus" color="danger">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  color="danger"
                                  onPress={() => handleRemoveStudent(student.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Belum Ada Siswa"
                  description="Belum ada siswa yang terdaftar dalam kelas ini."
                />
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {selectedTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Tugas</h3>
                <Button 
                  color="primary" 
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={handleCreateAssignment}
                >
                  Buat Tugas Baru
                </Button>
              </div>

              {classDetail.assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classDetail.assignments.map((assignment) => {
                    const dueDate = new Date(assignment.dueDate);
                    const now = new Date();
                    const isOverdue = dueDate < now && assignment.status !== 'completed';
                    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const completionRate = (assignment.submissions / assignment.totalStudents) * 100;

                    return (
                      <motion.div
                        key={assignment.id}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="h-full">
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
                                  onPress={() => handleViewAssignmentDetail(assignment)}
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
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Belum Ada Tugas"
                  description="Belum ada tugas yang dibuat untuk kelas ini."
                  actionLabel="Buat Tugas Baru"
                  onAction={handleCreateAssignment}
                />
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Student Detail Modal */}
      <Modal isOpen={isStudentModalOpen} onClose={onStudentModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3>Detail Siswa</h3>
          </ModalHeader>
          <ModalBody>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar size="lg" name={selectedStudent.fullName} />
                  <div>
                    <h4 className="text-lg font-semibold">{selectedStudent.fullName}</h4>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>
                
                <Divider />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Nilai</h5>
                    <div className="space-y-2">
                      {selectedStudent.grades.map((grade, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm">{grade.subject} ({grade.type})</span>
                          <span className="font-medium">{grade.score}</span>
                        </div>
                      ))}
                      <Divider />
                      <div className="flex justify-between font-semibold">
                        <span>Rata-rata</span>
                        <span>{selectedStudent.averageGrade.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2">Kehadiran</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Hadir</span>
                        <span>{selectedStudent.attendance.present}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tidak Hadir</span>
                        <span>{selectedStudent.attendance.absent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Sakit</span>
                        <span>{selectedStudent.attendance.sick}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Izin</span>
                        <span>{selectedStudent.attendance.permission}</span>
                      </div>
                      <Divider />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{selectedStudent.attendance.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onStudentModalClose}>
              Tutup
            </Button>
            <Button color="primary" onPress={() => handleEditStudent(selectedStudent?.id)}>
              Edit Siswa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assignment Detail Modal */}
      <Modal isOpen={isAssignmentModalOpen} onClose={onAssignmentModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3>Detail Tugas</h3>
          </ModalHeader>
          <ModalBody>
            {selectedAssignment && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">{selectedAssignment.title}</h4>
                  <p className="text-gray-600">{selectedAssignment.subject}</p>
                </div>
                
                <Divider />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Status Pengumpulan</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Sudah Mengumpulkan</span>
                        <span>{selectedAssignment.submissions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Belum Mengumpulkan</span>
                        <span>{selectedAssignment.totalStudents - selectedAssignment.submissions}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Siswa</span>
                        <span>{selectedAssignment.totalStudents}</span>
                      </div>
                      <Progress 
                        value={(selectedAssignment.submissions / selectedAssignment.totalStudents) * 100}
                        size="sm"
                        color="primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2">Informasi Tugas</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Batas Waktu</span>
                        <span>{new Date(selectedAssignment.dueDate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Chip 
                          size="sm" 
                          color={getAssignmentStatusColor(selectedAssignment.status)}
                          variant="flat"
                        >
                          {selectedAssignment.status === 'completed' ? 'Selesai' :
                           selectedAssignment.status === 'active' ? 'Aktif' : 'Terlambat'}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onAssignmentModalClose}>
              Tutup
            </Button>
            <Button color="primary" onPress={() => handleEditAssignment(selectedAssignment?.id)}>
              Edit Tugas
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EnhancedClassDetailPage;
