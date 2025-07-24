// AttendanceRecap - Recap/summary component for attendance
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress
} from '@heroui/react';
import { Calendar, Download, TrendingUp, BarChart3, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '../../../../services/apiClient';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface AttendanceRecapProps {
  selectedClass: string;
  selectedSubject: string;
  onBack: () => void;
}

interface ClassInfo {
  id: string;
  name: string;
  gradeLevel: number;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface Student {
  id: string;
  fullName: string;
  studentId: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  date: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  notes?: string;
  student: Student;
}

interface StudentRecap {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  totalTeachingDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  excusedDays: number;
  attendanceRate: number;
  diligenceLevel: 'Sangat Rajin' | 'Rajin' | 'Cukup' | 'Kurang Rajin' | 'Perlu Perhatian';
}

interface DateAttendanceMap {
  [date: string]: {
    [studentId: string]: AttendanceRecord;
  };
}

const AttendanceRecap: React.FC<AttendanceRecapProps> = ({
  selectedClass,
  selectedSubject,
  onBack
}) => {
  const [recapData, setRecapData] = useState<StudentRecap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentRecap | 'index';
    direction: 'asc' | 'desc';
  }>({ key: 'attendanceRate', direction: 'desc' });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Helper function to determine diligence level based on attendance rate
  const getDiligenceLevel = (rate: number): StudentRecap['diligenceLevel'] => {
    if (rate >= 95) return 'Sangat Rajin';
    if (rate >= 85) return 'Rajin';
    if (rate >= 75) return 'Cukup';
    if (rate >= 60) return 'Kurang Rajin';
    return 'Perlu Perhatian';
  };

  // Sorting function
  const handleSort = (key: keyof StudentRecap | 'index') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...recapData].sort((a, b) => {
      if (key === 'index') {
        // For index, we need to find the original index
        const aIndex = recapData.findIndex(item => item.studentId === a.studentId);
        const bIndex = recapData.findIndex(item => item.studentId === b.studentId);
        return direction === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      }
      
      let aValue = a[key];
      let bValue = b[key];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase() as any;
        bValue = (bValue as string).toLowerCase() as any;
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setRecapData(sortedData);
  };

  // Get sort icon
  const getSortIcon = (key: keyof StudentRecap | 'index') => {
    if (sortConfig.key !== key) return '⏸️';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  // Load class info from teacher attendance endpoint (which we know works)
  const loadClassInfo = useCallback(async () => {
    if (!selectedClass) return;
    
    try {
      console.log('🎓 Loading class info from teacher-attendance endpoint...');
      const response = await apiClient.get('/classes/teacher-attendance');
      const classesData = response.data.success ? response.data.data.classes : response.data;
      
      // Find the selected class in the response
      const foundClass = classesData?.find((cls: ClassInfo) => cls.id === selectedClass);
      
      if (foundClass) {
        setClassInfo(foundClass);
        console.log('✅ Class info loaded:', foundClass);
      } else {
        console.error('❌ Class not found in teacher-attendance data');
        toast.error('Tidak dapat memuat informasi kelas');
      }
    } catch (error) {
      console.error('❌ Error loading class info:', error);
      // Don't show toast error since this is not critical for the functionality
    }
  }, [selectedClass]);

  const loadRecapData = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return;
    
    setIsLoading(true);
    try {
      console.log('📊 Loading attendance recap data...');
      
      // Get all attendance records for the class, subject, and date range
      const response = await apiClient.get(`/attendance?classId=${selectedClass}&subjectId=${selectedSubject}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=1000`);
      
      const attendanceRecords: AttendanceRecord[] = response.data.success ? response.data.data.attendance : response.data?.attendance || [];
      
      console.log(`📋 Found ${attendanceRecords.length} attendance records`);
      
      if (attendanceRecords.length === 0) {
        setRecapData([]);
        toast.error('Tidak ada data absensi untuk periode yang dipilih');
        return;
      }

      // Group attendance by date to identify actual teaching days
      const attendanceByDate: DateAttendanceMap = {};
      const allStudents = new Set<string>();
      
      attendanceRecords.forEach((record) => {
        const dateKey = new Date(record.date).toISOString().split('T')[0];
        
        if (!attendanceByDate[dateKey]) {
          attendanceByDate[dateKey] = {};
        }
        
        attendanceByDate[dateKey][record.studentId] = record;
        allStudents.add(record.studentId);
      });

      // Calculate total teaching days (days where attendance was recorded)
      const totalTeachingDays = Object.keys(attendanceByDate).length;
      console.log(`📅 Total teaching days: ${totalTeachingDays}`);

      // Create student recap data
      const studentRecaps: StudentRecap[] = [];
      
      // Get all unique students from records
      const studentsData: { [key: string]: Student } = {};
      attendanceRecords.forEach(record => {
        if (!studentsData[record.studentId]) {
          studentsData[record.studentId] = record.student;
        }
      });

      // Calculate recap for each student
      Object.values(studentsData).forEach((student) => {
        let presentDays = 0;
        let lateDays = 0;
        let absentDays = 0;
        let excusedDays = 0;

        // Check each teaching day
        Object.keys(attendanceByDate).forEach((dateKey) => {
          const studentRecord = attendanceByDate[dateKey][student.id];
          
          if (studentRecord) {
            switch (studentRecord.status) {
              case 'PRESENT':
                presentDays++;
                break;
              case 'LATE':
                lateDays++;
                break;
              case 'ABSENT':
                absentDays++;
                break;
              case 'EXCUSED':
                excusedDays++;
                break;
            }
          } else {
            // If no record for this student on this teaching day, count as absent
            absentDays++;
          }
        });

        // Calculate attendance rate based on present + late (both count as attendance)
        const attendedDays = presentDays + lateDays;
        const attendanceRate = totalTeachingDays > 0 ? Math.round((attendedDays / totalTeachingDays) * 100) : 0;

        studentRecaps.push({
          studentId: student.id,
          studentName: student.fullName,
          studentIdNumber: student.studentId || '-',
          totalTeachingDays,
          presentDays,
          lateDays,
          absentDays,
          excusedDays,
          attendanceRate,
          diligenceLevel: getDiligenceLevel(attendanceRate)
        });
      });

      // Sort by attendance rate (highest first)
      studentRecaps.sort((a, b) => b.attendanceRate - a.attendanceRate);
      
      setRecapData(studentRecaps);
      
      console.log('📊 Recap data loaded:', {
        totalStudents: studentRecaps.length,
        totalTeachingDays,
        avgAttendanceRate: Math.round(studentRecaps.reduce((sum, s) => sum + s.attendanceRate, 0) / studentRecaps.length)
      });
      
      toast.success(`📊 Rekap dimuat: ${studentRecaps.length} siswa, ${totalTeachingDays} hari pembelajaran`);

    } catch (error) {
      console.error('❌ Error loading recap data:', error);
      toast.error('Gagal memuat data rekap');
    }
    setIsLoading(false);
  }, [selectedClass, selectedSubject, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    loadClassInfo();
  }, [loadClassInfo]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadRecapData();
    }
  }, [loadRecapData]);

  const getDiligenceLevelColor = (level: StudentRecap['diligenceLevel']): "success" | "primary" | "warning" | "danger" => {
    switch (level) {
      case 'Sangat Rajin': return 'success';
      case 'Rajin': return 'primary';
      case 'Cukup': return 'warning';
      case 'Kurang Rajin': return 'warning';
      case 'Perlu Perhatian': return 'danger';
      default: return 'primary';
    }
  };

  const getAttendanceRateColor = (rate: number): "success" | "warning" | "danger" => {
    if (rate >= 85) return 'success';
    if (rate >= 70) return 'warning';
    return 'danger';
  };

  const exportToExcel = () => {
    if (recapData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    // Use fallback values if classInfo is not available
    const className = classInfo?.name || `Kelas ${selectedClass}`;
    const subjectName = classInfo?.subjects?.find(s => s.id === selectedSubject)?.name || `Mata Pelajaran ${selectedSubject}`;
    
    try {
      // Prepare data for Excel export
      const excelData = recapData.map((student, index) => ({
        'No': index + 1,
        'Nama Siswa': student.studentName,
        'NISN': student.studentIdNumber,
        'Total Hari Aktif': student.totalTeachingDays,
        'Hadir': student.presentDays,
        'Terlambat': student.lateDays,
        'Tidak Hadir': student.absentDays,
        'Izin/Sakit': student.excusedDays,
        'Tingkat Kehadiran (%)': student.attendanceRate,
        'Level Kerajinan': student.diligenceLevel
      }));

      // Calculate class average
      const classAverage = Math.round(recapData.reduce((sum, s) => sum + s.attendanceRate, 0) / recapData.length);

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create the main data worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Create header information worksheet
      const headerData = [
        ['Rekap Kehadiran Siswa'],
        [''],
        ['Kelas:', className],
        ['Mata Pelajaran:', subjectName],
        ['Periode:', `${dateRange.startDate} s/d ${dateRange.endDate}`],
        ['Total Hari Pembelajaran:', recapData[0]?.totalTeachingDays || 0],
        ['Total Siswa:', recapData.length],
        ['Rata-rata Kehadiran Kelas:', `${classAverage}%`],
        [''],
        ['Dibuat pada:', new Date().toLocaleString('id-ID')],
        [''],
        ['Keterangan Level Kerajinan:'],
        ['- Sangat Rajin: ≥ 95%'],
        ['- Rajin: 85% - 94%'],
        ['- Cukup: 75% - 84%'],
        ['- Kurang Rajin: 60% - 74%'],
        ['- Perlu Perhatian: < 60%']
      ];
      
      const headerWs = XLSX.utils.aoa_to_sheet(headerData);
      
      // Set column widths for main data
      ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 25 },  // Nama Siswa
        { wch: 15 },  // NISN
        { wch: 12 },  // Total Hari Aktif
        { wch: 8 },   // Hadir
        { wch: 10 },  // Terlambat
        { wch: 12 },  // Tidak Hadir
        { wch: 10 },  // Izin/Sakit
        { wch: 18 },  // Tingkat Kehadiran
        { wch: 18 }   // Level Kerajinan
      ];
      
      // Set column widths for header
      headerWs['!cols'] = [
        { wch: 25 },
        { wch: 30 }
      ];
      
      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, headerWs, 'Informasi');
      XLSX.utils.book_append_sheet(wb, ws, 'Data Kehadiran');
      
      // Generate filename
      const filename = `rekap-kehadiran-${className?.replace(/\s+/g, '-')}-${subjectName?.replace(/\s+/g, '-')}-${dateRange.startDate}-${dateRange.endDate}.xlsx`;
      
      // Export the file
      XLSX.writeFile(wb, filename);
      
      toast.success('📊 File Excel berhasil diunduh!');
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Gagal mengekspor ke Excel');
    }
  };

  const exportRecap = () => {
    if (recapData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    // Use fallback values if classInfo is not available
    const className = classInfo?.name || `Kelas ${selectedClass}`;
    const subjectName = classInfo?.subjects?.find(s => s.id === selectedSubject)?.name || `Mata Pelajaran ${selectedSubject}`;
    
    // Enhanced CSV export with more details
    const headers = [
      'Nama Siswa', 
      'NISN',
      'Total Hari Aktif', 
      'Hadir', 
      'Terlambat', 
      'Tidak Hadir', 
      'Izin/Sakit',
      'Tingkat Kehadiran (%)',
      'Level Kerajinan'
    ];
    
    const csvContent = [
      `# Rekap Kehadiran - ${className} - ${subjectName}`,
      `# Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`,
      `# Total Hari Aktif: ${recapData[0]?.totalTeachingDays || 0} hari`,
      `# Dibuat pada: ${new Date().toLocaleString('id-ID')}`,
      '',
      headers.join(','),
      ...recapData.map(student => [
        `"${student.studentName}"`,
        student.studentIdNumber,
        student.totalTeachingDays,
        student.presentDays,
        student.lateDays,
        student.absentDays,
        student.excusedDays,
        student.attendanceRate,
        `"${student.diligenceLevel}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `rekap-kehadiran-${className?.replace(/\s+/g, '-')}-${subjectName?.replace(/\s+/g, '-')}-${dateRange.startDate}-${dateRange.endDate}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📁 File rekap berhasil diunduh!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">📊 Rekap Kehadiran Siswa</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {classInfo?.name || `Kelas ${selectedClass}`} - {classInfo?.subjects?.find(s => s.id === selectedSubject)?.name || 'Mata Pelajaran'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Berdasarkan hari-hari aktual pembelajaran oleh guru
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                color="default"
                variant="bordered"
                onPress={onBack}
                className="w-full sm:w-auto"
              >
                Kembali
              </Button>
              <Button
                color="success"
                startContent={<FileSpreadsheet className="w-4 h-4" />}
                onPress={exportToExcel}
                isDisabled={recapData.length === 0}
                className="w-full sm:w-auto"
              >
                Export Excel
              </Button>
              <Button
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                onPress={exportRecap}
                isDisabled={recapData.length === 0}
                className="w-full sm:w-auto"
              >
                Export CSV
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div className="flex items-end">
                <Button
                  color="primary"
                  className="w-full"
                  onPress={loadRecapData}
                  isLoading={isLoading}
                  startContent={<TrendingUp className="w-4 h-4" />}
                  size="sm"
                >
                  Perbarui Rekap
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Recap Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  📊 Rekap Kehadiran - {dateRange.startDate} s/d {dateRange.endDate}
                </h3>
                {recapData.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Total {recapData[0].totalTeachingDays} hari pembelajaran aktual • {recapData.length} siswa
                  </p>
                )}
              </div>
              {recapData.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Rata-rata kehadiran kelas:</span>
                  <Chip 
                    color={getAttendanceRateColor(Math.round(recapData.reduce((sum, s) => sum + s.attendanceRate, 0) / recapData.length))}
                    variant="shadow"
                    size="md"
                  >
                    {Math.round(recapData.reduce((sum, s) => sum + s.attendanceRate, 0) / recapData.length)}%
                  </Chip>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <Table aria-label="Attendance recap table">
                <TableHeader>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('index')}
                    >
                      NO {getSortIcon('index')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('studentName')}
                    >
                      NAMA SISWA {getSortIcon('studentName')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('studentIdNumber')}
                    >
                      NISN {getSortIcon('studentIdNumber')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('totalTeachingDays')}
                    >
                      HARI AKTIF {getSortIcon('totalTeachingDays')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('presentDays')}
                    >
                      HADIR {getSortIcon('presentDays')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('lateDays')}
                    >
                      TERLAMBAT {getSortIcon('lateDays')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('absentDays')}
                    >
                      TIDAK HADIR {getSortIcon('absentDays')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('excusedDays')}
                    >
                      IZIN/SAKIT {getSortIcon('excusedDays')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('attendanceRate')}
                    >
                      TINGKAT KEHADIRAN {getSortIcon('attendanceRate')}
                    </button>
                  </TableColumn>
                  <TableColumn>
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => handleSort('diligenceLevel')}
                    >
                      LEVEL KERAJINAN {getSortIcon('diligenceLevel')}
                    </button>
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {recapData.map((student, index) => (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <span className="font-medium">{index + 1}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.studentName}</div>
                          {(student.diligenceLevel === 'Kurang Rajin' || student.diligenceLevel === 'Perlu Perhatian') && (
                            <div className="text-xs text-orange-600 mt-1">
                              💬 Perlu perhatian guru
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{student.studentIdNumber}</span>
                      </TableCell>
                      <TableCell>
                        <Chip variant="flat" color="primary" size="sm">
                          {student.totalTeachingDays} hari
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip variant="solid" color="success" size="sm">
                          {student.presentDays}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip variant="solid" color="warning" size="sm">
                          {student.lateDays}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip variant="solid" color="danger" size="sm">
                          {student.absentDays}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip variant="solid" color="default" size="sm">
                          {student.excusedDays}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={student.attendanceRate}
                            color={getAttendanceRateColor(student.attendanceRate)}
                            className="max-w-24 md:max-w-32 lg:max-w-md"
                            size="sm"
                          />
                          <span className="text-sm font-medium min-w-12">
                            {student.attendanceRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          variant="solid" 
                          color={getDiligenceLevelColor(student.diligenceLevel)}
                          size="sm"
                        >
                          {student.diligenceLevel}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {recapData.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Belum Ada Data Rekap</h3>
                <p className="text-gray-400 mb-4">
                  Pilih rentang tanggal dan klik "Perbarui Rekap" untuk melihat data kehadiran
                </p>
                <Button
                  color="primary"
                  onPress={loadRecapData}
                  isLoading={isLoading}
                  startContent={<TrendingUp className="w-4 h-4" />}
                >
                  Buat Rekap Sekarang
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default AttendanceRecap;
