// AttendanceTable - Main attendance table with pagination
import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  ButtonGroup,
  Pagination
} from '@heroui/react';
import { AttendanceTableProps } from '../types/attendanceTypes';
import {
  getStatusColor,
  getStatusText,
  getStudentAttendance,
  getPaginatedItems
} from '../utils/attendanceUtils';
import { getStatusIcon } from './StatusIcon';

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  attendanceData,
  currentPage,
  itemsPerPage,
  totalPages,
  isLoading,
  isSaving,
  onPageChange,
  onQuickMark,
  onEditClick,
  onAbsentClick
}) => {
  const paginatedStudents = getPaginatedItems(students, currentPage, itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">Daftar Presensi</h3>
          <Chip color="primary" variant="flat">
            {students.length} Siswa
          </Chip>
        </CardHeader>
        <CardBody>
          <Table aria-label="Attendance table">
            <TableHeader>
              <TableColumn>NAMA SISWA</TableColumn>
              <TableColumn>NISN</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>WAKTU MASUK</TableColumn>
              <TableColumn>CATATAN</TableColumn>
              <TableColumn>AKSI CEPAT</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => {
                const attendance = getStudentAttendance(student.id, attendanceData);
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{student.studentId}</span>
                    </TableCell>
                    <TableCell>
                      {attendance ? (
                        <Chip
                          color={getStatusColor(attendance.status)}
                          variant="flat"
                          startContent={getStatusIcon(attendance.status)}
                        >
                          {getStatusText(attendance.status, attendance.reason)}
                        </Chip>
                      ) : (
                        <Chip color="default" variant="flat">
                          Belum Dicek
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      {attendance?.timeIn || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {attendance?.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {attendance ? (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => onEditClick(student, attendance)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <ButtonGroup size="sm" variant="flat">
                          <Button
                            color="success"
                            onPress={() => onQuickMark(student.id, 'PRESENT')}
                            isLoading={isSaving}
                          >
                            Hadir
                          </Button>
                          <Button
                            color="warning"
                            onPress={() => onQuickMark(student.id, 'LATE')}
                            isLoading={isSaving}
                          >
                            Terlambat
                          </Button>
                          <Button
                            color="danger"
                            onPress={() => onAbsentClick(student)}
                            isLoading={isSaving}
                          >
                            Tidak Hadir
                          </Button>
                        </ButtonGroup>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                showControls
                total={totalPages}
                initialPage={1}
                page={currentPage}
                onChange={onPageChange}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AttendanceTable;
