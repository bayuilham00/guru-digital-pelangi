// Assignment Detail Page with Student Tracking and Grading - Guru Digital Pelangi
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Avatar,
  Chip,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Tooltip,
  Badge,
  Divider
} from '@heroui/react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  Eye,
  Download,
  Upload,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  FileText,
  Filter,
  Search
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentService, classService, studentService } from '../../../services/expressApi';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  fullName: string;
  studentId: string;
  avatar?: string;
  submission?: {
    id: string;
    submittedAt: string;
    status: 'SUBMITTED' | 'GRADED' | 'LATE_SUBMITTED' | 'NOT_SUBMITTED' | 'submitted' | 'late' | 'missing';
    content?: string;
    attachments?: string[];
    grade?: number;
    feedback?: string;
    gradedAt?: string;
    gradedBy?: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  points: number;
  deadline: string;
  type: string;
  status: 'active' | 'overdue' | 'completed';
  createdAt: string;
  class: {
    id: string;
    name: string;
    subject?: {
      name: string;
    };
  };
  submissionStats: {
    total: number;
    submitted: number;
    graded: number;
    missing: number;
    late: number;
  };
}

interface SubmissionGrade {
  studentId: string;
  grade: number;
  feedback: string;
}

const AssignmentDetailPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { isOpen: isGradeModalOpen, onOpen: onGradeModalOpen, onClose: onGradeModalClose } = useDisclosure();
  const { isOpen: isSubmissionModalOpen, onOpen: onSubmissionModalOpen, onClose: onSubmissionModalClose } = useDisclosure();

  // State
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeForm, setGradeForm] = useState<SubmissionGrade>({
    studentId: '',
    grade: 0,
    feedback: ''
  });

  // Data Loading Functions
  const loadAssignmentDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await assignmentService.getAssignment(assignmentId!);
      if (response.success && response.data) {
        setAssignment(response.data);
      } else {
        toast.error('Gagal memuat detail tugas');
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      toast.error('Terjadi error saat memuat data tugas');
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  const loadStudents = useCallback(async () => {
    try {
      // Get class students with their submissions for this assignment
      const response = await assignmentService.getAssignmentSubmissions(assignmentId!);
      if (response.success && response.data) {
        setStudents(response.data.students);
        // Update assignment stats if available
        if (response.data.assignment.submissionStats) {
          setAssignment(prev => prev ? {
            ...prev,
            submissionStats: response.data.assignment.submissionStats
          } : prev);
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Gagal memuat data siswa');
    }
  }, [assignmentId]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      if (assignmentId) {
        await loadAssignmentDetail();
        await loadStudents();
      }
    };
    loadData();
  }, [assignmentId, loadAssignmentDetail, loadStudents]);

  // Handler Functions
  const handleGradeSubmission = (student: Student) => {
    setSelectedStudent(student);
    setGradeForm({
      studentId: student.id,
      grade: student.submission?.grade || 0,
      feedback: student.submission?.feedback || ''
    });
    onGradeModalOpen();
  };

  const handleSubmitGrade = async () => {
    if (!selectedStudent || !assignment) return;

    // Validate grade does not exceed assignment points
    if (gradeForm.grade > assignment.points) {
      toast.error(`Nilai tidak boleh melebihi ${assignment.points} poin`);
      return;
    }

    if (gradeForm.grade < 0) {
      toast.error('Nilai tidak boleh kurang dari 0');
      return;
    }

    setIsSaving(true);
    try {
      const response = await assignmentService.gradeSubmission(
        assignmentId!,
        selectedStudent.id,
        gradeForm
      );

      if (response.success) {
        toast.success('Nilai berhasil disimpan!');
        await loadStudents(); // Refresh data
        onGradeModalClose();
      } else {
        toast.error(response.error || 'Gagal menyimpan nilai');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Terjadi error saat menyimpan nilai');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewSubmission = (student: Student) => {
    setSelectedStudent(student);
    onSubmissionModalOpen();
  };

  const handleBulkGrade = async (grade: number) => {
    const submittedStudents = students.filter(s => s.submission?.status === 'submitted');
    
    if (submittedStudents.length === 0) {
      toast.error('Tidak ada tugas yang telah dikumpulkan');
      return;
    }

    if (!confirm(`Beri nilai ${grade} untuk ${submittedStudents.length} siswa yang sudah mengumpulkan?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await assignmentService.bulkGradeSubmissions(assignmentId!, {
        studentIds: submittedStudents.map(s => s.id),
        grade,
        feedback: `Nilai diberikan secara bulk: ${grade}/${assignment?.points || 100}`
      });

      if (response.success) {
        toast.success(`Berhasil memberi nilai ${submittedStudents.length} siswa`);
        await loadStudents();
      } else {
        toast.error('Gagal memberikan nilai bulk');
      }
    } catch (error) {
      console.error('Error bulk grading:', error);
      toast.error('Terjadi error saat memberikan nilai bulk');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper Functions
  const getSubmissionStatusColor = (status?: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'submitted': return 'success';
      case 'GRADED': return 'success';
      case 'LATE':
      case 'late': return 'warning';
      case 'NOT_SUBMITTED':
      case 'missing': return 'danger';
      default: return 'default';
    }
  };

  const getSubmissionStatusText = (status?: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'submitted': return 'Sudah Mengumpulkan';
      case 'GRADED': return 'Sudah Dinilai';
      case 'LATE_SUBMITTED':
      case 'LATE':
      case 'late': return 'Terlambat';
      case 'NOT_SUBMITTED':
      case 'missing': return 'Belum Mengumpulkan';
      default: return 'Tidak Diketahui';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'submitted' && (student.submission?.status === 'SUBMITTED' || student.submission?.status === 'submitted' || student.submission?.status === 'GRADED')) ||
                         (statusFilter === 'missing' && (!student.submission || student.submission?.status === 'NOT_SUBMITTED' || student.submission?.status === 'missing')) ||
                         (statusFilter === 'graded' && (student.submission?.status === 'GRADED' || student.submission?.grade !== undefined));

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = assignment && new Date(assignment.deadline) < new Date();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tugas Tidak Ditemukan</h3>
        <p className="text-gray-600 mb-4">Tugas yang Anda cari tidak dapat ditemukan.</p>
        <Button color="primary" onPress={() => navigate('/assignments')}>
          Kembali ke Daftar Tugas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            isIconOnly
            variant="flat"
            onPress={() => navigate('/assignments')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600">{assignment.class.name} - {assignment.class.subject?.name}</p>
          </div>
        </motion.div>

        {/* Assignment Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardBody className="text-center">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-semibold">{formatDate(assignment.deadline)}</p>
                {isOverdue && (
                  <Chip size="sm" color="danger" variant="flat" className="mt-2">
                    Terlambat
                  </Chip>
                )}
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardBody className="text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Telah Mengumpulkan</p>
                <p className="font-semibold">
                  {assignment.submissionStats.submitted} / {assignment.submissionStats.total}
                </p>
                <Progress
                  value={(assignment.submissionStats.submitted / assignment.submissionStats.total) * 100}
                  size="sm"
                  color="success"
                  className="mt-2"
                />
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardBody className="text-center">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Telah Dinilai</p>
                <p className="font-semibold">
                  {assignment.submissionStats.graded} / {assignment.submissionStats.submitted}
                </p>
                <Progress
                  value={assignment.submissionStats.submitted > 0 
                    ? (assignment.submissionStats.graded / assignment.submissionStats.submitted) * 100 
                    : 0}
                  size="sm"
                  color="secondary"
                  className="mt-2"
                />
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardBody className="text-center">
                <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nilai Maksimal</p>
                <p className="font-semibold">{assignment.points} Poin</p>
                <Chip size="sm" color="primary" variant="flat" className="mt-2">
                  {assignment.type}
                </Chip>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Card>
          <CardBody>
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-blue-500",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-blue-500"
              }}
            >
              <Tab
                key="overview"
                title={
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                }
              >
                <div className="py-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Deskripsi Tugas</h3>
                    <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
                  </div>

                  {assignment.instructions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Instruksi</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {assignment.instructions}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Statistik Pengumpulan</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sudah Mengumpulkan:</span>
                          <Badge color="success" variant="flat">
                            {assignment.submissionStats.submitted} siswa
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Belum Mengumpulkan:</span>
                          <Badge color="danger" variant="flat">
                            {assignment.submissionStats.missing} siswa
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Terlambat:</span>
                          <Badge color="warning" variant="flat">
                            {assignment.submissionStats.late} siswa
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button
                          color="success"
                          variant="flat"
                          startContent={<Award className="w-4 h-4" />}
                          onPress={() => handleBulkGrade(assignment.points)}
                          isDisabled={assignment.submissionStats.submitted === 0}
                          className="w-full justify-start"
                        >
                          Beri Nilai Penuh Semua
                        </Button>
                        <Button
                          color="warning"
                          variant="flat"
                          startContent={<Award className="w-4 h-4" />}
                          onPress={() => handleBulkGrade(Math.floor(assignment.points * 0.8))}
                          isDisabled={assignment.submissionStats.submitted === 0}
                          className="w-full justify-start"
                        >
                          Beri Nilai 80% Semua
                        </Button>
                        <Button
                          color="primary"
                          variant="flat"
                          startContent={<Download className="w-4 h-4" />}
                          className="w-full justify-start"
                        >
                          Download Laporan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab
                key="submissions"
                title={
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Pengumpulan Siswa</span>
                    <Badge size="sm" color="primary">
                      {assignment.submissionStats.total}
                    </Badge>
                  </div>
                }
              >
                <div className="py-6 space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <Input
                      placeholder="Cari siswa..."
                      startContent={<Search className="w-4 h-4 text-gray-400" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="md:w-80"
                    />
                    <Select
                      placeholder="Filter Status"
                      selectedKeys={statusFilter ? [statusFilter] : []}
                      onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                      className="md:w-48"
                      startContent={<Filter className="w-4 h-4" />}
                    >
                      <SelectItem key="all">Semua Status</SelectItem>
                      <SelectItem key="submitted">Sudah Mengumpulkan</SelectItem>
                      <SelectItem key="missing">Belum Mengumpulkan</SelectItem>
                      <SelectItem key="graded">Sudah Dinilai</SelectItem>
                    </Select>
                  </div>

                  {/* Students Table */}
                  <Table aria-label="Submissions table">
                    <TableHeader>
                      <TableColumn>SISWA</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>TANGGAL PENGUMPULAN</TableColumn>
                      <TableColumn>NILAI</TableColumn>
                      <TableColumn>AKSI</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={student.avatar}
                                name={student.fullName}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">{student.fullName}</p>
                                <p className="text-sm text-gray-500">{student.studentId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={getSubmissionStatusColor(student.submission?.status)}
                              variant="flat"
                            >
                              {getSubmissionStatusText(student.submission?.status)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {student.submission?.submittedAt ? (
                              <div>
                                <p className="text-sm">
                                  {formatDate(student.submission.submittedAt)}
                                </p>
                                {student.submission.status === 'late' && (
                                  <p className="text-xs text-orange-600">Terlambat</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.submission?.grade !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Badge
                                  color={student.submission.grade >= assignment.points * 0.8 ? 'success' : 
                                         student.submission.grade >= assignment.points * 0.6 ? 'warning' : 'danger'}
                                  variant="flat"
                                >
                                  {student.submission.grade}/{assignment.points}
                                </Badge>
                                {student.submission.grade === assignment.points && (
                                  <Star className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            ) : student.submission ? (
                              <span className="text-gray-400">Belum dinilai</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {student.submission && (
                                <Tooltip content="Lihat Pengumpulan">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    onPress={() => handleViewSubmission(student)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              )}
                              {student.submission && (
                                <Tooltip content="Beri Nilai">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    onPress={() => handleGradeSubmission(student)}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* Grade Modal */}
        <Modal isOpen={isGradeModalOpen} onClose={onGradeModalClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Beri Nilai - {selectedStudent?.fullName}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nilai"
                    type="number"
                    min="0"
                    max={assignment.points.toString()}
                    value={gradeForm.grade.toString()}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const clampedValue = Math.max(0, Math.min(value, assignment.points));
                      setGradeForm({
                        ...gradeForm,
                        grade: clampedValue
                      });
                    }}
                    endContent={<span className="text-sm text-gray-500">/ {assignment.points}</span>}
                    description={gradeForm.grade > assignment.points ? 
                      `Nilai maksimum adalah ${assignment.points} poin` : 
                      gradeForm.grade === assignment.points ? 'Nilai sempurna!' : ''
                    }
                    color={gradeForm.grade > assignment.points ? 'danger' : 'default'}
                  />
                  <div className="flex items-end">
                    <Progress
                      value={(gradeForm.grade / assignment.points) * 100}
                      color={gradeForm.grade >= assignment.points * 0.8 ? 'success' : 
                             gradeForm.grade >= assignment.points * 0.6 ? 'warning' : 'danger'}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Textarea
                  label="Feedback"
                  placeholder="Berikan feedback untuk siswa..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({
                    ...gradeForm,
                    feedback: e.target.value
                  })}
                  minRows={3}
                />

                {/* Quick Grade Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setGradeForm({
                      ...gradeForm,
                      grade: assignment.points
                    })}
                  >
                    Nilai Penuh ({assignment.points})
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setGradeForm({
                      ...gradeForm,
                      grade: Math.floor(assignment.points * 0.9)
                    })}
                  >
                    90% ({Math.floor(assignment.points * 0.9)})
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setGradeForm({
                      ...gradeForm,
                      grade: Math.floor(assignment.points * 0.8)
                    })}
                  >
                    80% ({Math.floor(assignment.points * 0.8)})
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setGradeForm({
                      ...gradeForm,
                      grade: Math.floor(assignment.points * 0.7)
                    })}
                  >
                    70% ({Math.floor(assignment.points * 0.7)})
                  </Button>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onGradeModalClose}>
                Batal
              </Button>
              <Button
                color="primary"
                onPress={handleSubmitGrade}
                isLoading={isSaving}
                startContent={!isSaving ? <Save className="w-4 h-4" /> : null}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Nilai'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Submission View Modal */}
        <Modal isOpen={isSubmissionModalOpen} onClose={onSubmissionModalClose} size="3xl">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Pengumpulan - {selectedStudent?.fullName}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedStudent?.submission && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status Pengumpulan</p>
                      <Chip
                        color={getSubmissionStatusColor(selectedStudent.submission.status)}
                        variant="flat"
                      >
                        {getSubmissionStatusText(selectedStudent.submission.status)}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Waktu Pengumpulan</p>
                      <p className="font-medium">
                        {formatDate(selectedStudent.submission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Konten Pengumpulan</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {selectedStudent.submission.content || 'Tidak ada konten tertulis'}
                      </p>
                    </div>
                  </div>

                  {selectedStudent.submission.attachments && selectedStudent.submission.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Lampiran</p>
                      <div className="space-y-2">
                        {selectedStudent.submission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="flex-1">{attachment}</span>
                            <Button size="sm" variant="flat" startContent={<Download className="w-4 h-4" />}>
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedStudent.submission.grade !== undefined && (
                    <>
                      <Divider />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Penilaian</p>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-4 mb-2">
                            <Badge
                              color={selectedStudent.submission.grade >= assignment.points * 0.8 ? 'success' : 
                                     selectedStudent.submission.grade >= assignment.points * 0.6 ? 'warning' : 'danger'}
                              variant="flat"
                              size="lg"
                            >
                              {selectedStudent.submission.grade}/{assignment.points}
                            </Badge>
                            <Progress
                              value={(selectedStudent.submission.grade / assignment.points) * 100}
                              color={selectedStudent.submission.grade >= assignment.points * 0.8 ? 'success' : 
                                     selectedStudent.submission.grade >= assignment.points * 0.6 ? 'warning' : 'danger'}
                              className="flex-1"
                            />
                          </div>
                          {selectedStudent.submission.feedback && (
                            <div>
                              <p className="text-sm text-gray-600">Feedback:</p>
                              <p className="text-gray-700">{selectedStudent.submission.feedback}</p>
                            </div>
                          )}
                          {selectedStudent.submission.gradedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Dinilai pada {formatDate(selectedStudent.submission.gradedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onSubmissionModalClose}>
                Tutup
              </Button>
              {selectedStudent?.submission && (
                <Button
                  color="primary"
                  onPress={() => {
                    onSubmissionModalClose();
                    handleGradeSubmission(selectedStudent);
                  }}
                  startContent={<Edit3 className="w-4 h-4" />}
                >
                  Beri Nilai
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
