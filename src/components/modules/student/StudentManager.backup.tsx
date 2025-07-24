// Student Management Component for Guru Digital Pelangi
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Avatar,
  Tabs,
  Tab,
  Pagination,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User
} from '@heroui/react';
import { Plus, Search, Edit, Trash2, Users, UserPlus, Award, TrendingUp, Upload, ChevronDown, MoreVertical } from 'lucide-react';
import EmptyState from '../../common/EmptyState';
import BulkImportModal from './BulkImportModal';
import { studentService, classService } from '../../../services/expressApi';
import { Student } from '../../../services/types';

// Define a flexible Class interface that can handle both API variations
interface Class {
  id: string;
  name: string;
  subject?: string | {
    id: string;
    name: string;
    code: string;
  };
  description?: string;
  studentCount?: number;
  gradeLevel?: string;
}

// Column definitions for student table
const columns = [
  { name: "NAMA", uid: "name", sortable: true },
  { name: "NISN", uid: "nisn", sortable: true },
  { name: "KELAS", uid: "class", sortable: true },
  { name: "JENIS KELAMIN", uid: "gender" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "LEVEL XP", uid: "level", sortable: true },
  { name: "AKSI", uid: "actions" },
];

const statusOptions = [
  { name: "Aktif", uid: "ACTIVE" },
  { name: "Nonaktif", uid: "INACTIVE" },
  { name: "Lulus", uid: "GRADUATED" },
];

interface Class {
  id: string;
  name: string;
  gradeLevel?: string;
}

