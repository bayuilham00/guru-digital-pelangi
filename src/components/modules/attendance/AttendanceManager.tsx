// Enhanced Attendance Management Component for Guru Digital Pelangi - Modularized
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  Button,
  useDisclosure,
  Tabs,
  Tab
} from '@heroui/react';
import { Users, Download } from 'lucide-react';
import { Attendance, Student } from '../../../services/types';

// Import modular components and hooks
import { useAttendanceData } from './hooks/useAttendanceData';
import { useAttendanceOperations } from './hooks/useAttendanceOperations';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceStats from './components/AttendanceStats';
import AttendanceTable from './components/AttendanceTable';
import AttendanceModals from './components/AttendanceModals';
import AttendanceRecap from './components/AttendanceRecap';
import { calculateAttendanceStats, getTotalPages } from './utils/attendanceUtils';
import { EditAttendanceForm, AbsentForm, AttendanceStatus, AbsentReason } from './types/attendanceTypes';

const AttendanceManager: React.FC = () => {
  // Use custom hooks for data and operations
  const {
    selectedClass,
    selectedDate,
    attendanceData,
    allStudents,
    classes,
    isLoading,
    setSelectedClass,
    setSelectedDate,
    refresh
  } = useAttendanceData();

  const { isSaving, handleQuickMarkAttendance, handleAbsentSubmit, handleEditAttendance, handleBulkMarkPresent } = useAttendanceOperations({
    selectedClass,
    selectedDate,
    allStudents,
    onDataRefresh: refresh
  });

  // Modal state
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAbsentOpen, onOpen: onAbsentOpen, onClose: onAbsentClose } = useDisclosure();

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentForAbsent, setSelectedStudentForAbsent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<EditAttendanceForm>({
    status: '',
    reason: '',
    notes: ''
  });
  const [absentForm, setAbsentForm] = useState<AbsentForm>({
    reason: 'ALPA',
    notes: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tab state
  const [activeTab, setActiveTab] = useState('daily');

  // Calculate statistics and pagination
  const stats = calculateAttendanceStats(allStudents, attendanceData);
  const totalPages = getTotalPages(allStudents.length, itemsPerPage);

  // Reset pagination when class changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass]);

  // Handle form changes
  const handleEditFormChange = (field: keyof EditAttendanceForm, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAbsentFormChange = (field: keyof AbsentForm, value: string) => {
    if (field === 'reason') {
      setAbsentForm(prev => ({ ...prev, [field]: value as AbsentReason }));
    } else {
      setAbsentForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle edit attendance click
  const handleEditClick = (student: Student, attendance: Attendance) => {
    setSelectedStudent(student);
    setEditForm({
      status: attendance.status,
      reason: attendance.reason || '',
      notes: attendance.notes || ''
    });
    onEditOpen();
  };

  // Handle absent click
  const handleAbsentClick = (student: Student) => {
    setSelectedStudentForAbsent(student);
    setAbsentForm({
      reason: 'ALPA',
      notes: ''
    });
    onAbsentOpen();
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!selectedStudent) return;
    
    const success = await handleEditAttendance(
      selectedStudent.id,
      editForm.status as AttendanceStatus,
      editForm.notes,
      editForm.status === 'ABSENT' ? editForm.reason as AbsentReason : undefined
    );
    
    if (success) {
      onEditClose();
    }
  };

  // Handle absent submit
  const handleAbsentSubmitWrapper = async () => {
    if (!selectedStudentForAbsent) return;
    
    const success = await handleAbsentSubmit(
      selectedStudentForAbsent,
      absentForm.reason,
      absentForm.notes
    );
    
    if (success) {
      onAbsentClose();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Presensi Siswa</h1>
                <p className="text-gray-600">Kelola kehadiran siswa harian</p>
              </div>
            </div>
            <Button
              color="primary"
              startContent={<Download className="w-4 h-4" />}
              variant="flat"
            >
              Export Laporan
            </Button>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs
          aria-label="Attendance tabs"
          color="primary"
          variant="underlined"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab key="daily" title="Presensi Harian">
            {/* Daily Attendance Content */}
            <div className="space-y-6">
              {/* Filters */}
              <AttendanceFilters
                classes={classes}
                selectedClass={selectedClass}
                selectedDate={selectedDate}
                isLoading={isLoading}
                isSaving={isSaving}
                onClassChange={setSelectedClass}
                onDateChange={setSelectedDate}
                onRefresh={refresh}
                onBulkMarkPresent={handleBulkMarkPresent}
              />

              {/* Statistics Cards */}
              <AttendanceStats
                stats={stats}
                isVisible={selectedClass !== '' && allStudents.length > 0}
              />

              {/* Attendance Table */}
              <AttendanceTable
                students={allStudents}
                attendanceData={attendanceData}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
                isLoading={isLoading}
                isSaving={isSaving}
                onPageChange={setCurrentPage}
                onQuickMark={handleQuickMarkAttendance}
                onEditClick={handleEditClick}
                onAbsentClick={handleAbsentClick}
              />
            </div>
          </Tab>
          
          <Tab key="recap" title="Rekap Kehadiran">
            {/* Recap Content */}
            <AttendanceRecap
              classes={classes}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
            />
          </Tab>
        </Tabs>
      </motion.div>

      {/* Modals (outside tabs) */}
      <AttendanceModals
        // Edit modal props
        isEditOpen={isEditOpen}
        onEditClose={onEditClose}
        selectedStudent={selectedStudent}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onEditSubmit={handleEditSubmit}
        
        // Absent modal props
        isAbsentOpen={isAbsentOpen}
        onAbsentClose={onAbsentClose}
        selectedStudentForAbsent={selectedStudentForAbsent}
        absentForm={absentForm}
        onAbsentFormChange={handleAbsentFormChange}
        onAbsentSubmit={handleAbsentSubmitWrapper}
        
        // Common props
        selectedDate={selectedDate}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AttendanceManager;
