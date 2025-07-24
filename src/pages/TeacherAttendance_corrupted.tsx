import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardBody, 
  But      console.log('🔍 Fetching classes...');
      
      const response = await classService.getClasses();
  Spinner, 
  Select, 
  SelectItem,
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
  Tooltip
} from '@heroui/react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users,
  BookOpen,
  Save,
  RotateCcw,
  Eye,
  Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { attendanceService } from '../services/attendanceService';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { Class, Student, Attendance } from '../services/types';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn?: string;
  reason?: string;
  studentId: string;
  classId: string;
  student?: {
    id: string;
    name: string;
    nim?: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  studentNim?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn?: string;
  notes?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  studentCount: number;
  students?: Array<{
    id: string;
    name: string;
    nim?: string;
  }>;
}

export const TeacherAttendance: React.FC = () => {
  // State Management
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceEntries, setAttendanceEntries] = useState<StudentAttendanceEntry[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Modal states
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onClose: onBulkModalClose } = useDisclosure();

  const { user } = useAuthStore();

  // Fetch available classes for teacher
  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true);
      console.log('🔍 Fetching classes...');
      
      // For now, use test data while we debug API issues
      console.log('� Using test data for classes (temporary)');
      const response = await classService.getClasses();
      console.log('📥 Classes API response:', {
        success: response.success,
        data: response.data,
        dataLength: response.data?.length,
        error: response.error,
        fullResponse: response
      });
      
      if (response.success) {
        const classes = response.data || [];
        console.log('📊 Raw classes data:', classes);
        
        // Transform Class[] to ClassInfo[]
        const classInfos: ClassInfo[] = classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          studentCount: cls.studentCount || 0
        }));
        
        setClasses(classInfos);
        console.log('✅ Classes transformed and set:', classInfos);
      } else {
        console.error('❌ Failed to fetch classes:', response.error);
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  // Fetch students for selected class and setup attendance entries
  const fetchStudentsForClass = useCallback(async (classId: string) => {
    if (!classId) {
      setAttendanceEntries([]);
      return;
    }

    try {
      setStudentsLoading(true);
      
      // Get students for the class
      const response = await studentService.getStudents({ classId, limit: 100 });
      
      if (response.success) {
        const students = response.data || [];
        console.log('✅ Students loaded for class:', students.length);
        
        // Initialize attendance entries for all students
        const entries: StudentAttendanceEntry[] = students.map(student => ({
          studentId: student.id,
          studentName: student.fullName, // Use fullName from Student interface
          studentNim: student.studentId, // Use studentId as NIM
          status: 'PRESENT' as const, // Default to present
          timeIn: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5), // HH:mm format
          notes: ''
        }));
        
        setAttendanceEntries(entries);
      } else {
        console.error('❌ Failed to fetch students:', response.error);
        setAttendanceEntries([]);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setAttendanceEntries([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // Fetch existing attendance for selected date and class
  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedClass || !selectedDate) {
      setExistingAttendance([]);
      return;
    }

    try {
      const response = await attendanceService.getAttendance({
        classId: selectedClass,
        startDate: selectedDate,
        endDate: selectedDate,
        limit: 100
      });
      
      if (response.success) {
        const existing = response.data || [];
        // Transform Attendance[] to AttendanceRecord[]
        const transformedAttendance: AttendanceRecord[] = existing.map(record => ({
          id: record.id,
          date: record.date,
          status: record.status,
          timeIn: record.timeIn,
          reason: record.notes,
          studentId: record.studentId,
          classId: record.classId,
          student: record.student ? {
            id: record.studentId,
            name: `${record.student.firstName} ${record.student.lastName}`.trim(),
            nim: record.student.studentId
          } : undefined,
          class: record.class ? {
            id: record.classId,
            name: record.class.name
          } : undefined
        }));
        
        setExistingAttendance(transformedAttendance);
        console.log('✅ Existing attendance loaded:', transformedAttendance.length, 'records');
        
        // Update attendance entries with existing data
        if (transformedAttendance.length > 0) {
          setAttendanceEntries(prev => prev.map(entry => {
            const existingRecord = transformedAttendance.find(record => 
              record.studentId === entry.studentId && record.date === selectedDate
            );
            
            if (existingRecord) {
              return {
                ...entry,
                status: existingRecord.status,
                timeIn: existingRecord.timeIn || entry.timeIn,
                notes: existingRecord.reason || ''
              };
            }
            return entry;
          }));
        }
      } else {
        console.error('❌ Failed to fetch existing attendance:', response.error);
        setExistingAttendance([]);
      }
    } catch (error) {
      console.error('❌ Error fetching existing attendance:', error);
      setExistingAttendance([]);
    }
  }, [selectedClass, selectedDate]);

  // Initialize data
  useEffect(() => {
    fetchClasses();
    setLoading(false);
  }, [fetchClasses]);

  // Load students when class changes
  useEffect(() => {
    fetchStudentsForClass(selectedClass);
  }, [selectedClass, fetchStudentsForClass]);

  // Load existing attendance when class or date changes
  useEffect(() => {
    fetchExistingAttendance();
  }, [fetchExistingAttendance]);

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return {
          color: 'success' as const,
          icon: CheckCircle,
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          label: 'Hadir'
        };
      case 'LATE':
        return {
          color: 'warning' as const,
          icon: Clock,
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          label: 'Terlambat'
        };
      case 'ABSENT':
        return {
          color: 'danger' as const,
          icon: XCircle,
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          label: 'Tidak Hadir'
        };
      case 'EXCUSED':
        return {
          color: 'secondary' as const,
          icon: AlertCircle,
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          label: 'Izin'
        };
      default:
        return {
          color: 'default' as const,
          icon: AlertCircle,
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          label: 'Unknown'
        };
    }
  };

  // Update individual attendance entry
  const updateAttendanceEntry = (
    studentId: string, 
    field: keyof StudentAttendanceEntry, 
    value: string | undefined
  ) => {
    setAttendanceEntries(prev => prev.map(entry => 
      entry.studentId === studentId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  // Bulk operations
  const markAllPresent = () => {
    setAttendanceEntries(prev => prev.map(entry => ({
      ...entry,
      status: 'PRESENT' as const,
      timeIn: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)
    })));
  };

  const markAllAbsent = () => {
    setAttendanceEntries(prev => prev.map(entry => ({
      ...entry,
      status: 'ABSENT' as const,
      timeIn: ''
    })));
  };

  const resetAttendance = () => {
    setAttendanceEntries(prev => prev.map(entry => ({
      ...entry,
      status: 'PRESENT' as const,
      timeIn: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
      notes: ''
    })));
  };

  // Save attendance
  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate || attendanceEntries.length === 0) {
      return;
    }

    try {
      setSaving(true);
      
      // Prepare bulk attendance data
      const attendanceRecords = attendanceEntries.map(entry => ({
        studentId: entry.studentId,
        classId: selectedClass,
        date: selectedDate,
        status: entry.status,
        timeIn: entry.status === 'PRESENT' || entry.status === 'LATE' ? entry.timeIn : undefined,
        notes: entry.notes || undefined
      }));

      console.log('📤 Saving attendance records:', attendanceRecords.length);
      
      const response = await attendanceService.bulkMarkAttendance({
        attendanceRecords
      });

      if (response.success) {
        console.log('✅ Attendance saved successfully:', response.data);
        // Refresh existing attendance data
        await fetchExistingAttendance();
        alert(`✅ Berhasil menyimpan ${response.data?.successful || attendanceRecords.length} data kehadiran!`);
      } else {
        console.error('❌ Failed to save attendance:', response.error);
        alert(`❌ Gagal menyimpan: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error saving attendance:', error);
      alert('❌ Terjadi kesalahan saat menyimpan data kehadiran');
    } finally {
      setSaving(false);
    }
  };

  // Get statistics
  const getStats = () => {
    const total = attendanceEntries.length;
    const present = attendanceEntries.filter(e => e.status === 'PRESENT').length;
    const late = attendanceEntries.filter(e => e.status === 'LATE').length;
    const absent = attendanceEntries.filter(e => e.status === 'ABSENT').length;
    const excused = attendanceEntries.filter(e => e.status === 'EXCUSED').length;
    
    return { total, present, late, absent, excused };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Spinner size="lg" color="secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button 
              isIconOnly 
              variant="flat" 
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Teacher Attendance Dashboard
              </h1>
              <p className="text-white/60">
                Kelola kehadiran siswa dengan mudah dan efisien
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Pilih Kelas
                  </label>
                  <Select
                    placeholder="Pilih kelas..."
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full"
                    isLoading={classesLoading}
                    startContent={<Users className="w-4 h-4 text-white/60" />}
                  >
                    {classes.map((cls) => (
                      <SelectItem key={cls.id}>
                        {cls.name} ({cls.studentCount} siswa)
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    startContent={<Calendar className="w-4 h-4 text-white/60" />}
                  />
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col justify-end">
                  <div className="flex gap-2">
                    <Tooltip content="Tandai Semua Hadir">
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onClick={markAllPresent}
                        isDisabled={!selectedClass || attendanceEntries.length === 0}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Tandai Semua Tidak Hadir">
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onClick={markAllAbsent}
                        isDisabled={!selectedClass || attendanceEntries.length === 0}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Reset">
                      <Button
                        size="sm"
                        variant="flat"
                        onClick={resetAttendance}
                        isDisabled={!selectedClass || attendanceEntries.length === 0}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {attendanceEntries.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                    <div className="text-white/60 text-xs">Total</div>
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.present}</div>
                    <div className="text-white/60 text-xs">Hadir</div>
                  </div>
                  <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.late}</div>
                    <div className="text-white/60 text-xs">Terlambat</div>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.absent}</div>
                    <div className="text-white/60 text-xs">Tidak Hadir</div>
                  </div>
                  <div className="bg-gray-500/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-400">{stats.excused}</div>
                    <div className="text-white/60 text-xs">Izin</div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="flat"
                  startContent={<Eye className="w-4 h-4" />}
                  onClick={onViewModalOpen}
                  isDisabled={!selectedClass || attendanceEntries.length === 0}
                >
                  Lihat Data
                </Button>
                <Button
                  color="primary"
                  startContent={<Save className="w-4 h-4" />}
                  onClick={saveAttendance}
                  isLoading={saving}
                  isDisabled={!selectedClass || attendanceEntries.length === 0}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Attendance Table */}
        {selectedClass && attendanceEntries.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <Table 
                    aria-label="Attendance table"
                    className="min-w-full"
                    isHeaderSticky
                  >
                    <TableHeader>
                      <TableColumn className="bg-white/5">No</TableColumn>
                      <TableColumn className="bg-white/5">Nama Siswa</TableColumn>
                      <TableColumn className="bg-white/5">NIM</TableColumn>
                      <TableColumn className="bg-white/5">Status</TableColumn>
                      <TableColumn className="bg-white/5">Waktu Masuk</TableColumn>
                      <TableColumn className="bg-white/5">Catatan</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {attendanceEntries.map((entry, index) => (
                        <TableRow key={entry.studentId}>
                          <TableCell>
                            <span className="text-white/80">{index + 1}</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-white">
                              {entry.studentName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white/60 text-sm">
                              {entry.studentNim || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              size="sm"
                              selectedKeys={[entry.status]}
                              onSelectionChange={(selection) => {
                                const status = Array.from(selection)[0] as string;
                                updateAttendanceEntry(entry.studentId, 'status', status);
                              }}
                              className="min-w-32"
                              renderValue={(items) => {
                                const status = items[0]?.key as string;
                                const config = getStatusConfig(status);
                                return (
                                  <Chip
                                    size="sm"
                                    color={config.color}
                                    variant="flat"
                                  >
                                    {config.label}
                                  </Chip>
                                );
                              }}
                            >
                              <SelectItem key="PRESENT">
                                Hadir
                              </SelectItem>
                              <SelectItem key="LATE">
                                Terlambat
                              </SelectItem>
                              <SelectItem key="ABSENT">
                                Tidak Hadir
                              </SelectItem>
                              <SelectItem key="EXCUSED">
                                Izin
                              </SelectItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              size="sm"
                              value={entry.timeIn || ''}
                              onChange={(e) => updateAttendanceEntry(entry.studentId, 'timeIn', e.target.value)}
                              isDisabled={entry.status === 'ABSENT'}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              size="sm"
                              placeholder="Catatan..."
                              value={entry.notes || ''}
                              onChange={(e) => updateAttendanceEntry(entry.studentId, 'notes', e.target.value)}
                              className="min-w-40"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* No Data State */}
        {!studentsLoading && selectedClass && attendanceEntries.length === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardBody className="py-12">
                <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  Tidak Ada Siswa
                </h3>
                <p className="text-white/60">
                  Kelas yang dipilih belum memiliki siswa atau belum dipilih
                </p>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {studentsLoading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <Spinner size="lg" color="secondary" />
            <p className="text-white/60 mt-4">Memuat data siswa...</p>
          </motion.div>
        )}
      </div>

      {/* View Data Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={onViewModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Data Kehadiran - {selectedDate}</h3>
                <p className="text-sm text-default-500">
                  Kelas: {classes.find(c => c.id === selectedClass)?.name}
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3">
                  {attendanceEntries.map((entry, index) => {
                    const config = getStatusConfig(entry.status);
                    const StatusIcon = config.icon;
                    
                    return (
                      <div
                        key={entry.studentId}
                        className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-default-500">
                            {index + 1}.
                          </div>
                          <div>
                            <div className="font-medium">{entry.studentName}</div>
                            {entry.studentNim && (
                              <div className="text-sm text-default-500">
                                {entry.studentNim}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Chip
                            size="sm"
                            color={config.color}
                            variant="flat"
                            startContent={<StatusIcon className="w-3 h-3" />}
                          >
                            {config.label}
                          </Chip>
                          {entry.timeIn && (
                            <span className="text-sm text-default-500">
                              {entry.timeIn}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
