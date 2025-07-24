// StudentManager.tsx - Main component yang sudah dipecah menjadi komponen-komponen kecil
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Select,
  SelectItem,
  Chip,
  useDisclosure,
  Pagination
} from '@heroui/react';
import { Plus, Search, Upload, Users } from 'lucide-react';
import { studentService, classService } from '../../../services/expressApi';
import { Student } from '../../../services/types';

// Import komponen yang sudah dipecah
import StudentTable from './StudentTable';
import StudentFormModal from './StudentFormModal';
import StudentProfileModal from './StudentProfileModal';
import useStudentTableControls from './StudentTableControls';
import BulkImportModal from './BulkImportModal';

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
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Advanced table state
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(['all']));
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'fullName',
    direction: 'ascending' as 'ascending' | 'descending'
  });
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isBulkImportOpen, onOpen: onBulkImportOpen, onClose: onBulkImportClose } = useDisclosure();
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

  // Filter logic
  const filterStudents = useCallback(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm)
      );
    }

    if (selectedClass) {
      filtered = filtered.filter(student => student.classId === selectedClass);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass]);

  useEffect(() => {
    filterStudents();
  }, [filterStudents]);

  // Advanced table filtering and pagination
  const filteredItems = useMemo(() => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter((student) =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!statusFilter.has('all') && statusFilter.size !== statusOptions.length) {
      filtered = filtered.filter((student) =>
        Array.from(statusFilter).includes(student.status)
      );
    }

    if (selectedClass) {
      filtered = filtered.filter((student) => student.classId === selectedClass);
    }

    return filtered;
  }, [students, searchTerm, statusFilter, selectedClass]);

  const pages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const items = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.slice(start, end);
  }, [currentPage, filteredItems, itemsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Student, b: Student) => {
      let first, second;
      
      switch (sortDescriptor.column) {
        case 'name':
          first = a.fullName;
          second = b.fullName;
          break;
        case 'nisn':
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
        case 'level':
          first = a.studentXp?.level || 0;
          second = b.studentXp?.level || 0;
          break;
        default:
          first = a.fullName;
          second = b.fullName;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

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
      status: student.status
    });
    onOpen();
  }, [onOpen]);

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        gender: formData.gender as 'L' | 'P',
        status: formData.status as 'ACTIVE' | 'INACTIVE'
      };

      if (isEditing && selectedStudent) {
        const response = await studentService.updateStudent(selectedStudent.id, dataToSave);
        if (response.success) {
          loadStudents();
          onClose();
          alert('Siswa berhasil diupdate!');
        } else {
          alert('Error: ' + (response.error || 'Gagal update siswa'));
        }
      } else {
        const response = await studentService.createStudent(dataToSave);
        if (response.success) {
          loadStudents();
          onClose();
          alert('Siswa berhasil dibuat!');
        } else {
          alert('Error: ' + (response.error || 'Gagal membuat siswa'));
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi error saat menyimpan data');
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        const response = await studentService.deleteStudent(id);
        if (response.success) {
          loadStudents();
          alert('Siswa berhasil dihapus!');
        } else {
          alert('Error: ' + (response.error || 'Gagal menghapus siswa'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Terjadi error saat menghapus data');
      }
    }
  }, [loadStudents]);

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
          alert(`${successCount} siswa berhasil dihapus!`);
        } else if (successCount > 0 && errorCount > 0) {
          alert(`${successCount} siswa berhasil dihapus, ${errorCount} gagal dihapus.`);
        } else {
          alert('Gagal menghapus siswa yang dipilih.');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Terjadi error saat menghapus data');
      }
    }
  }, [selectedKeys, loadStudents]);

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

  const onSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const onClear = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // Get table controls
  const { topContent } = useStudentTableControls({
    searchTerm,
    selectedKeys,
    statusFilter,
    visibleColumns,
    classes,
    selectedClass,
    filteredItemsLength: filteredItems.length,
    itemsPerPage,
    onSearchChange,
    onClear,
    onStatusFilterChange: setStatusFilter,
    onVisibleColumnsChange: setVisibleColumns,
    onClassChange: setSelectedClass,
    onRowsPerPageChange,
    onBulkDelete: handleBulkDelete,
    onClearSelection: () => setSelectedKeys(new Set()),
    onCreate: handleCreate
  });

  // Bottom content for table
  const bottomContent = useMemo(() => {
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    const allCurrentPageItemIds = sortedItems.map(item => item.id);
    const isAllSelected = allCurrentPageItemIds.length > 0 && 
                         allCurrentPageItemIds.every(id => keysSet.has(id));
    
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {isAllSelected && keysSet.size === allCurrentPageItemIds.length
            ? "Semua item dipilih"
            : `${keysSet.size} dari ${filteredItems.length} dipilih`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={currentPage}
          total={pages}
          onChange={setCurrentPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button 
            isDisabled={pages === 1 || currentPage === 1} 
            size="sm" 
            variant="flat" 
            onPress={() => setCurrentPage(currentPage - 1)}
          >
            Sebelumnya
          </Button>
          <Button 
            isDisabled={pages === 1 || currentPage === pages} 
            size="sm" 
            variant="flat" 
            onPress={() => setCurrentPage(currentPage + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, currentPage, pages, sortedItems]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
                <p className="text-gray-600">Kelola data siswa dan informasi akademik</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="flat"
                startContent={<Upload className="w-4 h-4" />}
                onPress={onBulkImportOpen}
              >
                Bulk Import
              </Button>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={handleCreate}
              >
                Tambah Siswa
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Cari nama atau NISN..."
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <Select
                label="Filter Kelas"
                placeholder="Semua kelas"
                selectedKeys={selectedClass ? [selectedClass] : []}
                onSelectionChange={(keys) => {
                  const classId = Array.from(keys)[0] as string;
                  setSelectedClass(classId);
                }}
              >
                {[{ id: '', name: 'Semua Kelas' }, ...classes].map((cls) => (
                  <SelectItem key={cls.id} textValue={cls.name}>
                    {cls.name}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex items-center justify-end">
                <Chip color="primary" variant="flat">
                  {filteredStudents.length} Siswa
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Advanced Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
    </div>
  );
};

export default StudentManager;
