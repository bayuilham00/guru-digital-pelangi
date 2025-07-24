// StudentTable.tsx - Komponen tabel siswa terpisah
import React, { useCallback, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner
} from '@heroui/react';
import { Edit, Trash2, MoreVertical, Award } from 'lucide-react';
import { Student } from '../../../services/types';
import EmptyState from '../../common/EmptyState';

interface StudentTableProps {
  students: Student[];
  selectedKeys: Set<string>;
  visibleColumns: Set<string>;
  sortDescriptor: {
    column: string;
    direction: 'ascending' | 'descending';
  };
  isLoading: boolean;
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  onSelectionChange: (keys: "all" | Set<React.Key>) => void;
  onSortChange: (descriptor: { column: React.Key; direction: "ascending" | "descending" }) => void;
  onRowAction: (key: React.Key) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

// Column definitions
const columns = [
  { name: "NAMA", uid: "name", sortable: true },
  { name: "NISN", uid: "nisn", sortable: true },
  { name: "KELAS", uid: "class", sortable: true },
  { name: "JENIS KELAMIN", uid: "gender" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "LEVEL XP", uid: "level", sortable: true },
  { name: "AKSI", uid: "actions" },
];

const statusColorMap = {
  ACTIVE: "success",
  INACTIVE: "danger", 
  GRADUATED: "warning",
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Aktif';
    case 'INACTIVE': return 'Tidak Aktif';
    case 'GRADUATED': return 'Lulus';
    default: return 'Unknown';
  }
};

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedKeys,
  visibleColumns,
  sortDescriptor,
  isLoading,
  topContent,
  bottomContent,
  onSelectionChange,
  onSortChange,
  onRowAction,
  onEdit,
  onDelete,
  onCreate
}) => {
  // Header columns logic
  const headerColumns = useMemo(() => {
    if (visibleColumns.has('all')) return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

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
                  onPress={() => onEdit(student)}
                  className="text-default-700"
                >
                  Edit
                </DropdownItem>
                <DropdownItem 
                  key="delete" 
                  className="text-danger" 
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() => onDelete(student.id)}
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
  }, [onEdit, onDelete]);

  return (
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
      selectionBehavior="toggle"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onRowAction={onRowAction}
      onSelectionChange={onSelectionChange}
      onSortChange={onSortChange}
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
            icon={() => <div className="w-16 h-16 bg-gray-100 rounded-full" />}
            title="Tidak ada siswa ditemukan"
            description="Tidak ada siswa yang sesuai dengan kriteria pencarian Anda"
            actionLabel="Tambah Siswa Pertama"
            onAction={onCreate}
            actionColor="primary"
          />
        } 
        items={students}
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
  );
};

export default StudentTable;
