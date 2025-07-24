import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  UserCheck,
  AlertCircle,
  CheckCircle,
  School,
  FileText,
  ClipboardList,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { classService } from '../../../services/classService';
import { subjectService } from '../../../services/subjectService';
import { useAuthStore } from '../../../stores/authStore';
import EmptyState from '../../common/EmptyState';
import AssignmentManager from '../assignment/AssignmentManager';
import GradeManager from '../grade/GradeManager';
import AttendanceManager from '../attendance/AttendanceManager';

interface AdminClass {
  id: string;
  name: string;
  gradeLevel: string;
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
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  fullName: string;
  email: string;
}

interface PendingEnrollment {
  id: string;
  studentName: string;
  className: string;
  subjectName: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminMultiSubjectDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[]>([]);
  const [selectedClass, setSelectedClass] = useState<AdminClass | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [selectedSubjectForTeacher, setSelectedSubjectForTeacher] = useState('');
  
  const { isOpen: isAddSubjectOpen, onOpen: onAddSubjectOpen, onClose: onAddSubjectClose } = useDisclosure();
  const { isOpen: isAssignTeacherOpen, onOpen: onAssignTeacherOpen, onClose: onAssignTeacherClose } = useDisclosure();
  const { isOpen: isEnrollmentApprovalOpen, onOpen: onEnrollmentApprovalOpen, onClose: onEnrollmentApprovalClose } = useDisclosure();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadClassesData();
      loadSubjects();
      loadTeachers();
      loadPendingEnrollments();
    }
  }, [user]);

  const loadClassesData = async () => {
    try {
      setIsLoading(true);
      const response = await classService.getClassesWithDynamicCount();
      
      if (response.success) {
        // Transform to AdminClass format
        const adminClasses: AdminClass[] = response.data?.map(cls => ({
          id: cls.id,
          name: cls.name,
          gradeLevel: cls.gradeLevel || '0',
          studentCount: cls.studentCount || 0,
          subjects: cls.classSubjects?.map(cs => ({
            id: cs.subject.id,
            name: cs.subject.name,
            code: cs.subject.code,
            teachers: [] // Will be loaded separately if needed
          })) || []
        })) || [];
        
        setClasses(adminClasses);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectService.getSubjects();
      if (response.success) {
        setSubjects(response.data || []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTeachers: Teacher[] = [
        { id: '1', fullName: 'Dr. Sarah Johnson', email: 'sarah@school.edu' },
        { id: '2', fullName: 'Prof. Michael Chen', email: 'michael@school.edu' },
        { id: '3', fullName: 'Ms. Emily Rodriguez', email: 'emily@school.edu' },
        { id: '4', fullName: 'Mr. David Wilson', email: 'david@school.edu' },
      ];
      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadPendingEnrollments = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockEnrollments: PendingEnrollment[] = [
        {
          id: '1',
          studentName: 'Ahmad Rizki',
          className: 'Kelas 7.1',
          subjectName: 'Matematika',
          requestDate: '2024-01-15',
          status: 'pending'
        },
        {
          id: '2',
          studentName: 'Siti Nurhaliza',
          className: 'Kelas 8.2',
          subjectName: 'Bahasa Indonesia',
          requestDate: '2024-01-14',
          status: 'pending'
        }
      ];
      setPendingEnrollments(mockEnrollments);
    } catch (error) {
      console.error('Error loading pending enrollments:', error);
    }
  };

  const handleAddSubjectToClass = async () => {
    if (!selectedClass || !newSubjectId) return;

    try {
      const response = await classService.addSubjectToClass({
        classId: selectedClass.id,
        subjectId: newSubjectId
      });

      if (response.success) {
        loadClassesData(); // Refresh data
        onAddSubjectClose();
        setNewSubjectId('');
      }
    } catch (error) {
      console.error('Error adding subject to class:', error);
    }
  };

  const handleRemoveSubjectFromClass = async (classId: string, subjectId: string) => {
    try {
      const response = await classService.removeSubjectFromClass(classId, subjectId);
      if (response.success) {
        loadClassesData(); // Refresh data
      }
    } catch (error) {
      console.error('Error removing subject from class:', error);
    }
  };

  const handleAssignTeacherToSubject = async () => {
    if (!selectedClass || !newTeacherId || !selectedSubjectForTeacher) return;

    try {
      // Mock API call - replace with actual implementation
      console.log('Assigning teacher', newTeacherId, 'to subject', selectedSubjectForTeacher, 'in class', selectedClass.id);
      
      // Simulate success
      loadClassesData(); // Refresh data
      onAssignTeacherClose();
      setNewTeacherId('');
      setSelectedSubjectForTeacher('');
    } catch (error) {
      console.error('Error assigning teacher to subject:', error);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Approving enrollment:', enrollmentId);
      
      setPendingEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, status: 'approved' as const }
            : enrollment
        )
      );
    } catch (error) {
      console.error('Error approving enrollment:', error);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: string) => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Rejecting enrollment:', enrollmentId);
      
      setPendingEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, status: 'rejected' as const }
            : enrollment
        )
      );
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
    }
  };

  const getClassStatusColor = (studentCount: number, subjectCount: number) => {
    if (studentCount === 0) return 'bg-red-100 text-red-700';
    if (subjectCount === 0) return 'bg-orange-100 text-orange-700';
    if (subjectCount >= 3) return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getClassStatusText = (studentCount: number, subjectCount: number) => {
    if (studentCount === 0) return 'Tidak ada siswa';
    if (subjectCount === 0) return 'Tidak ada mata pelajaran';
    if (subjectCount >= 3) return 'Lengkap';
    return 'Perlu mata pelajaran';
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <Card>
          <CardBody className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Akses Terbatas</h3>
            <p className="text-gray-600">Dashboard ini khusus untuk admin.</p>
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
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Multi-Subject Dashboard</h1>
            <p className="text-purple-100">Kelola kelas, mata pelajaran, dan assignment guru</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Kelas</p>
                <p className="text-2xl font-bold text-blue-700">{classes.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Total Mata Pelajaran</p>
                <p className="text-2xl font-bold text-green-700">{subjects.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Siswa</p>
                <p className="text-2xl font-bold text-purple-700">
                  {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Kelas Aktif</p>
                <p className="text-2xl font-bold text-orange-700">
                  {classes.filter(cls => cls.studentCount > 0 && cls.subjects.length > 0).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key as string)}
            className="w-full"
            variant="underlined"
          >
            <Tab 
              key="overview" 
              title={
                <div className="flex items-center space-x-2">
                  <School className="w-4 h-4"/>
                  <span>Overview Kelas</span>
                </div>
              }
            />
            <Tab 
              key="assignments" 
              title={
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4"/>
                  <span>Assignment</span>
                </div>
              }
            />
            <Tab 
              key="grades" 
              title={
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4"/>
                  <span>Nilai</span>
                </div>
              }
            />
            <Tab 
              key="attendance" 
              title={
                <div className="flex items-center space-x-2">
                  <CalendarCheck className="w-4 h-4"/>
                  <span>Absensi</span>
                </div>
              }
            />
            <Tab 
              key="approvals" 
              title={
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4"/>
                  <span>Persetujuan</span>
                  {pendingEnrollments.filter(e => e.status === 'pending').length > 0 && (
                    <Chip size="sm" color="warning" variant="flat">
                      {pendingEnrollments.filter(e => e.status === 'pending').length}
                    </Chip>
                  )}
                </div>
              }
            />
            <Tab 
              key="analytics" 
              title={
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4"/>
                  <span>Analytics</span>
                </div>
              }
            />
          </Tabs>
        </CardHeader>
        <CardBody>
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Semua Kelas Multi-Subject</h3>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={() => {/* TODO: Add new class */}}
                >
                  Tambah Kelas
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardBody className="p-6">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : classes.length === 0 ? (
                <EmptyState
                  icon={School}
                  title="Belum Ada Kelas"
                  description="Mulai dengan membuat kelas pertama untuk sistem multi-subject."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((cls, index) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                        isPressable
                        onPress={() => navigate(`/admin/class/${cls.id}`)}
                      >
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
                          <div className="flex justify-between items-start w-full">
                            <div>
                              <h4 className="text-lg font-bold">{cls.name}</h4>
                              <p className="text-sm opacity-90">Tingkat {cls.gradeLevel}</p>
                            </div>
                            <Chip 
                              size="sm" 
                              className={getClassStatusColor(cls.studentCount, cls.subjects.length)}
                            >
                              {getClassStatusText(cls.studentCount, cls.subjects.length)}
                            </Chip>
                          </div>
                        </CardHeader>
                        <CardBody className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Siswa:</span>
                              <span className="font-semibold">{cls.studentCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Mata Pelajaran:</span>
                              <span className="font-semibold">{cls.subjects.length}</span>
                            </div>
                            
                            {cls.subjects.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">Mata Pelajaran:</p>
                                <div className="flex flex-wrap gap-1">
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
                            )}

                            <div className="flex gap-2 pt-3 border-t">
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Plus className="w-4 h-4" />}
                                onPress={() => {
                                  setSelectedClass(cls);
                                  onAddSubjectOpen();
                                }}
                              >
                                Subject
                              </Button>
                              <Button
                                size="sm"
                                color="secondary"
                                variant="flat"
                                startContent={<UserCheck className="w-4 h-4" />}
                                onPress={() => {
                                  setSelectedClass(cls);
                                  onAssignTeacherOpen();
                                }}
                              >
                                Guru
                              </Button>
                              <Button
                                size="sm"
                                color="default"
                                variant="flat"
                                startContent={<Edit className="w-4 h-4" />}
                              >
                                Detail
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Assignment</h3>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Buat Assignment Baru
                </Button>
              </div>
              <AssignmentManager />
            </div>
          )}

          {selectedTab === 'grades' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Nilai</h3>
                <Button
                  color="secondary"
                  startContent={<GraduationCap className="w-4 h-4" />}
                >
                  Export Nilai
                </Button>
              </div>
              <GradeManager />
            </div>
          )}

          {selectedTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen Absensi</h3>
                <Button
                  color="success"
                  startContent={<CalendarCheck className="w-4 h-4" />}
                >
                  Rekap Absensi
                </Button>
              </div>
              <AttendanceManager />
            </div>
          )}

          {selectedTab === 'approvals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Persetujuan Enrollment Siswa</h3>
                <Button
                  color="warning"
                  startContent={<UserPlus className="w-4 h-4" />}
                  onPress={onEnrollmentApprovalOpen}
                >
                  Lihat Semua Pending
                </Button>
              </div>

              {pendingEnrollments.filter(e => e.status === 'pending').length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="Tidak Ada Pending Enrollment"
                  description="Semua permintaan enrollment sudah diproses."
                />
              ) : (
                <div className="grid gap-4">
                  {pendingEnrollments
                    .filter(enrollment => enrollment.status === 'pending')
                    .map((enrollment) => (
                    <Card key={enrollment.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{enrollment.studentName}</h4>
                          <p className="text-sm text-gray-600">
                            {enrollment.className} • {enrollment.subjectName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Diajukan: {new Date(enrollment.requestDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleApproveEnrollment(enrollment.id)}
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleRejectEnrollment(enrollment.id)}
                          >
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Analytics & Reporting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Kelas</p>
                      <p className="text-2xl font-bold">{classes.length}</p>
                    </div>
                    <School className="w-8 h-8 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Siswa</p>
                      <p className="text-2xl font-bold">
                        {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Mata Pelajaran Aktif</p>
                      <p className="text-2xl font-bold">
                        {classes.reduce((sum, cls) => sum + cls.subjects.length, 0)}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Approval</p>
                      <p className="text-2xl font-bold">
                        {pendingEnrollments.filter(e => e.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Status Kelas</h4>
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium">{cls.name}</h5>
                        <p className="text-sm text-gray-600">
                          {cls.studentCount} siswa • {cls.subjects.length} mata pelajaran
                        </p>
                      </div>
                      <Chip 
                        size="sm" 
                        className={getClassStatusColor(cls.studentCount, cls.subjects.length)}
                      >
                        {getClassStatusText(cls.studentCount, cls.subjects.length)}
                      </Chip>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Subject Modal */}
      <Modal isOpen={isAddSubjectOpen} onClose={onAddSubjectClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Tambah Mata Pelajaran ke {selectedClass?.name}</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" className="w-full justify-start">
                        {newSubjectId 
                          ? subjects.find(s => s.id === newSubjectId)?.name 
                          : 'Pilih mata pelajaran'}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      selectedKeys={newSubjectId ? [newSubjectId] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setNewSubjectId(key);
                      }}
                    >
                      {subjects.map((subject) => (
                        <DropdownItem key={subject.id}>
                          {subject.name} ({subject.code})
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleAddSubjectToClass}
                  isDisabled={!newSubjectId}
                >
                  Tambah Subject
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal isOpen={isAssignTeacherOpen} onClose={onAssignTeacherClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Assign Guru ke {selectedClass?.name}</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Pilih Mata Pelajaran
                    </label>
                    <Select
                      placeholder="Pilih mata pelajaran"
                      selectedKeys={selectedSubjectForTeacher ? [selectedSubjectForTeacher] : []}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setSelectedSubjectForTeacher(key);
                      }}
                    >
                      {selectedClass?.subjects.map((subject) => (
                        <SelectItem key={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Pilih Guru
                    </label>
                    <Select
                      placeholder="Pilih guru"
                      selectedKeys={newTeacherId ? [newTeacherId] : []}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        setNewTeacherId(key);
                      }}
                    >
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id}>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{teacher.fullName}</p>
                              <p className="text-xs text-gray-500">{teacher.email}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {selectedSubjectForTeacher && newTeacherId && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Konfirmasi Assignment</h4>
                      <p className="text-sm text-blue-700">
                        Guru <strong>{teachers.find(t => t.id === newTeacherId)?.fullName}</strong> akan
                        mengajar mata pelajaran <strong>
                          {selectedClass?.subjects.find(s => s.id === selectedSubjectForTeacher)?.name}
                        </strong> di kelas <strong>{selectedClass?.name}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleAssignTeacherToSubject}
                  isDisabled={!newTeacherId || !selectedSubjectForTeacher}
                >
                  Assign Guru
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Enrollment Approval Modal */}
      <Modal isOpen={isEnrollmentApprovalOpen} onClose={onEnrollmentApprovalClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Semua Permintaan Enrollment</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pendingEnrollments.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">Tidak ada permintaan enrollment</p>
                    </div>
                  ) : (
                    pendingEnrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{enrollment.studentName}</h4>
                            <p className="text-sm text-gray-600">
                              {enrollment.className} • {enrollment.subjectName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Diajukan: {new Date(enrollment.requestDate).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip 
                              size="sm" 
                              color={
                                enrollment.status === 'approved' ? 'success' : 
                                enrollment.status === 'rejected' ? 'danger' : 'warning'
                              }
                              variant="flat"
                            >
                              {enrollment.status === 'approved' ? 'Disetujui' : 
                               enrollment.status === 'rejected' ? 'Ditolak' : 'Pending'}
                            </Chip>
                            {enrollment.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  onPress={() => handleApproveEnrollment(enrollment.id)}
                                >
                                  Setujui
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onPress={() => handleRejectEnrollment(enrollment.id)}
                                >
                                  Tolak
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminMultiSubjectDashboard;
