// Modern Assignment Management Component - Guru Digital Pelangi
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip
} from '@heroui/react';
import {
  Plus,
  Search,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import EmptyState from '../../common/EmptyState';
import AssignmentModal from './AssignmentModal';
import AssignmentCard from './AssignmentCard';
import { assignmentService, classService } from '../../../services/expressApi';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  description: string;
  className: string;
  deadline: string;
  points: number;
  status: 'DRAFT' | 'ACTIVE' | 'PUBLISHED' | 'CLOSED' | 'COMPLETED' | 'OVERDUE';
  submissionsCount: number;
  totalStudents: number;
  gradedCount?: number;
  class?: {
    id: string;
    name: string;
    subject?: {
      name: string;
      color?: string;
    };
    teacher?: {
      name: string;
      avatar?: string;
    };
  };
}

interface Class {
  id: string;
  name: string;
  subject?: {
    name: string;
  };
}

interface AssignmentStats {
  total: number;
  active: number;
  overdue: number;
  completed: number;
  thisWeek: number;
  averagePoints: number;
}

const AssignmentManager: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    active: 0,
    overdue: 0,
    completed: 0,
    thisWeek: 0,
    averagePoints: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const loadClasses = async () => {
    const response = await classService.getClasses();
    if (response.success && response.data) {
      setClasses(response.data);
    }
  };

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    const params: Record<string, string> = {};
    if (selectedClass) params.classId = selectedClass;
    if (searchTerm) params.search = searchTerm;

    const response = await assignmentService.getAssignments(params);
    if (response.success && response.data) {
      setAssignments(response.data.assignments.map((assignment: Assignment) => ({
        ...assignment,
        className: assignment.class?.name || 'Unknown Class',
        gradedCount: assignment.gradedCount || 0
      })));
    }
    setIsLoading(false);
  }, [selectedClass, searchTerm]);

  // Load data on component mount
  useEffect(() => {
    loadClasses();
    loadAssignments();
    loadStats();
  }, [loadAssignments]);

  // Reload assignments when filters change
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const loadStats = async () => {
    const response = await assignmentService.getAssignmentStats();
    console.log('Assignment stats response:', response);
    if (response.success && response.data) {
      // Map backend data to frontend format
      setStats({
        total: response.data.totalAssignments || 0,
        active: response.data.totalSubmitted || 0,
        overdue: response.data.totalNotSubmitted || 0,
        completed: response.data.totalGraded || 0,
        thisWeek: response.data.totalSubmissions || 0, // Show total submissions
        averagePoints: Math.round(((response.data.totalGraded || 0) / (response.data.totalSubmissions || 1)) * 100) || 0 // Show completion percentage
      });
    } else {
      console.error('Failed to load assignment stats:', response);
    }
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = async (assignment: Assignment) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tugas "${assignment.title}"?`)) {
      const response = await assignmentService.deleteAssignment(assignment.id);
      if (response.success) {
        loadAssignments();
        loadStats();
      } else {
        alert(response.error || 'Gagal menghapus tugas');
      }
    }
  };

  const handleViewDetail = (assignment: Assignment) => {
    navigate(`/assignments/${assignment.id}`);
  };

  const handleModalSuccess = () => {
    loadAssignments();
    loadStats();
    setIsModalOpen(false);
  };

  const handleRefresh = () => {
    loadAssignments();
    loadStats();
  };

  // Filter assignments (filtering is now done on server side, but keep for client-side sorting)
  const filteredAssignments = assignments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">📝 Tugas</h1>
                <p className="text-purple-200 mt-1">Kelola semua tugas dan aktivitas pembelajaran siswa</p>
              </div>
            <div className="flex gap-3">
              <Button
                variant="flat"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={handleRefresh}
              >
                Refresh
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                startContent={<Plus className="w-4 h-4" />}
                onPress={handleCreate}
              >
                Buat Tugas Baru
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Cari tugas berdasarkan judul atau deskripsi..."
                aria-label="Cari tugas berdasarkan judul atau deskripsi"
                startContent={<Search className="w-4 h-4 text-purple-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                classNames={{
                  input: "text-white placeholder:text-purple-300",
                  inputWrapper: "bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50"
                }}
              />
              <Select
                placeholder="Semua Kelas"
                className="md:w-48"
                selectedKeys={selectedClass ? [selectedClass] : []}
                onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0] as string)}
                classNames={{
                  trigger: "bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-white",
                  popoverContent: "bg-black/80 backdrop-blur-xl border border-white/20"
                }}
              >
                <SelectItem key="" value="">Semua Kelas</SelectItem>
                {classes.map((cls) => (
                  <SelectItem 
                    key={cls.id}
                    value={cls.id}
                    textValue={`${cls.name}${cls.subject?.name ? ` - ${cls.subject.name}` : ''}`}
                    className="text-white hover:bg-white/10"
                  >
                    {cls.name} {cls.subject?.name ? `- ${cls.subject.name}` : ''}
                  </SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Urutkan: Deadline"
                className="md:w-48"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                classNames={{
                  trigger: "bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-white",
                  popoverContent: "bg-black/80 backdrop-blur-xl border border-white/20"
                }}
              >
                <SelectItem key="deadline" className="text-white hover:bg-white/10">Urutkan: Deadline</SelectItem>
                <SelectItem key="title" className="text-white hover:bg-white/10">Urutkan: Judul</SelectItem>
                <SelectItem key="points" className="text-white hover:bg-white/10">Urutkan: Poin</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Statistics Cards - Quick Actions Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="assignment-stats-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 0 * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="group cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="glassmorphism-card">
              <motion.div 
                className="floating-icon text-cyan-400"
                whileHover={{ 
                  rotate: [0, -3, 3, 0],
                  scale: 1.15 
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <FileText className="w-8 h-8 mx-auto mb-2" />
              </motion.div>
              <motion.div className="action-label">
                <p className="text-2xl font-bold text-white mb-1">{stats.total}</p>
                <p className="text-sm text-cyan-300">Total Tugas</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 1 * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="group cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="glassmorphism-card">
              <motion.div 
                className="floating-icon text-green-400"
                whileHover={{ 
                  rotate: [0, -3, 3, 0],
                  scale: 1.15 
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              </motion.div>
              <motion.div className="action-label">
                <p className="text-2xl font-bold text-white mb-1">{stats.active}</p>
                <p className="text-sm text-green-300">Dikumpulkan</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 2 * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="group cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="glassmorphism-card">
              <motion.div 
                className="floating-icon text-red-400"
                whileHover={{ 
                  rotate: [0, -3, 3, 0],
                  scale: 1.15 
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              </motion.div>
              <motion.div className="action-label">
                <p className="text-2xl font-bold text-white mb-1">{stats.overdue}</p>
                <p className="text-sm text-red-300">Belum Dikumpulkan</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 3 * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="group cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="glassmorphism-card">
              <motion.div 
                className="floating-icon text-purple-400"
                whileHover={{ 
                  rotate: [0, -3, 3, 0],
                  scale: 1.15 
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              </motion.div>
              <motion.div className="action-label">
                <p className="text-2xl font-bold text-white mb-1">{stats.completed}</p>
                <p className="text-sm text-purple-300">Sudah Dinilai</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 4 * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="group cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="glassmorphism-card">
              <motion.div 
                className="floating-icon text-orange-400"
                whileHover={{ 
                  rotate: [0, -3, 3, 0],
                  scale: 1.15 
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <Calendar className="w-8 h-8 mx-auto mb-2" />
              </motion.div>
              <motion.div className="action-label">
                <p className="text-2xl font-bold text-white mb-1">{stats.thisWeek}</p>
                <p className="text-sm text-orange-300">Total Pengumpulan</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 5 * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="group cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="glassmorphism-card">
              <motion.div 
                className="floating-icon text-indigo-400"
                whileHover={{ 
                  rotate: [0, -3, 3, 0],
                  scale: 1.15 
                }}
                transition={{ 
                  rotate: { duration: 0.6, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <Award className="w-8 h-8 mx-auto mb-2" />
              </motion.div>
              <motion.div className="action-label">
                <p className="text-2xl font-bold text-white mb-1">{stats.averagePoints}%</p>
                <p className="text-sm text-indigo-300">Persentase Dinilai</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Assignment List Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">📚 Daftar Tugas</h3>
            </div>
            <p className="text-sm text-purple-300">
              Menampilkan {filteredAssignments.length} dari {assignments.length} tugas
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Assignment Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {isLoading ? (
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
            <CardBody className="p-12">
              <div className="flex justify-center items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin animate-reverse delay-150"></div>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : filteredAssignments.length === 0 ? (
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
            <CardBody className="p-8">
              <EmptyState
                icon={FileText}
                title="Belum ada tugas"
                description="Mulai dengan membuat tugas pertama untuk memberikan penilaian dan latihan kepada siswa"
                actionLabel="Buat Tugas Pertama"
                onAction={handleCreate}
                actionColor="primary"
              />
            </CardBody>
          </Card>
        ) : (
          <div className="assignment-grid">
            {filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <AssignmentCard
                  assignment={{
                    ...assignment,
                    teacher: assignment.class?.teacher ? {
                      name: assignment.class.teacher.name,
                      avatar: assignment.class.teacher.avatar
                    } : undefined,
                    subject: assignment.class?.subject ? {
                      name: assignment.class.subject.name,
                      color: assignment.class.subject.color || '#3B82F6'
                    } : undefined,
                    submissions: {
                      total: assignment.totalStudents || 0,
                      submitted: assignment.submissionsCount || 0,
                      graded: assignment.gradedCount || 0
                    }
                  }}
                  onView={handleViewDetail}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCopy={(assignment) => {
                    // Handle copy functionality
                    console.log('Copy assignment:', assignment.id);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        assignment={editingAssignment}
        initialClassId={selectedClass}
      />
      </div>
    </div>
  );
};

export default AssignmentManager;