// Teacher Management Component (Admin Only)
// Manages CRUD operations for teachers/guru + bulk import Excel

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Spinner,
  Select,
  SelectItem,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Popover,
  PopoverTrigger,
  PopoverContent,
  CheckboxGroup,
  Checkbox
} from '@heroui/react';
import { Plus, Edit, Trash2, Users, Upload, Download, MoreVertical, Search, Filter, Columns, ChevronDown } from 'lucide-react';
import EmptyState from './common/EmptyState';
import { useAuthStore } from '../stores/authStore';
import { teacherService } from '../services/expressApi';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  nip?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  classes: Array<{
    id: string;
    name: string;
    subject: string;
  }>;
  totalClasses: number;
  totalGrades: number;
}

interface TeacherFormData {
  fullName: string;
  email: string;
  nip: string;
  password: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const statusColorMap: Record<string, "success" | "danger" | "warning" | "default" | "primary" | "secondary"> = {
  ACTIVE: "success",
  INACTIVE: "danger",
};

const statusOptions = [
  {name: "Aktif", uid: "ACTIVE"},
  {name: "Nonaktif", uid: "INACTIVE"},
];

const columns = [
  {name: "GURU", uid: "teacher", sortable: true},
  {name: "EMAIL", uid: "email", sortable: true},
  {name: "NIP", uid: "nip", sortable: true},
  {name: "KELAS", uid: "classes", sortable: true},
  {name: "STATUS", uid: "status", sortable: true},
  {name: "AKSI", uid: "actions"},
];

const INITIAL_VISIBLE_COLUMNS = ["teacher", "email", "nip", "classes", "status", "actions"];

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

const TeacherManager: React.FC = () => {
  const { user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  
  // Advanced table state
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(["all"]));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<{column: string; direction: "ascending" | "descending"}>({
    column: "teacher",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState<TeacherFormData>({
    fullName: '',
    email: '',
    nip: '',
    password: '',
    status: 'ACTIVE'
  });

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/teachers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTeachers(result.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';

      // Don't send password if editing and password is empty
      const submitData = { ...formData };
      if (editingTeacher && !submitData.password) {
        delete submitData.password;
      }

      const response = await fetch(`http://localhost:5000${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchTeachers();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk import
  const handleBulkImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/teachers/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Berhasil mengimpor ${result.imported} guru`);
        await fetchTeachers();
        onImportClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal mengimpor data');
      }
    } catch (error) {
      console.error('Error importing teachers:', error);
      alert('Terjadi kesalahan saat mengimpor data');
    }
  };

  // Handle delete teacher
  const handleDeleteTeacher = async () => {
    if (!deletingTeacher) return;

    setDeleting(true);
    try {
      const response = await teacherService.deleteTeacher(deletingTeacher.id);
      
      if (response.success) {
        await fetchTeachers();
        setDeletingTeacher(null);
        onDeleteClose();
        alert('Guru berhasil dihapus');
      } else {
        alert(response.error || 'Gagal menghapus guru');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Terjadi kesalahan saat menghapus guru');
    } finally {
      setDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    // Ensure selectedKeys is a Set
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    
    // Get array of selected teacher IDs (excluding 'all')
    const selectedIds = Array.from(keysSet).filter(key => key !== 'all');
    
    if (selectedIds.length === 0) {
      alert('Pilih guru yang ingin dihapus terlebih dahulu');
      return;
    }

    const confirmMessage = `Apakah Anda yakin ingin menghapus ${selectedIds.length} guru yang dipilih?`;
    if (confirm(confirmMessage)) {
      try {
        // Delete teachers one by one (you can optimize this with batch delete API if available)
        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
          try {
            const response = await teacherService.deleteTeacher(id as string);
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
        await fetchTeachers();
        
        // Show result message
        if (successCount > 0 && errorCount === 0) {
          alert(`${successCount} guru berhasil dihapus!`);
        } else if (successCount > 0 && errorCount > 0) {
          alert(`${successCount} guru berhasil dihapus, ${errorCount} gagal dihapus.`);
        } else {
          alert('Gagal menghapus guru yang dipilih.');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Terjadi error saat menghapus data');
      }
    }
  }, [selectedKeys, fetchTeachers]);

  // Download template Excel
  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = 'http://localhost:5000/api/teachers/template';
    link.download = 'template-guru.csv';
    link.click();
  };

  // Advanced table logic
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredTeachers = [...teachers];

    if (hasSearchFilter) {
      filteredTeachers = filteredTeachers.filter((teacher) =>
        teacher.fullName.toLowerCase().includes(filterValue.toLowerCase()) ||
        teacher.email.toLowerCase().includes(filterValue.toLowerCase()) ||
        (teacher.nip && teacher.nip.toLowerCase().includes(filterValue.toLowerCase()))
      );
    }
    if (statusFilter.size > 0 && !statusFilter.has("all")) {
      filteredTeachers = filteredTeachers.filter((teacher) =>
        statusFilter.has(teacher.status)
      );
    }

    return filteredTeachers;
  }, [teachers, filterValue, statusFilter, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Teacher, b: Teacher) => {
      let first: string | number = "";
      let second: string | number = "";

      if (sortDescriptor.column === "teacher") {
        first = a.fullName;
        second = b.fullName;
      } else if (sortDescriptor.column === "email") {
        first = a.email;
        second = b.email;
      } else if (sortDescriptor.column === "nip") {
        first = a.nip || "";
        second = b.nip || "";
      } else if (sortDescriptor.column === "classes") {
        first = a.totalClasses;
        second = b.totalClasses;
      } else if (sortDescriptor.column === "status") {
        first = a.status;
        second = b.status;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  // Handlers
  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("")
    setPage(1)
  }, []);

  // Modal handlers
  const handleOpenModal = useCallback((teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        fullName: teacher.fullName,
        email: teacher.email,
        nip: teacher.nip || '',
        password: '',
        status: teacher.status
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        fullName: '',
        email: '',
        nip: '',
        password: '',
        status: 'ACTIVE'
      });
    }
    onOpen();
  }, [onOpen]);

  const handleCloseModal = useCallback(() => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      email: '',
      nip: '',
      password: '',
      status: 'ACTIVE'
    });
    onClose();
  }, [onClose]);

  const handleOpenDeleteModal = useCallback((teacher: Teacher) => {
    setDeletingTeacher(teacher);
    onDeleteOpen();
  }, [onDeleteOpen]);

  // Row click handler to view teacher details
  const handleRowClick = useCallback((teacher: Teacher) => {
    // Open modal in view mode with teacher details
    console.log('Row clicked:', teacher.fullName);
    handleOpenModal(teacher);
  }, [handleOpenModal]);

  // Cell rendering
  const renderCell = useCallback((teacher: Teacher, columnKey: React.Key) => {
    const cellValue = teacher[columnKey as keyof Teacher];

    switch (columnKey) {
      case "teacher":
        return (
          <User
            avatarProps={{radius: "lg", name: teacher.fullName}}
            description={teacher.email}
            name={teacher.fullName}
          >
            {teacher.email}
          </User>
        );
      case "email":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{teacher.email}</p>
          </div>
        );
      case "nip":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{teacher.nip || '-'}</p>
          </div>
        );
      case "classes":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{teacher.totalClasses} kelas</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[teacher.status]} size="sm" variant="flat">
            {teacher.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
          </Chip>
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
                  aria-label={`Aksi untuk ${teacher.fullName}`}
                  className="text-default-400 data-[hover=true]:text-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={`Menu aksi untuk ${teacher.fullName}`}
                closeOnSelect={true}
                disallowEmptySelection={false}
              >
                <DropdownItem 
                  key="edit" 
                  startContent={<Edit className="w-4 h-4" />} 
                  onPress={() => handleOpenModal(teacher)}
                  className="text-default-700"
                >
                  Edit Data
                </DropdownItem>
                <DropdownItem 
                  key="delete" 
                  className="text-danger" 
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() => handleOpenDeleteModal(teacher)}
                >
                  Hapus
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, [handleOpenModal, handleOpenDeleteModal]);

  // Table content components
  const topContent = useMemo(() => {
    // Helper variables for bulk actions
    const hasSelectedItems = selectedKeys instanceof Set && selectedKeys.size > 0;
    const selectedCount = hasSelectedItems ? selectedKeys.size : 0;

    return (
      <div className="flex flex-col gap-4">
        {/* Bulk Actions Bar - Show when items are selected */}
        {hasSelectedItems && (
          <div className="flex items-center justify-between p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-danger-700 font-medium">
                {selectedCount} guru dipilih
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
            placeholder="Cari nama, email, atau NIP..."
            startContent={<Search className="w-4 h-4" />}
            value={filterValue}
            onClear={() => onClear()}
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
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => setStatusFilter(keys as Set<string>)}
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
                onSelectionChange={(keys) => setVisibleColumns(keys as Set<string>)}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="secondary"
              variant="flat"
              startContent={<Upload className="w-4 h-4" />}
              onPress={onImportOpen}
            >
              Import Excel
            </Button>
            <Button color="primary" endContent={<Plus className="w-4 h-4" />} onPress={() => handleOpenModal()}>
              Tambah Guru
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {teachers.length} guru</span>
          <label className="flex items-center text-default-400 text-small">
            Baris per halaman:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    teachers.length,
    onClear,
    handleOpenModal,
    onImportOpen,
    selectedKeys,
    handleBulkDelete
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys.size === 0 ? "Tidak ada yang dipilih" : `${selectedKeys.size} dari ${filteredItems.length} dipilih`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Sebelumnya
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Selanjutnya
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage]);

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Table
        aria-label="Teachers table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        selectionBehavior="toggle" // Only checkbox can trigger selection
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onRowAction={(key) => {
          // Handle row click to open teacher detail
          const teacher = sortedItems.find(item => item.id === key);
          if (teacher) {
            console.log('Row clicked:', teacher.fullName);
            handleRowClick(teacher);
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
        <TableBody emptyContent={"Tidak ada guru ditemukan"} items={sortedItems} loadingContent={<Spinner />} loadingState={loading ? "loading" : "idle"}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <span>{editingTeacher ? 'Edit' : 'Tambah'} Guru</span>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <Input
                label="Nama Lengkap"
                placeholder="Contoh: Budi Santoso"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                isRequired
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                isRequired
              />
              <Input
                label="NIP"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
              <Input
                label={editingTeacher ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                isRequired={!editingTeacher}
              />
              <Select
                label="Status"
                selectedKeys={[formData.status]}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              >
                <SelectItem key="ACTIVE">Aktif</SelectItem>
                <SelectItem key="INACTIVE">Nonaktif</SelectItem>
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleCloseModal}>
                Batal
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={submitting}
              >
                {editingTeacher ? 'Update' : 'Simpan'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportOpen} onClose={onImportClose}>
        <ModalContent>
          <ModalHeader>Import Data Guru dari Excel</ModalHeader>
          <ModalBody className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>1. Download template Excel terlebih dahulu</p>
              <p>2. Isi data guru sesuai format template</p>
              <p>3. Upload file Excel yang sudah diisi</p>
            </div>
            <Button
              variant="flat"
              startContent={<Download className="w-4 h-4" />}
              onPress={downloadTemplate}
            >
              Download Template Excel
            </Button>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBulkImport(file);
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onImportClose}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus Guru</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p>Apakah Anda yakin ingin menghapus guru berikut?</p>
              {deletingTeacher && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-medium">{deletingTeacher.fullName}</p>
                  <p className="text-sm text-gray-600">{deletingTeacher.email}</p>
                  <p className="text-sm text-gray-600">NIP: {deletingTeacher.nip || '-'}</p>
                </div>
              )}
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Peringatan:</strong> Data guru yang dihapus tidak dapat dikembalikan. 
                  Pastikan guru tersebut tidak memiliki data terkait seperti kelas atau nilai yang masih aktif.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={onDeleteClose}
              isDisabled={deleting}
            >
              Batal
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteTeacher}
              isLoading={deleting}
            >
              Hapus Guru
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TeacherManager;
