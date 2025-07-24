// StudentManager.tsx - Main component yang sudah dipecah menjadi komponen-komponen kecil
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  Button, 
  useDisclosure,
  Pagination,
  addToast,
  cn,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react';
import { Plus, Upload, Users, GraduationCap, BookOpen, Search, ChevronDown } from 'lucide-react';
import { studentService } from '../../../services/studentService';
import { classService } from '../../../services/classService';
import { Student } from '../../../services/types';

// Import komponen yang sudah dipecah
import StudentTable from './StudentTable';
import StudentFormModal from './StudentFormModal';
import StudentProfileModal from './StudentProfileModal';
import useStudentTableControls from './StudentTableControls';
import BulkImportModal from './BulkImportModal';
import BulkAssignClassModal from './BulkAssignClassModal';

// Interface
interface Class {
  id: string;
  name: string;
  gradeLevel?: string;
}

interface StudentFormData {
  studentId: string;
  fullName: string;
  email: string;
  classId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  asalSekolah: string;
  kecamatan: string;
  desaKelurahan: string;
  status: string;
}

const INITIAL_VISIBLE_COLUMNS = ["name", "class", "status", "level", "actions"];
const statusOptions = [
  { name: "Aktif", uid: "ACTIVE" },
  { name: "Nonaktif", uid: "INACTIVE" },
  { name: "Lulus", uid: "GRADUATED" },
];

// Helper function to format date for HTML input
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return '';
  }
};

