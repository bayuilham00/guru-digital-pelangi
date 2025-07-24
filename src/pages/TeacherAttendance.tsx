import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardBody, 
  Button,
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
import { apiClient } from '../services/apiClient';
import { ArrowLeftIcon, EyeIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AttendanceRecap from '../components/modules/attendance/components/AttendanceRecap';

// Types
interface Student {
  id: string;
  fullName: string;
  studentId: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  studentXp?: {
    totalXp: number;
    level: number;
    levelName: string;
  };
}

interface ClassInfo {
  id: string;
  name: string;
  gradeLevel: number;
  studentCount: number;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export const TeacherAttendance: React.FC = () => {
  // State Management
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [notesData, setNotesData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showRecap, setShowRecap] = useState<boolean>(false);
  
  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('🎓 Fetching classes for teacher attendance...');
      
      const response = await apiClient.get('/classes/teacher-attendance');
      console.log('📚 Classes response:', response.data);
      
      // Handle response format {success: true, data: {classes: [...], pagination: {...}}}
      const classesData = response.data.success ? response.data.data.classes : response.data;
      setClasses(classesData || []);
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      toast.error('Gagal mengambil data kelas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = useCallback(async () => {
    if (!selectedClass?.id) return;
    
    try {
      setStudentsLoading(true);
      console.log(`📋 Fetching students for class: ${selectedClass.id}`);
      
      const response = await apiClient.get(`/students?classId=${selectedClass.id}&limit=100`);
      console.log('👥 Students response:', response.data);
      
      // Handle response format {success: true, data: {students: [...]}}
      const studentsData = response.data.success ? response.data.data.students : response.data?.students || response.data;
      setStudents(studentsData || []);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setStudentsLoading(false);
    }
  }, [selectedClass?.id]);

  // Fetch students when class or subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents();
    }
  }, [selectedClass, selectedSubject, fetchStudents]);

  // Check for existing attendance to prevent duplicates
  const checkExistingAttendance = async (classId: string, subjectId: string, date: string) => {
    try {
      const response = await apiClient.get(`/attendance?classId=${classId}&subjectId=${subjectId}&startDate=${date}&endDate=${date}&limit=100`);
      // Handle response format {success: true, data: {attendance: [...], pagination: {...}}}
      return response.data.success ? response.data.data.attendance : response.data?.attendance || [];
    } catch (error) {
      console.error('Error checking existing attendance:', error);
      return [];
    }
  };

  // Map notes to valid reason enum values
  const mapNotesToReason = (notes: string): string => {
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('izin') || lowerNotes.includes('permit')) return 'IZIN';
    if (lowerNotes.includes('sakit') || lowerNotes.includes('sick')) return 'SAKIT';
    return 'ALPA';
  };

  // Helper function to get selected subject name for better UX
  const getSelectedSubjectName = () => {
    if (!selectedSubject || !selectedClass?.subjects) return '';
    const subject = selectedClass.subjects.find(s => s.id === selectedSubject);
    return subject?.name || '';
  };

  // Save attendance data
  const saveAttendance = async () => {
    if (!selectedClass || !selectedSubject || students.length === 0) {
      toast.error('Pastikan kelas, mata pelajaran dan siswa sudah dipilih');
      return;
    }

    try {
      setSaving(true);
      console.log('🚀 SaveAttendance function called!');
      
      // Check for existing attendance
      try {
        const existingRecords = await checkExistingAttendance(selectedClass.id, selectedSubject, currentDate);
        
        if (existingRecords.length > 0) {
          const subjectName = getSelectedSubjectName();
          const confirmResult = window.confirm(
            `⚠️ PERINGATAN! Absensi untuk kelas ini, mata pelajaran "${subjectName}", dan tanggal ${currentDate} sudah ada!\n\n` +
            `Apakah Anda ingin menimpa data absensi yang sudah ada?\n\n` +
            `Klik OK untuk menimpa, atau Cancel untuk membatalkan.`
          );
          
          if (!confirmResult) {
            console.log('❌ User cancelled overwrite');
            setSaving(false);
            return;
          }
          
          console.log('✅ User confirmed overwrite');
        } else {
          console.log('✅ No existing attendance found, proceeding...');
        }
      } catch (checkError) {
        console.error('❌ Error checking existing attendance:', checkError);
        // Continue with save if check fails (don't block the process)
      }

      console.log('✅ Validation passed, preparing attendance records...');

      const attendanceRecords = students.map(student => {
        const status = attendanceData[student.id] || 'PRESENT';
        const notes = notesData[student.id] || '';
        
        return {
          studentId: student.id,
          classId: selectedClass.id,
          subjectId: selectedSubject,
          date: currentDate,
          status,
          notes: notes.trim(),
          reason: status === 'ABSENT' ? mapNotesToReason(notes) : undefined
        };
      });

      const payload = {
        attendanceRecords: attendanceRecords
      };

      console.log('📡 Sending attendance payload:', payload);

      const response = await apiClient.post('/attendance/bulk', payload);
      console.log('✅ Attendance saved successfully!', response.data);

      // Debug: Check response structure
      console.log('🔍 Response structure:', {
        responseData: response.data,
        dataProperty: response.data.data,
        successful: response.data.data?.successful,
        failed: response.data.data?.failed,
        total: response.data.data?.total
      });

      // Show success message with details from backend response
      const responseData = response.data.data || {};
      const { successful, failed, total } = responseData;
      
      console.log('🎯 Toast values:', { successful, failed, total });
      
      if (successful > 0) {
        const message = `🎉 Absensi berhasil disimpan! ${successful} siswa berhasil${failed > 0 ? `, ${failed} gagal` : ''} dari total ${total} siswa`;
        console.log('📢 Showing toast:', message);
        toast.success(message, { duration: 4000 });
      } else {
        console.log('❌ No successful records, showing error');
        toast.error('Gagal menyimpan semua data absensi');
      }

      // Clear the form
      setAttendanceData({});
      setNotesData({});
      
    } catch (error) {
      console.error('❌ Error saving attendance:', error);
      if (error.response?.data?.message) {
        toast.error(`Gagal menyimpan absensi: ${error.response.data.message}`);
      } else {
        toast.error('Gagal menyimpan absensi. Silakan coba lagi.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Auto-load existing attendance when date/class/subject changes
  const loadExistingAttendance = useCallback(async () => {
    if (!selectedClass?.id || !selectedSubject || !currentDate || students.length === 0) return;

    try {
      console.log('📅 Loading existing attendance for pre-fill...');
      const response = await apiClient.get(
        `/attendance?classId=${selectedClass.id}&subjectId=${selectedSubject}&startDate=${currentDate}&endDate=${currentDate}&limit=100`
      );
      
      const existingAttendance = response.data.success ? response.data.data.attendance : response.data?.attendance || [];
      
      if (existingAttendance.length > 0) {
        console.log(`📋 Found ${existingAttendance.length} existing attendance records`);
        
        // Pre-fill form with existing data
        const newAttendanceData: Record<string, string> = {};
        const newNotesData: Record<string, string> = {};
        
        existingAttendance.forEach((record: any) => {
          newAttendanceData[record.studentId] = record.status;
          if (record.notes) {
            newNotesData[record.studentId] = record.notes;
          }
        });
        
        setAttendanceData(newAttendanceData);
        setNotesData(newNotesData);
        
        toast.success(`📋 Memuat data absensi yang sudah ada (${existingAttendance.length} siswa)`);
      } else {
        // Clear form if no existing data
        setAttendanceData({});
        setNotesData({});
      }
    } catch (error) {
      console.error('❌ Error loading existing attendance:', error);
      // Don't show error toast for this background operation
    }
  }, [selectedClass?.id, selectedSubject, currentDate, students.length]);

  // Load existing attendance when dependencies change
  useEffect(() => {
    if (selectedClass && selectedSubject && currentDate && students.length > 0) {
      const timeoutId = setTimeout(() => {
        loadExistingAttendance();
      }, 500); // Debounce to avoid too many requests

      return () => clearTimeout(timeoutId);
    }
  }, [loadExistingAttendance]);

  // View existing attendance data
  const viewAttendanceData = async () => {
    if (!selectedClass || !selectedSubject) {
      toast.error('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    try {
      console.log('👀 Viewing attendance data...');
      const response = await apiClient.get(
        `/attendance?classId=${selectedClass.id}&subjectId=${selectedSubject}&startDate=${currentDate}&endDate=${currentDate}&limit=100`
      );
      
      const attendanceRecords = response.data.success ? response.data.data.attendance : response.data?.attendance || [];
      
      if (attendanceRecords.length === 0) {
        toast.error('Tidak ada data absensi untuk tanggal ini');
        return;
      }

      // Format data untuk ditampilkan
      const attendanceInfo = attendanceRecords.map((record: any) => 
        `${record.student?.fullName || 'Unknown'}: ${record.status}`
      ).join('\n');

      const subjectName = getSelectedSubjectName();
      alert(
        `📊 Data Absensi\n\n` +
        `Kelas: ${selectedClass.name}\n` +
        `Mata Pelajaran: ${subjectName}\n` +
        `Tanggal: ${currentDate}\n` +
        `Total: ${attendanceRecords.length} siswa\n\n` +
        `Detail:\n${attendanceInfo}`
      );

    } catch (error) {
      console.error('❌ Error viewing attendance:', error);
      toast.error('Gagal mengambil data absensi');
    }
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setNotesData(prev => ({
      ...prev,
      [studentId]: notes
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <Spinner size="lg" color="secondary" />
            <p className="text-white text-lg">Tolong Sabar ya...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Show AttendanceRecap if requested
  if (showRecap && selectedClass && selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <AttendanceRecap
            selectedClass={selectedClass.id}
            selectedSubject={selectedSubject}
            onBack={() => setShowRecap(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            startContent={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Kembali ke Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            📋 Absensi Siswa
          </h1>
          <p className="text-white/70 text-lg">
            Kelola kehadiran siswa untuk setiap mata pelajaran
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardBody className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                Pilih Kelas
              </h3>
              <Select
                placeholder="Pilih kelas..."
                variant="bordered"
                classNames={{
                  trigger: "bg-white/10 border-white/20 text-white data-[hover=true]:bg-white/20",
                  value: "text-white font-medium",
                  selectorIcon: "text-white",
                  popoverContent: "bg-slate-800 border-white/20",
                  listbox: "bg-slate-800",
                  listboxWrapper: "bg-slate-800"
                }}
                selectedKeys={selectedClass ? new Set([selectedClass.id]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  const classInfo = classes.find(c => c.id === selectedKey);
                  setSelectedClass(classInfo || null);
                  setSelectedSubject(''); // Reset subject when class changes
                }}
              >
                {classes.map((classInfo) => (
                  <SelectItem 
                    key={classInfo.id}
                    classNames={{
                      base: "text-white hover:bg-white/10 hover:text-black data-[hover=true]:bg-white/20 data-[hover=true]:text-black",
                      title: "text-white group-hover:text-black"
                    }}
                  >
                    {classInfo.name} 
                  </SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardBody className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                📚 Pilih Mata Pelajaran
              </h3>
              <Select
                placeholder="Pilih mata pelajaran..."
                variant="bordered"
                classNames={{
                  trigger: "bg-white/10 border-white/20 text-white data-[hover=true]:bg-white/20",
                  value: "text-white font-medium",
                  selectorIcon: "text-white",
                  popoverContent: "bg-slate-800 border-white/20",
                  listbox: "bg-slate-800",
                  listboxWrapper: "bg-slate-800"
                }}
                selectedKeys={selectedSubject ? new Set([selectedSubject]) : new Set()}
                onSelectionChange={(keys) => setSelectedSubject(Array.from(keys)[0] as string)}
                isDisabled={!selectedClass}
              >
                {(selectedClass?.subjects || []).map((subject) => (
                  <SelectItem 
                    key={subject.id}
                    classNames={{
                      base: "text-white hover:bg-white/10 hover:text-black data-[hover=true]:bg-white/20 data-[hover=true]:text-black",
                      title: "text-white group-hover:text-black"
                    }}
                  >
                    {subject.name}
                  </SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardBody className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                📅 Pilih Tanggal
              </h3>
              <Input
                type="date"
                variant="bordered"
                classNames={{
                  input: "text-white",
                  inputWrapper: "bg-white/10 border-white/20 text-white"
                }}
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
              />
            </CardBody>
          </Card>
        </div>

        {/* Action Buttons */}
        {selectedClass && selectedSubject && (
          <div className="flex gap-4 mb-8">
            <Button
              color="success"
              size="lg"
              startContent={<CheckCircleIcon className="w-5 h-5" />}
              onClick={saveAttendance}
              isLoading={saving}
              isDisabled={students.length === 0}
            >
              Simpan Absensi
            </Button>
            
            <Button
              color="secondary"
              variant="bordered"
              size="lg"
              startContent={<EyeIcon className="w-5 h-5" />}
              onClick={viewAttendanceData}
            >
              Lihat Data
            </Button>

            <Button
              color="warning"
              variant="bordered"
              size="lg"
              startContent={<ChartBarIcon className="w-5 h-5" />}
              onClick={() => setShowRecap(true)}
            >
              Rekap Kehadiran
            </Button>
          </div>
        )}

        {/* Students Table */}
        {studentsLoading ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardBody className="flex items-center justify-center p-12">
              <Spinner size="lg" color="secondary" />
              <p className="text-white mt-4">Memuat data siswa...</p>
            </CardBody>
          </Card>
        ) : students.length > 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardBody className="p-0">
              <Table
                aria-label="Attendance table"
                classNames={{
                  wrapper: "bg-transparent",
                  th: "bg-white/10 text-white font-semibold",
                  td: "text-white/90"
                }}
              >
                <TableHeader>
                  <TableColumn>NO</TableColumn>
                  <TableColumn>NAMA SISWA</TableColumn>
                  <TableColumn>NIS</TableColumn>
                  <TableColumn>STATUS KEHADIRAN</TableColumn>
                  <TableColumn>KETERANGAN</TableColumn>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <Select
                          size="sm"
                          variant="bordered"
                          classNames={{
                            trigger: "bg-white/10 border-white/20 text-white min-w-32 data-[hover=true]:bg-white/20",
                            value: "text-white font-medium",
                            selectorIcon: "text-white",
                            popoverContent: "bg-slate-800 border-white/20",
                            listbox: "bg-slate-800",
                            listboxWrapper: "bg-slate-800"
                          }}
                          selectedKeys={new Set([attendanceData[student.id] || 'PRESENT'])}
                          onSelectionChange={(keys) => 
                            handleAttendanceChange(student.id, Array.from(keys)[0] as string)
                          }
                        >
                          <SelectItem 
                            key="PRESENT"
                            classNames={{
                              base: "text-white hover:bg-white/10 hover:text-black data-[hover=true]:bg-white/20 data-[hover=true]:text-black",
                              title: "text-white group-hover:text-black"
                            }}
                          >
                            Hadir
                          </SelectItem>
                          <SelectItem 
                            key="LATE"
                            classNames={{
                              base: "text-white hover:bg-white/10 hover:text-black data-[hover=true]:bg-white/20 data-[hover=true]:text-black",
                              title: "text-white group-hover:text-black"
                            }}
                          >
                            Terlambat
                          </SelectItem>
                          <SelectItem 
                            key="ABSENT"
                            classNames={{
                              base: "text-white hover:bg-white/10 hover:text-black data-[hover=true]:bg-white/20 data-[hover=true]:text-black",
                              title: "text-white group-hover:text-black"
                            }}
                          >
                            Tidak Hadir
                          </SelectItem>
                          <SelectItem 
                            key="EXCUSED"
                            classNames={{
                              base: "text-white hover:bg-white/10 hover:text-black data-[hover=true]:bg-white/20 data-[hover=true]:text-black",
                              title: "text-white group-hover:text-black"
                            }}
                          >
                            Izin
                          </SelectItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          size="sm"
                          variant="bordered"
                          placeholder="Keterangan (opsional)"
                          classNames={{
                            input: "text-white",
                            inputWrapper: "bg-white/10 border-white/20"
                          }}
                          value={notesData[student.id] || ''}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        ) : selectedClass && selectedSubject ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardBody className="flex items-center justify-center p-12">
              <UserGroupIcon className="w-16 h-16 text-white/40 mb-4" />
              <p className="text-white/70 text-lg">Tidak ada siswa ditemukan</p>
            </CardBody>
          </Card>
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardBody className="flex items-center justify-center p-12">
              <ClockIcon className="w-16 h-16 text-white/40 mb-4" />
              <p className="text-white/70 text-lg">Silakan pilih kelas dan mata pelajaran terlebih dahulu</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
