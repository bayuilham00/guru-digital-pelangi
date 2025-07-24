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
