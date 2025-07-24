import React, { useState, useEffect } from 'react';
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
} from '@nextui-org/react';
import { apiClient } from '../api/client';
import { ArrowLeftIcon, EyeIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
  
  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when class or subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents();
    }
  }, [selectedClass, selectedSubject]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('🎓 Fetching classes for teacher attendance...');
      
      const response = await apiClient.get('/classes/teacher-attendance');
      console.log('📚 Classes response:', response.data);
      
      setClasses(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      toast.error('Gagal mengambil data kelas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass?.id) return;
    
    try {
      setStudentsLoading(true);
      console.log(`📋 Fetching students for class: ${selectedClass.id}`);
      
      const response = await apiClient.get(`/students?classId=${selectedClass.id}&limit=100`);
      console.log('👥 Students response:', response.data);
      
      setStudents(response.data?.students || []);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Check for existing attendance to prevent duplicates
  const checkExistingAttendance = async (classId: string, subjectId: string, date: string) => {
    try {
      const response = await apiClient.get(`/attendance?classId=${classId}&subjectId=${subjectId}&startDate=${date}&endDate=${date}&limit=100`);
      return response.data?.attendance || [];
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
          status,
          notes: notes.trim(),
          reason: status === 'ABSENT' ? mapNotesToReason(notes) : undefined
        };
      });

      const payload = {
        classId: selectedClass.id,
        subjectId: selectedSubject,
        date: currentDate,
        records: attendanceRecords
      };

      console.log('📡 Sending attendance payload:', payload);

      const response = await apiClient.post('/attendance/bulk', payload);
      console.log('✅ Attendance saved successfully!', response.data);

      toast.success(`Absensi berhasil disimpan! ${students.length} dari ${students.length} siswa`);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'LATE': return 'warning';
      case 'ABSENT': return 'danger';
      case 'EXCUSED': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Hadir';
      case 'LATE': return 'Terlambat';
      case 'ABSENT': return 'Tidak Hadir';
      case 'EXCUSED': return 'Izin';
      default: return 'Hadir';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <Spinner size="lg" color="secondary" />
            <p className="text-white text-lg">Memuat data kelas...</p>
          </CardBody>
        </Card>
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
                  trigger: "bg-white/10 border-white/20 text-white",
                  value: "text-white",
                  popoverContent: "bg-slate-800 border-white/20"
                }}
                selectedKeys={selectedClass ? [selectedClass.id] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  const classInfo = classes.find(c => c.id === selectedKey);
                  setSelectedClass(classInfo || null);
                  setSelectedSubject(''); // Reset subject when class changes
                }}
              >
                {classes.map((classInfo) => (
                  <SelectItem key={classInfo.id} value={classInfo.id}>
                    {classInfo.name} ({classInfo.studentCount} siswa)
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
                  trigger: "bg-white/10 border-white/20 text-white",
                  value: "text-white",
                  popoverContent: "bg-slate-800 border-white/20"
                }}
                selectedKeys={selectedSubject ? [selectedSubject] : []}
                onSelectionChange={(keys) => setSelectedSubject(Array.from(keys)[0] as string)}
                isDisabled={!selectedClass}
              >
                {(selectedClass?.subjects || []).map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
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
              onClick={() => {/* TODO: View existing attendance */}}
            >
              Lihat Data
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
                            trigger: "bg-white/10 border-white/20 text-white min-w-32",
                            value: "text-white",
                            popoverContent: "bg-slate-800 border-white/20"
                          }}
                          selectedKeys={[attendanceData[student.id] || 'PRESENT']}
                          onSelectionChange={(keys) => 
                            handleAttendanceChange(student.id, Array.from(keys)[0] as string)
                          }
                        >
                          <SelectItem key="PRESENT" value="PRESENT">
                            <Chip color="success" size="sm">Hadir</Chip>
                          </SelectItem>
                          <SelectItem key="LATE" value="LATE">
                            <Chip color="warning" size="sm">Terlambat</Chip>
                          </SelectItem>
                          <SelectItem key="ABSENT" value="ABSENT">
                            <Chip color="danger" size="sm">Tidak Hadir</Chip>
                          </SelectItem>
                          <SelectItem key="EXCUSED" value="EXCUSED">
                            <Chip color="secondary" size="sm">Izin</Chip>
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

interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  studentNim: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn: string;
  notes: string;
}

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
    nim: string;
  };
  class?: {
    id: string;
    name: string;
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
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceEntries, setAttendanceEntries] = useState<StudentAttendanceEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate();

  // Helper function to get selected subject name
  const getSelectedSubjectName = () => {
    const selectedClassData = classes.find(cls => cls.id === selectedClass);
    const subject = selectedClassData?.subjects?.find(subj => subj.id === selectedSubject);
    return subject?.name || 'Unknown Subject';
  };

  // Function to check if attendance already exists for the selected date and subject
  const checkExistingAttendance = async () => {
    if (!selectedClass || !selectedDate || !selectedSubject) return false;
    
    try {
      const response = await apiClient.get('/attendance', {
        params: {
          classId: selectedClass,
          startDate: selectedDate,
          endDate: selectedDate,
          subjectId: selectedSubject
        }
      });
      
      return response.data?.success && response.data?.data?.attendance?.length > 0;
    } catch (error) {
      console.error('Error checking existing attendance:', error);
      return false;
    }
  };

  // Save attendance data
  const saveAttendance = async () => {
    console.log('🚀 SaveAttendance function called!');
    
    try {
      setSaving(true);
      
      if (!selectedClass || !selectedDate || !selectedSubject || attendanceEntries.length === 0) {
        console.error('❌ Validation failed:', { selectedClass, selectedDate, selectedSubject, entriesLength: attendanceEntries.length });
        alert('Pastikan kelas, mata pelajaran, dan tanggal sudah dipilih');
        return;
      }

      // Check if attendance already exists for this class, subject, and date
      console.log('🔍 Checking for existing attendance...');
      try {
        const checkResponse = await apiClient.get(`/attendance?classId=${selectedClass}&startDate=${selectedDate}&endDate=${selectedDate}&subjectId=${selectedSubject}`);
        
        if (checkResponse.data?.success && checkResponse.data?.data?.attendance?.length > 0) {
          const existingRecords = checkResponse.data.data.attendance;
          console.log('⚠️ Found existing attendance records:', existingRecords.length);
          
          const confirmOverwrite = window.confirm(
            `⚠️ PERINGATAN!\n\nAbsensi untuk kelas ini, mata pelajaran "${getSelectedSubjectName()}", dan tanggal ${new Date(selectedDate).toLocaleDateString('id-ID')} sudah ada (${existingRecords.length} record).\n\n` +
            `Melanjutkan akan MENIMPA data absensi yang sudah ada.\n\n` +
            `Apakah Anda yakin ingin melanjutkan?`
          );
          
          if (!confirmOverwrite) {
            console.log('📝 User cancelled overwrite');
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
          status,
          notes: notes.trim(),
          reason: status === 'ABSENT' ? mapNotesToReason(notes) : undefined
        };
      });

      const payload = {
        classId: selectedClass?.id,
        subjectId: selectedSubject,
        date: currentDate,
        records: attendanceRecords
      };

      console.log('📡 Sending attendance payload:', payload);

      const response = await apiClient.post('/attendance/bulk', payload);
      console.log('✅ Attendance saved successfully!', response.data);

      toast.success(`Absensi berhasil disimpan! ${students.length} dari ${students.length} siswa`);

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
    }
  };

  // Helper function to get selected subject name for better UX
  const getSelectedSubjectName = () => {
    if (!selectedSubject || !selectedClass?.subjects) return '';
    const subject = selectedClass.subjects.find(s => s.id === selectedSubject);
    return subject?.name || '';
  };

  // Map notes to valid reason enum values
  const mapNotesToReason = (notes: string): string => {
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('izin') || lowerNotes.includes('permit')) return 'IZIN';
    if (lowerNotes.includes('sakit') || lowerNotes.includes('sick')) return 'SAKIT';
    return 'ALPA';
  };