const statusColorMap = {
  ACTIVE: "success",
  INACTIVE: "danger", 
  GRADUATED: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["name", "class", "status", "level", "actions"];

// Helper function
function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

// Helper function to format date for HTML input
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  try {
    // If it's already in yyyy-MM-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Convert ISO date to yyyy-MM-dd format
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
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTab, setActiveTab] = useState('students');
  
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
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isBulkImportOpen, onOpen: onBulkImportOpen, onClose: onBulkImportClose } = useDisclosure();
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState({
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

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    const response = await studentService.getStudents();
    if (response.success && response.data) {
      console.log('Loaded students:', response.data);
      console.log('Students with ids:', response.data.map(s => ({ id: s.id, name: s.fullName })));
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
      console.log('Saving student data:', formData);
      
      // Cast gender to correct type
      const dataToSave = {
        ...formData,
        gender: formData.gender as 'L' | 'P',
        status: formData.status as 'ACTIVE' | 'INACTIVE'
      };

      if (isEditing && selectedStudent) {
        const response = await studentService.updateStudent(selectedStudent.id, dataToSave);
        console.log('Update response:', response);
        if (response.success) {
          loadStudents();
          onClose();
          alert('Siswa berhasil diupdate!');
        } else {
          alert('Error: ' + (response.error || 'Gagal update siswa'));
        }
      } else {
        const response = await studentService.createStudent(dataToSave);
        console.log('Create response:', response);
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
        console.log('Delete response:', response);
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
    // Ensure selectedKeys is a Set
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    
    // Get array of selected student IDs (excluding 'all')
    const selectedIds = Array.from(keysSet).filter(key => key !== 'all');
    
    if (selectedIds.length === 0) {
      alert('Pilih siswa yang ingin dihapus terlebih dahulu');
      return;
    }

    const confirmMessage = `Apakah Anda yakin ingin menghapus ${selectedIds.length} siswa yang dipilih?`;
    if (confirm(confirmMessage)) {
      try {
        // Delete students one by one (you can optimize this with batch delete API if available)
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

        // Clear selection after delete
        setSelectedKeys(new Set());
        
        // Reload data
        loadStudents();
        
        // Show result message
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'GRADUATED': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Tidak Aktif';
      case 'GRADUATED': return 'Lulus';
      default: return 'Unknown';
    }
  };

  // Advanced table logic
  const hasSearchFilter = Boolean(searchTerm);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns.has('all')) return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filtered = [...students];

    if (hasSearchFilter) {
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
  }, [students, searchTerm, statusFilter, selectedClass, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.slice(start, end);
  }, [currentPage, filteredItems, itemsPerPage]);

  const sortedItems = React.useMemo(() => {
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

  // Cell rendering function
  const renderCell = useCallback((student: Student, columnKey: string) => {
    const cellValue = student[columnKey as keyof Student];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", size: "sm" }}
            description={student.email}
            name={student.fullName}
          >
            {student.email}
          </User>
        );
      case "nisn":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{student.studentId}</p>
          </div>
        );
      case "class":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{student.class?.name || '-'}</p>
            <p className="text-bold text-tiny text-default-400">{student.class?.gradeLevel || ''}</p>
          </div>
        );
      case "gender":
        return (
          <Chip size="sm" variant="flat" color={student.gender === 'L' ? 'primary' : 'secondary'}>
            {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
          </Chip>
        );
      case "status":
        return (
          <Chip 
            className="capitalize" 
            color={statusColorMap[student.status as keyof typeof statusColorMap] as "success" | "danger" | "warning" | "primary" | "default" | "secondary" || "default"} 
            size="sm" 
            variant="flat"
          >
            {getStatusText(student.status)}
          </Chip>
        );
      case "level":
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-bold text-small">Level {student.studentXp?.level || 1}</span>
            </div>
            <p className="text-tiny text-default-400">{student.studentXp?.totalXp || 0} XP</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown 
              placement="bottom-end"
              showArrow
              classNames={{
                base: "before:bg-default-200",
                content: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-50 dark:to-black"
              }}
            >
              <DropdownTrigger>
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light"
                  aria-label={`Aksi untuk ${student.fullName}`}
                  className="text-default-400 data-[hover=true]:text-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={`Menu aksi untuk ${student.fullName}`}
                closeOnSelect={true}
                disallowEmptySelection={false}
              >
                <DropdownItem 
                  key="edit" 
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => handleEdit(student)}
                  className="text-default-700"
                >
                  Edit
                </DropdownItem>
                <DropdownItem 
                  key="delete" 
                  className="text-danger" 
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() => handleDelete(student.id)}
                >
                  Hapus
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue?.toString() || '';
    }
  }, [handleEdit, handleDelete]);

  // Callback functions
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

  // Top content for advanced table
  const topContent = React.useMemo(() => {
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    const hasSelectedItems = keysSet.size > 0 && !keysSet.has('all');
    const selectedCount = Array.from(keysSet).filter(key => key !== 'all').length;
    
    return (
      <div className="flex flex-col gap-4">
        {/* Bulk Actions Bar - Show when items are selected */}
        {hasSelectedItems && (
          <div className="flex items-center justify-between p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-danger-700 font-medium">
                {selectedCount} siswa dipilih
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                color="danger"
                variant="flat"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleBulkDelete}
                size="sm"
              >
                Hapus Terpilih
              </Button>
              <Button
                variant="light"
                onPress={() => setSelectedKeys(new Set())}
                size="sm"
              >
                Batal Pilih
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Cari berdasarkan nama atau NISN..."
            startContent={<Search className="w-4 h-4" />}
            value={searchTerm}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown className="w-4 h-4" />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  const keySet = keys instanceof Set ? keys : new Set(Array.isArray(keys) ? keys : [keys]);
                  setStatusFilter(keySet as Set<string>);
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown className="w-4 h-4" />} variant="flat">
                  Kolom
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  const keySet = keys instanceof Set ? keys : new Set(Array.isArray(keys) ? keys : [keys]);
                  setVisibleColumns(keySet as Set<string>);
                }}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button color="primary" endContent={<Plus className="w-4 h-4" />} onPress={handleCreate}>
              Tambah Siswa
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {filteredItems.length} siswa</span>
          <label className="flex items-center text-default-400 text-small">
            Baris per halaman:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              onChange={onRowsPerPageChange}
              value={itemsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    searchTerm,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    filteredItems.length,
    onSearchChange,
    onClear,
    itemsPerPage,
    handleCreate,
    selectedKeys,
    handleBulkDelete
  ]);

  // Bottom content for advanced table
  const bottomContent = React.useMemo(() => {
    // Ensure selectedKeys is a Set
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
                aria-label="Cari siswa berdasarkan nama atau NISN"
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
        <Table
          isHeaderSticky
          aria-label="Tabel siswa dengan fitur pencarian, filter, dan sorting"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "max-h-[600px]",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          selectionBehavior="toggle" // Only checkbox can trigger selection
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onRowAction={(key) => {
            // Handle row click to open student detail
            const student = sortedItems.find(item => item.id === key);
            if (student) {
              console.log('Row clicked:', student.fullName);
              handleRowClick(student);
            }
          }}
          onSelectionChange={(keys) => {
            // Debug: Log selection change
            console.log('Selection changed:', keys);
            console.log('Type of keys:', typeof keys);
            console.log('Current sortedItems ids:', sortedItems.map(item => item.id));
            
            // Handle selection change with proper type checking
            if (keys === "all") {
              // When "select all" is clicked, select all current page items
              const allItemIds = new Set(sortedItems.map(item => item.id));
              console.log('Selecting all items:', allItemIds);
              setSelectedKeys(allItemIds);
            } else if (keys instanceof Set) {
              console.log('Setting keys as Set:', keys);
              // Convert Set<Key> to Set<string>
              const stringSet = new Set(Array.from(keys).map(key => String(key)));
              setSelectedKeys(stringSet);
            } else {
              // Handle other cases (array, string, etc.)
              const keySet = new Set(Array.isArray(keys) ? keys : [keys]);
              console.log('Converting to Set:', keySet);
              setSelectedKeys(keySet as Set<string>);
            }
          }}
          onSortChange={(descriptor) => setSortDescriptor({
            column: String(descriptor.column),
            direction: descriptor.direction as "ascending" | "descending"
          })}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            emptyContent={
              <EmptyState
                icon={Users}
                title="Tidak ada siswa ditemukan"
                description="Tidak ada siswa yang sesuai dengan kriteria pencarian Anda"
                actionLabel="Tambah Siswa Pertama"
                onAction={handleCreate}
                actionColor="primary"
              />
            } 
            items={sortedItems}
            isLoading={isLoading}
            loadingContent={<Spinner size="lg" />}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-6",
          footer: "py-4"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">
                  {isEditing ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                </h3>
              </ModalHeader>
              <ModalBody className="gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="NISN"
                    placeholder="10 digit NISN"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    isRequired
                    maxLength={10}
                  />

                  <Select
                    label="Kelas"
                    placeholder="Pilih kelas"
                    selectedKeys={formData.classId ? [formData.classId] : []}
                    onSelectionChange={(keys) => {
                      const classId = Array.from(keys)[0] as string;
                      setFormData({...formData, classId});
                    }}
                    isRequired
                  >
                    {classes.map((cls) => (
                      <SelectItem key={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Nama Lengkap"
                    placeholder="Nama lengkap siswa"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    isRequired
                    className="md:col-span-2"
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />

                  <Select
                    label="Jenis Kelamin"
                    placeholder="Pilih jenis kelamin"
                    selectedKeys={formData.gender ? [formData.gender] : []}
                    onSelectionChange={(keys) => {
                      const gender = Array.from(keys)[0] as string;
                      setFormData({...formData, gender});
                    }}
                  >
                    <SelectItem key="L">Laki-laki</SelectItem>
                    <SelectItem key="P">Perempuan</SelectItem>
                  </Select>

                  <Input
                    label="Tanggal Lahir"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />

                  <Input
                    label="No. Telepon"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />

                  <Input
                    label="Alamat"
                    placeholder="Alamat lengkap"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="md:col-span-2"
                  />

                  <Input
                    label="Nama Orang Tua"
                    placeholder="Nama orang tua/wali"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />

                  <Input
                    label="No. Telepon Orang Tua"
                    placeholder="08xxxxxxxxxx"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={handleSave}>
                  {isEditing ? 'Update' : 'Simpan'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Student Profile Modal */}
      <Modal 
        isOpen={isProfileOpen} 
        onClose={onProfileClose} 
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-6",
          footer: "py-4"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Profil Siswa</h3>
              </ModalHeader>
              <ModalBody className="gap-4">
                {profileStudent && (
                  <div className="space-y-6">
                    {/* Header Profile */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <Avatar
                        name={profileStudent.fullName?.split(' ').map(n => n.charAt(0)).join('') || 'S'}
                        className="bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xl"
                        size="lg"
                      />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{profileStudent.fullName}</h4>
                        <p className="text-gray-600">NISN: {profileStudent.studentId}</p>
                        {profileStudent.class && (
                          <Chip color="primary" variant="flat" size="sm">
                            {profileStudent.class.name}
                          </Chip>
                        )}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{profileStudent.email || 'Tidak tersedia'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                        <p className="text-gray-900">
                          {profileStudent.gender === 'L' ? 'Laki-laki' : profileStudent.gender === 'P' ? 'Perempuan' : 'Tidak tersedia'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                        <p className="text-gray-900">
                          {profileStudent.dateOfBirth ? new Date(profileStudent.dateOfBirth).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">No. Telepon</label>
                        <p className="text-gray-900">{profileStudent.phone || 'Tidak tersedia'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Alamat</label>
                        <p className="text-gray-900">{profileStudent.address || 'Tidak tersedia'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nama Orang Tua</label>
                        <p className="text-gray-900">{profileStudent.parentName || 'Tidak tersedia'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">No. Telepon Orang Tua</label>
                        <p className="text-gray-900">{profileStudent.parentPhone || 'Tidak tersedia'}</p>
                      </div>
                    </div>

                    {/* XP Info */}
                    {profileStudent.studentXp && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-2">Gamifikasi</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{profileStudent.studentXp.totalXp}</p>
                            <p className="text-sm text-gray-600">Total XP</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{profileStudent.studentXp.level}</p>
                            <p className="text-sm text-gray-600">Level</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-purple-600">{profileStudent.studentXp.levelName}</p>
                            <p className="text-sm text-gray-600">Rank</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button
                  color="primary"
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => {
                    if (profileStudent) {
                      handleEdit(profileStudent);
                      onClose();
                    }
                  }}
                >
                  Edit Siswa
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Bulk Import Modal */}
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
