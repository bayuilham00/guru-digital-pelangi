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
import { Calendar, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { attendanceService } from '../../../../services/expressApi';
import { Class } from '../types/attendanceTypes';
import { Attendance } from '../../../../services/types';

interface AttendanceRecapProps {
  classes: Class[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
}

interface RecapData {
  studentId: string;
  studentName: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
}

interface StudentAccumulator {
  [studentId: string]: {
    studentId: string;
    studentName: string;
    present: number;
    late: number;
    absent: number;
    total: number;
  };
}

const AttendanceRecap: React.FC<AttendanceRecapProps> = ({
  classes,
  selectedClass,
  onClassChange
}) => {
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const loadRecapData = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      // Get attendance data for the date range
      const response = await attendanceService.getAttendance({
        classId: selectedClass,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 1000 // Get all records
      });

      if (response.success && response.data) {
        // Process attendance data to create recap
        const attendanceByStudent = response.data.reduce((acc: StudentAccumulator, attendance: Attendance) => {
          const studentId = attendance.studentId;
          if (!acc[studentId]) {
            acc[studentId] = {
              studentId,
              studentName: attendance.student?.fullName || 'Unknown',
              present: 0,
              late: 0,
              absent: 0,
              total: 0
            };
          }
          
          acc[studentId].total++;
          if (attendance.status === 'PRESENT') acc[studentId].present++;
          else if (attendance.status === 'LATE') acc[studentId].late++;
          else if (attendance.status === 'ABSENT') acc[studentId].absent++;
          
          return acc;
        }, {} as StudentAccumulator);

        // Convert to recap format
        const recap = Object.values(attendanceByStudent).map((student) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          totalDays: student.total,
          presentDays: student.present,
          lateDays: student.late,
          absentDays: student.absent,
          attendanceRate: student.total > 0 ? Math.round((student.present / student.total) * 100) : 0
        })) as RecapData[];

        setRecapData(recap.sort((a, b) => b.attendanceRate - a.attendanceRate));
      }
    } catch (error) {
      console.error('Error loading recap data:', error);
    }
    setIsLoading(false);
  }, [selectedClass, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    loadRecapData();
  }, [loadRecapData]);

  const getAttendanceRateColor = (rate: number): "success" | "warning" | "danger" => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'danger';
  };

  const exportRecap = () => {
    // Simple CSV export
    const headers = ['Nama Siswa', 'Total Hari', 'Hadir', 'Terlambat', 'Tidak Hadir', 'Tingkat Kehadiran (%)'];
    const csvContent = [
      headers.join(','),
      ...recapData.map(student => [
        student.studentName,
        student.totalDays,
        student.presentDays,
        student.lateDays,
        student.absentDays,
        student.attendanceRate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap-presensi-${dateRange.startDate}-${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Rekap Presensi</h2>
                <p className="text-gray-600">Laporan kehadiran siswa per periode</p>
              </div>
            </div>
            <Button
              color="primary"
              startContent={<Download className="w-4 h-4" />}
              onPress={exportRecap}
              isDisabled={recapData.length === 0}
            >
              Export CSV
            </Button>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Pilih Kelas"
                placeholder="Pilih kelas"
                selectedKeys={selectedClass ? [selectedClass] : []}
                onSelectionChange={(keys) => {
                  const classId = Array.from(keys)[0] as string;
                  onClassChange(classId);
                }}
              >
                {classes.map((cls) => {
                  const subjectName = typeof cls.subject === 'object' ? cls.subject?.name : cls.subject;
                  const displayText = `${cls.name} - ${subjectName || 'No Subject'}`;
                  return (
                    <SelectItem key={cls.id} textValue={displayText}>
                      {displayText}
                    </SelectItem>
                  );
                })}
              </Select>

              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                >
                  Buat Rekap
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
            <h3 className="text-lg font-semibold">
              Rekap Kehadiran - {dateRange.startDate} s/d {dateRange.endDate}
            </h3>
          </CardHeader>
          <CardBody>
            <Table aria-label="Attendance recap table">
              <TableHeader>
                <TableColumn>NAMA SISWA</TableColumn>
                <TableColumn>TOTAL HARI</TableColumn>
                <TableColumn>HADIR</TableColumn>
                <TableColumn>TERLAMBAT</TableColumn>
                <TableColumn>TIDAK HADIR</TableColumn>
                <TableColumn>TINGKAT KEHADIRAN</TableColumn>
              </TableHeader>
              <TableBody>
                {recapData.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <div className="font-medium">{student.studentName}</div>
                    </TableCell>
                    <TableCell>
                      <Chip variant="flat" color="primary">
                        {student.totalDays} hari
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip variant="flat" color="success">
                        {student.presentDays}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip variant="flat" color="warning">
                        {student.lateDays}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip variant="flat" color="danger">
                        {student.absentDays}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={student.attendanceRate}
                          color={getAttendanceRateColor(student.attendanceRate)}
                          className="max-w-md"
                        />
                        <span className="text-sm font-medium">
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {recapData.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                Pilih kelas dan tanggal untuk melihat rekap kehadiran
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default AttendanceRecap;
