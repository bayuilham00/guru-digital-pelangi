// Subject Management Component (Admin Only)
// Manages CRUD operations for subjects/mata pelajaran

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
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
import { Plus, Edit, Trash2, BookOpen, Users, FileText, MoreVertical, Search, Filter, Columns, ChevronDown } from 'lucide-react';
import EmptyState from './common/EmptyState';
import { useAuthStore } from '../stores/authStore';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    classes: number;
    grades: number;
  };
}

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
}

const statusColorMap: Record<string, "success" | "danger" | "warning" | "default" | "primary" | "secondary"> = {
  true: "success",
  false: "danger",
};

const statusOptions = [
  {name: "Aktif", uid: "true"},
  {name: "Nonaktif", uid: "false"},
];

const columns = [
  {name: "MATA PELAJARAN", uid: "subject", sortable: true},
  {name: "KODE", uid: "code", sortable: true},
  {name: "DESKRIPSI", uid: "description", sortable: true},
  {name: "KELAS", uid: "classes", sortable: true},
  {name: "STATUS", uid: "status", sortable: true},
  {name: "AKSI", uid: "actions"},
];

const INITIAL_VISIBLE_COLUMNS = ["subject", "code", "description", "classes", "status", "actions"];

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

const SubjectManager: React.FC = () => {
  const { user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Advanced table state
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(["all"]));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<{column: string; direction: "ascending" | "descending"}>({
    column: "subject",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: ''
  });

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/subjects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSubjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const response = await fetch(`http://localhost:5000${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSubjects();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = useCallback(async (subject: Subject) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${subject.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/subjects/${subject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        await fetchSubjects();
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal menghapus mata pelajaran');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  }, [fetchSubjects]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    // Ensure selectedKeys is a Set
    const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
    
    // Get array of selected subject IDs (excluding 'all')
    const selectedIds = Array.from(keysSet).filter(key => key !== 'all');
    
    if (selectedIds.length === 0) {
      alert('Pilih mata pelajaran yang ingin dihapus terlebih dahulu');
      return;
    }

    const confirmMessage = `Apakah Anda yakin ingin menghapus ${selectedIds.length} mata pelajaran yang dipilih?`;
    if (confirm(confirmMessage)) {
      try {
        // Delete subjects one by one (you can optimize this with batch delete API if available)
        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
          try {
            const response = await fetch(`http://localhost:5000/api/subjects/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            });

            if (response.ok) {
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
        await fetchSubjects();
        
        // Show result message
        if (successCount > 0 && errorCount === 0) {
          alert(`${successCount} mata pelajaran berhasil dihapus!`);
        } else if (successCount > 0 && errorCount > 0) {
          alert(`${successCount} mata pelajaran berhasil dihapus, ${errorCount} gagal dihapus.`);
        } else {
          alert('Gagal menghapus mata pelajaran yang dipilih.');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        alert('Terjadi error saat menghapus data');
      }
    }
  }, [selectedKeys, fetchSubjects]);

  // Advanced table logic
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredSubjects = [...subjects];

    if (hasSearchFilter) {
      filteredSubjects = filteredSubjects.filter((subject) =>
        subject.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        subject.code.toLowerCase().includes(filterValue.toLowerCase()) ||
        (subject.description && subject.description.toLowerCase().includes(filterValue.toLowerCase()))
      );
    }
    if (statusFilter.size > 0 && !statusFilter.has("all")) {
      filteredSubjects = filteredSubjects.filter((subject) =>
        statusFilter.has(String(subject.isActive))
      );
    }

    return filteredSubjects;
  }, [subjects, filterValue, statusFilter, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Subject, b: Subject) => {
      let first: string | number = "";
      let second: string | number = "";

      if (sortDescriptor.column === "subject") {
        first = a.name;
        second = b.name;
      } else if (sortDescriptor.column === "code") {
        first = a.code;
        second = b.code;
      } else if (sortDescriptor.column === "description") {
        first = a.description || "";
        second = b.description || "";
      } else if (sortDescriptor.column === "classes") {
        first = a._count?.classes || 0;
        second = b._count?.classes || 0;
      } else if (sortDescriptor.column === "status") {
        first = a.isActive ? "Aktif" : "Nonaktif";
        second = b.isActive ? "Aktif" : "Nonaktif";
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
  const handleOpenModal = useCallback((subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description || ''
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        description: ''
      });
    }
    onOpen();
  }, [onOpen]);

  // Row click handler to view subject details
  const handleRowClick = useCallback((subject: Subject) => {
    // Open modal in view mode with subject details
    console.log('Row clicked:', subject.name);
    handleOpenModal(subject);
  }, [handleOpenModal]);

  const handleCloseModal = useCallback(() => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: ''
    });
    onClose();
  }, [onClose]);

  // Cell rendering
  const renderCell = useCallback((subject: Subject, columnKey: React.Key) => {
    const cellValue = subject[columnKey as keyof Subject];

    switch (columnKey) {
      case "subject":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{subject.name}</p>
            <p className="text-bold text-xs capitalize text-default-400">{subject.code}</p>
          </div>
        );
      case "code":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{subject.code}</p>
          </div>
        );
      case "description":
        return (
          <div className="flex flex-col">
            <p className="text-sm text-default-500">{subject.description || '-'}</p>
          </div>
        );
      case "classes":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{subject._count?.classes || 0} kelas</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[String(subject.isActive)]} size="sm" variant="flat">
            {subject.isActive ? 'Aktif' : 'Nonaktif'}
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
                  aria-label={`Aksi untuk ${subject.name}`}
                  className="text-default-400 data-[hover=true]:text-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={`Menu aksi untuk ${subject.name}`}
                closeOnSelect={true}
                disallowEmptySelection={false}
              >
                <DropdownItem 
                  key="edit" 
                  startContent={<Edit className="w-4 h-4" />} 
                  onPress={() => handleOpenModal(subject)}
                  className="text-default-700"
                >
                  Edit Data
                </DropdownItem>
                <DropdownItem 
                  key="delete" 
                  className="text-danger" 
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() => handleDelete(subject)}
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
  }, [handleOpenModal, handleDelete]);

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
                {selectedCount} mata pelajaran dipilih
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
            placeholder="Cari nama, kode, atau deskripsi..."
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
            <Button color="primary" endContent={<Plus className="w-4 h-4" />} onPress={() => handleOpenModal()}>
              Tambah Mata Pelajaran
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {subjects.length} mata pelajaran</span>
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
    subjects.length,
    onClear,
    handleOpenModal,
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
        aria-label="Subjects table with custom cells, pagination and sorting"
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
          // Handle row click to open subject detail
          const subject = sortedItems.find(item => item.id === key);
          if (subject) {
            console.log('Row clicked:', subject.name);
            handleRowClick(subject);
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
        <TableBody emptyContent={"Tidak ada mata pelajaran ditemukan"} items={sortedItems} loadingContent={<Spinner />} loadingState={loading ? "loading" : "idle"}>
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
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>{editingSubject ? 'Edit' : 'Tambah'} Mata Pelajaran</span>
              </div>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <Input
                label="Nama Mata Pelajaran"
                placeholder="Contoh: Matematika"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Input
                label="Kode Mata Pelajaran"
                placeholder="Contoh: MTK"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                isRequired
              />
              <Textarea
                label="Deskripsi"
                placeholder="Deskripsi mata pelajaran (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                {editingSubject ? 'Update' : 'Simpan'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubjectManager;