export const TeacherAttendance: React.FC = () => {
  // State Management
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
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

  // Helper function to get selected subject name
  const getSelectedSubjectName = () => {
    if (!selectedClass || !selectedSubject) return '';
    
    const selectedClassInfo = classes.find(c => c.id === selectedClass);
    if (!selectedClassInfo || !selectedClassInfo.subjects) return '';
    
    const subject = selectedClassInfo.subjects.find(s => s.id === selectedSubject);
    return subject?.name || '';
  };

  // Fetch available classes for teacher
  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true);
      console.log('🔍 Fetching classes for teacher attendance...');
      
      const response = await apiClient.get('/classes/teacher-attendance');
      console.log('📥 Teacher Classes API response:', {
        success: response.data.success,
        data: response.data.data,
        dataLength: response.data.data?.classes?.length,
        fullResponse: response.data
      });
      
      if (response.data.success) {
        const classes = response.data.data.classes || [];
        console.log('📊 Raw teacher classes data:', classes);
        
        // Keep the full class data including subjects
        setClasses(classes);
        console.log('✅ Teacher classes set with subjects:', classes);
      } else {
        console.error('❌ Failed to fetch teacher classes:', response.data.error);
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching teacher classes:', error);
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

  // Fetch existing attendance for selected date, class, and subject
  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedClass || !selectedDate || !selectedSubject) {
      setExistingAttendance([]);
      return;
    }

    try {
      const response = await attendanceService.getAttendance({
        classId: selectedClass,
        subjectId: selectedSubject,
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
  }, [selectedClass, selectedSubject, selectedDate]);

  // Initialize data
  useEffect(() => {
    fetchClasses();
    setLoading(false);
  }, [fetchClasses]);

  // Load students when class changes
  useEffect(() => {
    fetchStudentsForClass(selectedClass);
    // Reset subject when class changes
    setSelectedSubject('');
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

  // Save attendance to backend
  const saveAttendance = async () => {
    console.log('🚀 SaveAttendance function called!');
    
    try {
      setSaving(true);
      
      if (!selectedClass || !selectedDate || !selectedSubject || attendanceEntries.length === 0) {
        console.error('❌ Validation failed:', { selectedClass, selectedDate, selectedSubject, entriesLength: attendanceEntries.length });
        alert('Pastikan kelas, mata pelajaran, dan tanggal sudah dipilih');
        return;
      }

      console.log('✅ Validation passed, preparing attendance records...');

      // Transform attendance entries to API format
      const attendanceRecords = attendanceEntries.map(entry => {
        // For ABSENT status, ensure we have a valid reason enum value
        let reason = null;
        if (entry.status === 'ABSENT') {
          // Map notes to valid enum values, default to 'ALPA' if no valid mapping
          const noteText = (entry.notes || '').toLowerCase().trim();
          if (noteText.includes('izin') || noteText.includes('permission')) {
            reason = 'IZIN';
          } else if (noteText.includes('sakit') || noteText.includes('sick')) {
            reason = 'SAKIT';
          } else {
            reason = 'ALPA'; // Default for absent without specific reason
          }
        }
        
        return {
          studentId: entry.studentId,
          classId: selectedClass,
          subjectId: selectedSubject,
          date: selectedDate,
          status: entry.status,
          reason: reason,
          timeIn: entry.timeIn || null,
          notes: entry.notes || null
        };
      });

      console.log('💾 Sending attendance records to API:', {
        endpoint: '/attendance/bulk',
        classId: selectedClass,
        date: selectedDate,
        recordsCount: attendanceRecords.length,
        sampleRecord: attendanceRecords[0]
      });

      console.log('🔄 Making API call...');
      const response = await apiClient.post('/attendance/bulk', {
        attendanceRecords
      });

      console.log('📥 API Response received:', response);
      console.log('📥 API Response data:', response.data);

      if (response.data?.success) {
        const { successful, failed, total } = response.data.data;
        console.log(`✅ Save successful: ${successful}/${total} records saved`);
        alert(`✅ Absensi berhasil disimpan! ${successful} dari ${total} siswa`);
        
        // Refresh existing attendance to show updated data
        console.log('🔄 Refreshing attendance data...');
        fetchExistingAttendance();
      } else {
        console.error('❌ API returned error:', response.data);
        alert('Gagal menyimpan absensi: ' + (response.data?.error || response.data?.message || 'Unknown error'));
      }

    } catch (error) {
      console.error('❌ Error saving attendance:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Terjadi kesalahan saat menyimpan absensi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
      console.log('🏁 SaveAttendance function completed');
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
          <Card className="bg-white/8 backdrop-blur-xl border border-white/30 shadow-xl">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-white text-base font-semibold mb-3">
                    Pilih Kelas
                  </label>
                  <Select
                    placeholder="Pilih kelas..."
                    selectedKeys={selectedClass ? [selectedClass] : []}
                    onSelectionChange={(selection) => {
                      const classId = Array.from(selection)[0] as string;
                      setSelectedClass(classId);
                    }}
                    className="w-full"
                    classNames={{
                      trigger: "bg-white/8 backdrop-blur-md border border-white/30 text-white hover:bg-white/12 transition-colors duration-200",
                      value: "text-white font-medium text-base !text-white",
                      popoverContent: "bg-slate-900/95 backdrop-blur-xl border border-white/30",
                      listbox: "bg-transparent",
                      innerWrapper: "text-white",
                      selectorIcon: "text-white"
                    }}
                    isLoading={classesLoading}
                    startContent={<Users className="w-4 h-4 text-white/60" />}
                    renderValue={(items) => {
                      if (items.length === 0) return "Pilih kelas...";
                      const selectedItem = items[0];
                      const selectedClassData = classes.find(cls => cls.id === selectedItem.key);
                      return (
                        <span className="text-white font-medium text-base">
                          {selectedClassData?.name} ({selectedClassData?.studentCount} siswa)
                        </span>
                      );
                    }}
                  >
                    {classes.map((cls) => (
                      <SelectItem 
                        key={cls.id}
                        textValue={`${cls.name} (${cls.studentCount} siswa)`}
                        className="text-white hover:bg-white/15 backdrop-blur-sm text-base font-medium"
                      >
                        <span className="text-white font-medium">
                          {cls.name} ({cls.studentCount} siswa)
                        </span>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-white text-base font-semibold mb-3">
                    Mata Pelajaran
                  </label>
                  <Select
                    placeholder="Pilih mata pelajaran..."
                    selectedKeys={selectedSubject ? [selectedSubject] : []}
                    onSelectionChange={(selection) => {
                      const subjectId = Array.from(selection)[0] as string;
                      setSelectedSubject(subjectId);
                    }}
                    className="w-full"
                    classNames={{
                      trigger: "bg-white/8 backdrop-blur-md border border-white/30 text-white hover:bg-white/12 transition-colors duration-200",
                      value: "text-white font-medium text-base !text-white",
                      popoverContent: "bg-slate-900/95 backdrop-blur-xl border border-white/30",
                      listbox: "bg-transparent",
                      innerWrapper: "text-white",
                      selectorIcon: "text-white"
                    }}
                    isDisabled={!selectedClass || !classes.find(cls => cls.id === selectedClass)?.subjects?.length}
                    startContent={<BookOpen className="w-4 h-4 text-white/60" />}
                    renderValue={(items) => {
                      if (items.length === 0) return "Pilih mata pelajaran...";
                      const selectedItem = items[0];
                      const selectedClassData = classes.find(cls => cls.id === selectedClass);
                      const selectedSubjectData = selectedClassData?.subjects?.find(subj => subj.id === selectedItem.key);
                      return (
                        <span className="text-white font-medium text-base">
                          {selectedSubjectData?.name} ({selectedSubjectData?.code})
                        </span>
                      );
                    }}
                  >
                    {selectedClass && classes.find(cls => cls.id === selectedClass)?.subjects?.map((subject) => (
                      <SelectItem 
                        key={subject.id}
                        textValue={`${subject.name} (${subject.code})`}
                        className="text-white hover:bg-white/15 backdrop-blur-sm text-base font-medium"
                      >
                        <span className="text-white font-medium">
                          {subject.name} ({subject.code})
                        </span>
                      </SelectItem>
                    )) || []}
                  </Select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-white text-base font-semibold mb-3">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-white/8 backdrop-blur-md border border-white/30 hover:bg-white/12 transition-colors duration-200",
                      input: "text-white font-medium text-base !text-white"
                    }}
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
                  <div className="bg-yellow-700/20 rounded-lg p-3 text-center">
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
                  isDisabled={!selectedClass || !selectedSubject || attendanceEntries.length === 0}
                >
                  Lihat Data
                </Button>
                <Button
                  color="primary"
                  startContent={<Save className="w-4 h-4" />}
                  onClick={saveAttendance}
                  isLoading={saving}
                  isDisabled={!selectedClass || !selectedSubject || attendanceEntries.length === 0}
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
            <Card className="bg-transparent border-none shadow-none">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <Table 
                    aria-label="Attendance table"
                    className="min-w-full"
                    isHeaderSticky
                    classNames={{
                      wrapper: "bg-transparent shadow-none",
                      table: "bg-transparent",
                      thead: "bg-transparent",
                      tbody: "bg-transparent"
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="bg-white/5 backdrop-blur-sm border-b border-white/20 text-white text-lg font-semibold">
                        No
                      </TableColumn>
                      <TableColumn className="bg-white/5 backdrop-blur-sm border-b border-white/20 text-white text-lg font-semibold">
                        Nama Siswa
                      </TableColumn>
                      <TableColumn className="bg-white/5 backdrop-blur-sm border-b border-white/20 text-white text-lg font-semibold">
                        NISN
                      </TableColumn>
                      <TableColumn className="bg-white/5 backdrop-blur-sm border-b border-white/20 text-white text-lg font-semibold">
                        Status
                      </TableColumn>
                      <TableColumn className="bg-white/5 backdrop-blur-sm border-b border-white/20 text-white text-lg font-semibold">
                        Jam Masuk
                      </TableColumn>
                      <TableColumn className="bg-whitet/5 backdrop-blur-sm border-b border-white/20 text-white text-lg font-semibold">
                        Catatan
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      {attendanceEntries.map((entry, index) => (
                        <TableRow 
                          key={entry.studentId} 
                          className="hover:bg-white/3 backdrop-blur-sm border-b border-white/10 transition-colors duration-200"
                        >
                          <TableCell className="bg-white/3 backdrop-blur-sm text-white text-base font-medium py-4">
                            {index + 1}
                          </TableCell>
                          <TableCell className="bg-white/3 backdrop-blur-sm text-white text-base font-medium py-4">
                            {entry.studentName}
                          </TableCell>
                          <TableCell className="bg-white/3 backdrop-blur-sm text-white/90 text-base py-4">
                            <span className="text-white/90 text-base">
                              {entry.studentNim || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="bg-white/3 backdrop-blur-sm py-4">
                            <Select
                              size="md"
                              selectedKeys={[entry.status]}
                              onSelectionChange={(selection) => {
                                const status = Array.from(selection)[0] as string;
                                updateAttendanceEntry(entry.studentId, 'status', status);
                              }}
                              className="min-w-36"
                              classNames={{
                                trigger: "bg-white/8 backdrop-blur-md border border-white/30 hover:bg-white/12 transition-colors duration-200",
                                value: "text-white font-medium !text-white",
                                popoverContent: "bg-slate-900/95 backdrop-blur-xl border border-white/30",
                                listbox: "bg-transparent",
                                innerWrapper: "text-white",
                                selectorIcon: "text-white"
                              }}
                              renderValue={(items) => {
                                const status = items[0]?.key as string;
                                const config = getStatusConfig(status);
                                return (
                                  <Chip
                                    size="sm"
                                    color={config.color}
                                    variant="solid"
                                  >
                                    {config.label}
                                  </Chip>
                                );
                              }}
                            >
                              <SelectItem 
                                key="PRESENT"
                                className="text-white hover:bg-white/15 backdrop-blur-sm text-base"
                              >
                                Hadir
                              </SelectItem>
                              <SelectItem 
                                key="LATE"
                                className="text-white hover:bg-white/15 backdrop-blur-sm text-base"
                              >
                                Terlambat
                              </SelectItem>
                              <SelectItem 
                                key="ABSENT"
                                className="text-white hover:bg-white/15 backdrop-blur-sm text-base"
                              >
                                Tidak Hadir
                              </SelectItem>
                              <SelectItem 
                                key="EXCUSED"
                                className="text-white hover:bg-white/15 backdrop-blur-sm text-base"
                              >
                                Izin
                              </SelectItem>
                            </Select>
                          </TableCell>
                          <TableCell className="bg-white/3 backdrop-blur-sm py-4">
                            <Input
                              type="time"
                              size="md"
                              value={entry.timeIn || ''}
                              onChange={(e) => updateAttendanceEntry(entry.studentId, 'timeIn', e.target.value)}
                              isDisabled={entry.status === 'ABSENT'}
                              className="w-36"
                              classNames={{
                                inputWrapper: "bg-white/8 backdrop-blur-md border border-white/30 hover:bg-white/12 transition-colors duration-200",
                                input: "text-white font-medium text-base !text-white"
                              }}
                            />
                          </TableCell>
                          <TableCell className="bg-white/3 backdrop-blur-sm py-4">
                            <Input
                              size="md"
                              placeholder={entry.status === 'ABSENT' ? "Catatan (izin/sakit/lainnya)..." : "Catatan..."}
                              value={entry.notes || ''}
                              onChange={(e) => updateAttendanceEntry(entry.studentId, 'notes', e.target.value)}
                              className="min-w-48"
                              classNames={{
                                inputWrapper: "bg-black/8 backdrop-blur-md border border-white/30 hover:bg-blue transition-colors duration-200",
                                input: "text-white font-medium text-base placeholder:text-white/60 !text-white"
                              }}
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
            <Card className="bg-white/8 backdrop-blur-xl border border-white/30 shadow-xl">
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
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
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