const StudentManager: React.FC = () => {
  // Toast notification helper
  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, description: string, actions?: React.ReactNode) => {
    const colorMap = {
      success: 'success',
      error: 'danger', 
      warning: 'warning',
      info: 'primary'
    };

    const iconMap = {
      success: 'border-l-success',
      error: 'border-l-danger',
      warning: 'border-l-warning', 
      info: 'border-l-primary'
    };

    addToast({
      title,
      description,
      classNames: {
        base: cn([
          "bg-default-50 dark:bg-background shadow-sm",
          "border border-l-8 rounded-md rounded-l-none",
          "flex flex-col items-start",
          `border-${colorMap[type]}-200 dark:border-${colorMap[type]}-100 ${iconMap[type]}`,
        ]),
        icon: "w-6 h-6 fill-current",
      },
      endContent: actions,
      color: colorMap[type] as 'success' | 'danger' | 'warning' | 'primary',
    });
  }, []);

  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  
  // Search and filter state
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 
  const [classFilter, setClassFilter] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Advanced table state
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'fullName',
    direction: 'ascending' as 'ascending' | 'descending'
  });

  // Search function
  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  // Clear search function
  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  // Filter functions
  const hasSearchFilter = Boolean(filterValue);

  // Filter students based on search and other filters
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Search filter
    if (hasSearchFilter) {
      filtered = filtered.filter((student) =>
        student.fullName.toLowerCase().includes(filterValue.toLowerCase()) ||
        student.username.toLowerCase().includes(filterValue.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(filterValue.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "") {
      filtered = filtered.filter((student) => 
        statusFilter === "all" || student.status === statusFilter
      );
    }

    // Class filter
    if (classFilter && classFilter !== "") {
      filtered = filtered.filter((student) => 
        classFilter === "all" || student.classId === classFilter
      );
    }

    return filtered;
  }, [students, filterValue, statusFilter, classFilter, hasSearchFilter]);

  // Pagination
  const pages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isBulkImportOpen, onOpen: onBulkImportOpen, onClose: onBulkImportClose } = useDisclosure();
  const { isOpen: isBulkAssignOpen, onOpen: onBulkAssignOpen, onClose: onBulkAssignClose } = useDisclosure();
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState<StudentFormData>({
    studentId: '',
    fullName: '',
    email: '',
    classId: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    asalSekolah: '',
    kecamatan: '',
    desaKelurahan: '',
    status: 'ACTIVE'
  });

  // Data loading functions
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    const response = await studentService.getStudents();
    if (response.success && response.data) {
      setStudents(response.data);
    }
    setIsLoading(false);
  }, []);

  const loadClasses = useCallback(async () => {
    const response = await classService.getClasses();
    if (response.success && response.data) {
      setClasses(response.data);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, [loadStudents, loadClasses]);

  // Add sorted items based on pagination
  const sortedItems = useMemo(() => {
    return [...paginatedStudents].sort((a: Student, b: Student) => {
      let first, second;
      
      switch (sortDescriptor.column) {
        case 'fullName':
          first = a.fullName;
          second = b.fullName;
          break;
        case 'studentId':
          first = a.studentId;
          second = b.studentId;
          break;
        case 'class':
          first = a.class?.name || '';
          second = b.class?.name || '';
          break;
        case 'status':
          first = a.status;
          second = b.status;
          break;
        default:
          first = a.fullName;
          second = b.fullName;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [paginatedStudents, sortDescriptor]);

  // Event handlers
  const handleCreate = useCallback(() => {
    setSelectedStudent(null);
    setIsEditing(false);
    setFormData({
      studentId: '',
      fullName: '',
      email: '',
      classId: classes.length > 0 ? classes[0].id : '',
      dateOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      asalSekolah: '',
      kecamatan: '',
      desaKelurahan: '',
      status: 'ACTIVE'
    });
    onOpen();
  }, [classes, onOpen]);

  const handleEdit = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    setFormData({
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email || '',
      classId: student.classId || '',
      dateOfBirth: formatDateForInput(student.dateOfBirth),
      gender: student.gender || '',
      address: student.address || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      asalSekolah: student.asalSekolah || '',
      kecamatan: student.kecamatan || '',
      desaKelurahan: student.desaKelurahan || '',
      status: student.status
    });
    onOpen();
  }, [onOpen]);

  const handleSave = async () => {
    try {
      console.log('🔄 handleSave called, isEditing:', isEditing);
      const dataToSave = {
        ...formData,
        gender: formData.gender as 'L' | 'P',
        status: formData.status as 'ACTIVE' | 'INACTIVE'
      };
      console.log('📤 Data to save:', dataToSave);

      if (isEditing && selectedStudent) {
        const response = await studentService.updateStudent(selectedStudent.id, dataToSave);
        console.log('📥 Update response:', response);
        if (response.success) {
          console.log('✅ Update successful, calling loadStudents and toast');
          loadStudents();
          onClose();
          showToast('success', 'Siswa berhasil diupdate!', '', null);
        } else {
          console.log('❌ Update failed:', response.error);
          showToast('error', 'Gagal update siswa', response.error || 'Terjadi kesalahan', null);
        }
      } else {
        const response = await studentService.createStudent(dataToSave);
        console.log('📥 Create response:', response);
        if (response.success) {
          console.log('✅ Create successful, calling loadStudents and toast');
          loadStudents();
          onClose();
          showToast('success', 'Siswa berhasil dibuat!', '', null);
        } else {
          console.log('❌ Create failed:', response.error);
          showToast('error', 'Gagal membuat siswa', response.error || 'Terjadi kesalahan', null);
        }
      }
    } catch (error) {
      console.error('💥 Save error:', error);
      showToast('error', 'Terjadi error saat menyimpan data', '', null);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        const response = await studentService.deleteStudent(id);
        if (response.success) {
          loadStudents();
          showToast('success', 'Siswa berhasil dihapus!', '', null);
        } else {
          showToast('error', 'Gagal menghapus siswa', response.error || 'Terjadi kesalahan', null);
        }
      } catch (error) {
        console.error('Delete error:', error);
        showToast('error', 'Terjadi error saat menghapus data', '', null);
      }
    }
  }, [loadStudents, showToast]);

  const handleBulkDelete = useCallback(async () => {
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    const selectedIds = Array.from(keysSet).filter(key => key !== 'all');
    
    if (selectedIds.length === 0) {
      alert('Pilih siswa yang ingin dihapus terlebih dahulu');
      return;
    }

    const confirmMessage = `Apakah Anda yakin ingin menghapus ${selectedIds.length} siswa yang dipilih?`;
    if (confirm(confirmMessage)) {
      try {
        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
          try {
            const response = await studentService.deleteStudent(id as string);
            if (response.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        setSelectedKeys(new Set());
        loadStudents();
        
        if (successCount > 0 && errorCount === 0) {
          showToast('success', `${successCount} siswa berhasil dihapus!`, '', null);
        } else if (successCount > 0 && errorCount > 0) {
          showToast('warning', `${successCount} siswa berhasil dihapus, ${errorCount} gagal dihapus.`, '', null);
        } else {
          showToast('error', 'Gagal menghapus siswa yang dipilih.', '', null);
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        showToast('error', 'Terjadi error saat menghapus data', '', null);
      }
    }
  }, [selectedKeys, loadStudents, showToast]);

  const handleBulkAssignClass = useCallback(async (classId: string) => {
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    const selectedIds = Array.from(keysSet).filter(key => key !== 'all');
    
    if (selectedIds.length === 0) {
      showToast('warning', 'Peringatan', 'Pilih siswa yang ingin di-assign terlebih dahulu');
      return;
    }

    try {
      console.log('🔄 Starting bulk assign class:', {
        studentIds: selectedIds,
        classId,
        count: selectedIds.length
      });

      // Use the new bulk assign API for better performance and reliability
      const response = await studentService.bulkAssignClass(selectedIds as string[], classId);
      
      if (response.success && response.data) {
        console.log('✅ Bulk assign successful:', response.data);
        
        // Clear selection after assign
        setSelectedKeys(new Set());
        
        // Reload data to reflect changes
        await loadStudents();
        
        // Success notification will be handled by modal callback
      } else {
        console.error('❌ Bulk assign failed:', response.error);
        // Throw error to be caught and handled by modal
        throw new Error(response.error || 'Gagal mengassign siswa yang dipilih.');
      }
    } catch (error) {
      console.error('❌ Bulk assign error:', error);
      // Re-throw error to be handled by modal
      throw error;
    }
  }, [selectedKeys, loadStudents, showToast]);

  const handleOpenBulkAssign = useCallback(() => {
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    const selectedIds = Array.from(keysSet).filter(key => key !== 'all');
    
    if (selectedIds.length === 0) {
      showToast('warning', 'Peringatan', 'Pilih siswa yang ingin di-assign terlebih dahulu');
      return;
    }
    
    onBulkAssignOpen();
  }, [selectedKeys, onBulkAssignOpen, showToast]);

  const handleRowClick = useCallback((student: Student) => {
    setProfileStudent(student);
    onProfileOpen();
  }, [onProfileOpen]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Callback functions untuk table controls
  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Get table controls
  const { topContent } = useStudentTableControls({
    searchTerm: filterValue,
    selectedKeys,
    statusFilter: new Set(statusFilter ? [statusFilter] : []),
    visibleColumns,
    classes,
    selectedClass: classFilter,
    filteredItemsLength: filteredStudents.length,
    itemsPerPage,
    onSearchChange,
    onClear,
    onStatusFilterChange: (keys) => {
      const selected = Array.from(keys)[0];
      setStatusFilter(selected === "all" ? "" : selected);
    },
    onVisibleColumnsChange: setVisibleColumns,
    onClassChange: setClassFilter,
    onRowsPerPageChange,
    onBulkDelete: handleBulkDelete,
    onBulkAssignClass: handleOpenBulkAssign,
    onClearSelection: () => setSelectedKeys(new Set())
  });

  // Bottom content for pagination
  const bottomContent = useMemo(() => {
    return pages > 1 ? (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow={false}
          color="primary"
          page={currentPage}
          total={pages}
          onChange={setCurrentPage}
          classNames={{
            wrapper: "gap-0 overflow-visible h-8 rounded border border-white/20",
            item: "w-8 h-8 text-small rounded-none bg-transparent text-white/60 hover:text-white hover:bg-white/10",
            cursor: "bg-blue-500 shadow-lg from-blue-500 to-blue-600 text-white font-bold",
            prev: "text-white/60 hover:text-white hover:bg-white/10",
            next: "text-white/60 hover:text-white hover:bg-white/10"
          }}
        />
      </div>
    ) : null;
  }, [currentPage, pages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Manajemen Siswa</h1>
              <p className="text-gray-300">Kelola data siswa dan informasi akademik</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="bordered"
              startContent={<Upload className="w-4 h-4" />}
              onPress={onBulkImportOpen}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Bulk Import
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleCreate}
            >
              Tambah Siswa
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari berdasarkan nama atau NISN..."
              startContent={<Users className="w-4 h-4 text-gray-400" />}
              value={filterValue}
              onValueChange={onSearchChange}
              classNames={{
                input: "bg-white/10 text-white placeholder:text-gray-400",
                inputWrapper: "bg-white/10 border-white/20 hover:border-white/30 focus-within:border-blue-500"
              }}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="GRADUATED">Lulus</option>
            </select>
            <select 
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{students.length}</p>
                <p className="text-sm text-cyan-400 font-medium">Total Siswa</p>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{students.filter(s => s.status === 'ACTIVE').length}</p>
                <p className="text-sm text-green-400 font-medium">Aktif</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{students.filter(s => s.status === 'INACTIVE').length}</p>
                <p className="text-sm text-red-400 font-medium">Nonaktif</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs">✗</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{students.filter(s => s.status === 'GRADUATED').length}</p>
                <p className="text-sm text-purple-400 font-medium">Lulus</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{classes.length}</p>
                <p className="text-sm text-orange-400 font-medium">Total Kelas</p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {students.length > 0 ? Math.round((students.filter(s => s.status === 'ACTIVE').length / students.length) * 100) : 0}%
                </p>
                <p className="text-sm text-blue-400 font-medium">Persentase Aktif</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="text-xl font-bold text-white">Daftar Siswa</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Menampilkan {sortedItems.length} dari {students.length} siswa
            </p>
          </div>

          {/* Student Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
          >
            <StudentTable
              students={sortedItems}
              selectedKeys={selectedKeys}
              visibleColumns={visibleColumns}
              sortDescriptor={sortDescriptor}
              isLoading={isLoading}
              topContent={topContent}
              bottomContent={bottomContent}
              onSelectionChange={(keys) => {
                if (keys === "all") {
                  const allItemIds = new Set(sortedItems.map(item => item.id));
                  setSelectedKeys(allItemIds);
                } else if (keys instanceof Set) {
                  const stringSet = new Set(Array.from(keys).map(key => String(key)));
                  setSelectedKeys(stringSet);
                } else {
                  const keySet = new Set(Array.isArray(keys) ? keys : [keys]);
                  setSelectedKeys(keySet as Set<string>);
                }
              }}
              onSortChange={(descriptor) => setSortDescriptor({
                column: String(descriptor.column),
                direction: descriptor.direction as "ascending" | "descending"
              })}
              onRowAction={(key) => {
                const student = sortedItems.find(item => item.id === key);
                if (student) {
                  handleRowClick(student);
                }
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
            />
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isOpen}
        isEditing={isEditing}
        formData={formData}
        classes={classes}
        onClose={onClose}
        onSave={handleSave}
        onFormChange={handleFormChange}
      />

      <StudentProfileModal
        isOpen={isProfileOpen}
        student={profileStudent}
        onClose={onProfileClose}
        onEdit={handleEdit}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={onBulkImportClose}
        onSuccess={() => {
          loadStudents();
          onBulkImportClose();
        }}
      />

      <BulkAssignClassModal
        isOpen={isBulkAssignOpen}
        selectedStudents={sortedItems.filter(student => 
          selectedKeys instanceof Set && selectedKeys.has(student.id)
        )}
        classes={classes}
        onClose={onBulkAssignClose}
        onAssign={handleBulkAssignClass}
        onSuccess={(message) => showToast('success', 'Berhasil!', message)}
        onError={(error) => showToast('error', 'Error Assignment', error)}
      />
    </div>
  );
};

export default StudentManager;
