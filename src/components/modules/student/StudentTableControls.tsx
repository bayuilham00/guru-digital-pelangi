// StudentTableControls.tsx - Kontrol untuk tabel siswa (search, filter, bulk actions)
import React, { useMemo } from 'react';
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem
} from '@heroui/react';
import { Search, ChevronDown, Plus, Trash2, Users, UserPlus } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  gradeLevel?: string;
}

interface StudentTableControlsProps {
  searchTerm: string;
  selectedKeys: Set<string>;
  statusFilter: Set<string>;
  visibleColumns: Set<string>;
  classes: Class[];
  selectedClass: string;
  filteredItemsLength: number;
  itemsPerPage: number;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onStatusFilterChange: (keys: Set<string>) => void;
  onVisibleColumnsChange: (keys: Set<string>) => void;
  onClassChange: (classId: string) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBulkDelete: () => void;
  onBulkAssignClass: () => void;
  onClearSelection: () => void;
}

const statusOptions = [
  { name: "Aktif", uid: "ACTIVE" },
  { name: "Nonaktif", uid: "INACTIVE" },
  { name: "Lulus", uid: "GRADUATED" },
];

const columns = [
  { name: "NAMA", uid: "name" },
  { name: "NISN", uid: "nisn" },
  { name: "KELAS", uid: "class" },
  { name: "JENIS KELAMIN", uid: "gender" },
  { name: "STATUS", uid: "status" },
  { name: "LEVEL XP", uid: "level" },
  { name: "AKSI", uid: "actions" },
];

const useStudentTableControls = ({
  searchTerm,
  selectedKeys,
  statusFilter,
  visibleColumns,
  classes,
  selectedClass,
  filteredItemsLength,
  itemsPerPage,
  onSearchChange,
  onClear,
  onStatusFilterChange,
  onVisibleColumnsChange,
  onClassChange,
  onRowsPerPageChange,
  onBulkDelete,
  onBulkAssignClass,
  onClearSelection
}: StudentTableControlsProps) => {
  // Bulk actions logic
  const keysSet = selectedKeys instanceof Set ? selectedKeys : new Set();
  const hasSelectedItems = keysSet.size > 0 && !keysSet.has('all');
  const selectedCount = Array.from(keysSet).filter(key => key !== 'all').length;

  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      {/* Bulk Actions Bar - Show when items are selected */}
      {hasSelectedItems && (
        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-300 font-medium">
              {selectedCount} siswa dipilih
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onBulkAssignClass}
              size="sm"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
            >
              Assign Kelas
            </Button>
            <Button
              color="danger"
              variant="flat"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={onBulkDelete}
              size="sm"
              className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
            >
              Hapus Terpilih
            </Button>
            <Button
              variant="light"
              onPress={onClearSelection}
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Batal Pilih
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Cari berdasarkan nama atau NISN..."
            startContent={<Search className="w-4 h-4 text-white/60" />}
            value={searchTerm}
            onClear={onClear}
            onValueChange={onSearchChange}
            classNames={{
              input: "text-white placeholder:text-white/60 bg-white/10",
              inputWrapper: "bg-white/10 border-white/20 hover:border-white/30 focus-within:border-blue-500"
            }}
          />
          <div className="flex gap-3">
            <Select
              className="w-48"
              label="Filter Kelas"
              placeholder="Semua kelas"
              selectedKeys={selectedClass ? [selectedClass] : []}
              onSelectionChange={(keys) => {
                const classId = Array.from(keys)[0] as string;
                onClassChange(classId);
              }}
              classNames={{
                label: "text-white/80",
                trigger: "bg-white/10 border-white/20 hover:border-white/30 text-white",
                value: "text-white",
                popoverContent: "bg-gray-800/90 border-white/20"
              }}
            >
              {[{ id: '', name: 'Semua Kelas' }, ...classes].map((cls) => (
                <SelectItem key={cls.id} textValue={cls.name} className="text-white hover:bg-white/10">
                  {cls.name}
                </SelectItem>
              ))}
            </Select>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button 
                  endContent={<ChevronDown className="w-4 h-4" />} 
                  variant="flat"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                className="text-white"
                classNames={{
                  base: "bg-gray-800/90 border-white/20"
                }}
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  const keySet = keys instanceof Set ? keys : new Set(Array.isArray(keys) ? keys : [keys]);
                  onStatusFilterChange(keySet as Set<string>);
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize text-white hover:bg-white/10">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button 
                  endContent={<ChevronDown className="w-4 h-4" />} 
                  variant="flat"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Kolom
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                className="text-white"
                classNames={{
                  base: "bg-gray-800/90 border-white/20"
                }}
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  const keySet = keys instanceof Set ? keys : new Set(Array.isArray(keys) ? keys : [keys]);
                  onVisibleColumnsChange(keySet as Set<string>);
                }}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize text-white hover:bg-white/10">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-small">Total {filteredItemsLength} siswa</span>
        <label className="flex items-center text-white/70 text-small">
          Baris per halaman:
          <select
            className="bg-white/10 border border-white/20 rounded-md outline-none text-white text-small ml-2 px-2 py-1"
            onChange={onRowsPerPageChange}
            value={itemsPerPage}
          >
            <option value="5" className="bg-gray-800 text-white">5</option>
            <option value="10" className="bg-gray-800 text-white">10</option>
            <option value="15" className="bg-gray-800 text-white">15</option>
            <option value="20" className="bg-gray-800 text-white">20</option>
          </select>
        </label>
      </div>
    </div>
  ), [
    hasSelectedItems,
    selectedCount,
    searchTerm,
    statusFilter,
    visibleColumns,
    filteredItemsLength,
    itemsPerPage,
    classes,
    selectedClass,
    onSearchChange,
    onClear,
    onStatusFilterChange,
    onVisibleColumnsChange,
    onClassChange,
    onBulkDelete,
    onBulkAssignClass,
    onClearSelection,
    onRowsPerPageChange
  ]);

  return { topContent };
};

export default useStudentTableControls;
