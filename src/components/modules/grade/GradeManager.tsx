// Enhanced Grade Management Component for Guru Digital Pelangi
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  Button,
  Tabs,
  Tab,
  useDisclosure
} from '@heroui/react';
import { BookOpen, Download } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

// Import modular components
import GradeFilters from './components/GradeFilters';
import GradeStats from './components/GradeStats';
import GradeTable from './components/GradeTable';
import GradeModals from './components/GradeModals';
import GradeRecap from './components/GradeRecap';

// Import types
import { GradeRecord, GradeStudent, GradeType, Class } from './types/gradeTypes';
import { gradeService, classService, studentService } from '../../../services/expressApi';
import { useAuthStore } from '../../../stores/authStore';
import { getSubjectName } from './utils/gradeUtils';

const GradeManager = () => {
  // Main component state
  const [activeTab, setActiveTab] = useState<string>('daily');
  const [selectedGrade, setSelectedGrade] = useState<GradeRecord | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Auth state
  const { user } = useAuthStore();

  // Data state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedGradeType, setSelectedGradeType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [students, setStudents] = useState<GradeStudent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [editScore, setEditScore] = useState<string>('');
  const [editMaxScore, setEditMaxScore] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const response = await classService.getClasses();
    if (response.success && response.data) {
      setClasses(response.data);
    }
  };

  const loadStudents = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    const response = await studentService.getStudents({ classId: selectedClass });
    if (response.success && response.data) {
      setStudents(response.data);
    }
    setIsLoading(false);
  }, [selectedClass]);

  const loadGrades = useCallback(async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    const params: Record<string, string> = {
      classId: selectedClass,
      date: selectedDate
    };

    if (selectedGradeType) params.gradeType = selectedGradeType;

    const response = await gradeService.getGrades(params);
    if (response.success && response.data) {
      setGrades(response.data);
    }
    setIsLoading(false);
  }, [selectedClass, selectedDate, selectedGradeType]);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadGrades();
    }
  }, [selectedClass, selectedGradeType, selectedDate, loadStudents, loadGrades]);

  // Reset pagination when class changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass]);

  const handleQuickGrade = async (studentId: string, score: number) => {
    if (!selectedClass || !selectedGradeType) {
      alert('Pilih kelas dan jenis tugas terlebih dahulu');
      return;
    }

    const selectedClassData = classes.find(c => c.id === selectedClass);
    if (!selectedClassData) {
      alert('Data kelas tidak ditemukan');
      return;
    }

    setIsSaving(true);
    try {
      const subjectName = getSubjectName(selectedClassData);
          
      const gradeData = {
        studentId,
        subjectId: selectedClassData.id,
        classId: selectedClass,
        gradeType: selectedGradeType as GradeType,
        score,
        maxScore: 100,
        description: `${selectedGradeType} - ${subjectName} - ${selectedDate}`,
        date: selectedDate,
        createdBy: user?.id || 'system'
      };

      const response = await gradeService.createGrade(gradeData);
      if (response.success) {
        loadGrades();
        alert('Nilai berhasil disimpan!');
      } else {
        alert('Error: ' + (response.error || 'Gagal menyimpan nilai'));
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Terjadi error saat menyimpan nilai');
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setEditScore('');
    setEditMaxScore('100');
    setEditDescription('');
  };

  // Modal handlers
  const handleEditGrade = (grade: GradeRecord) => {
    setSelectedGrade(grade);
    setEditScore(grade.score.toString());
    setEditMaxScore(grade.maxScore.toString());
    setEditDescription(grade.description || '');
    onOpen();
  };

  const handleOpenGradeModal = (student: GradeStudent) => {
    const selectedClassData = classes.find(c => c.id === selectedClass);
    setSelectedGrade({
      studentId: student.id,
      subjectId: selectedClassData?.id || 'unknown',
      classId: selectedClass,
      gradeType: selectedGradeType as GradeType,
      score: 0,
      maxScore: 100,
      date: selectedDate,
      student
    });
    resetForm();
    setEditMaxScore('100');
    onOpen();
  };

  const handleSave = async () => {
    if (!selectedGrade || !editScore || !editMaxScore) return;

    setIsSaving(true);
    try {
      if (selectedGrade.id) {
        // Update existing grade - API not implemented yet
        alert('Fitur edit akan segera tersedia');
      } else {
        // Create new grade
        await handleQuickGrade(selectedGrade.studentId, parseFloat(editScore));
      }
      onClose();
      resetForm();
      setSelectedGrade(null);
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Terjadi error saat menyimpan nilai');
    }
    setIsSaving(false);
  };

  const handleModalClose = () => {
    onClose();
    resetForm();
    setSelectedGrade(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Load recap data function for GradeRecap component
  const handleLoadRecapData = async (
    classId: string,
    gradeType?: string,
    dateRange?: { start: string; end: string }
  ): Promise<{ grades: GradeRecord[]; students: GradeStudent[] }> => {
    // This would be implemented based on your API structure
    // For now, return empty data as placeholder
    return { grades: [], students: [] };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Manajemen Nilai</h1>
                  <p className="text-gray-600">Kelola nilai siswa per mata pelajaran</p>
                </div>
              </div>
              <Button
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                variant="flat"
              >
                Export Laporan
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardBody>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab
                key="daily"
                title={
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Input Nilai Harian</span>
                  </div>
                }
              />
              <Tab
                key="recap"
                title={
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Rekap Nilai</span>
                  </div>
                }
              />
            </Tabs>
          </CardBody>
        </Card>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'daily' && (
        <>
          {/* Filters */}
          <GradeFilters
            classes={classes}
            selectedClass={selectedClass}
            selectedGradeType={selectedGradeType}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onClassChange={setSelectedClass}
            onGradeTypeChange={setSelectedGradeType}
            onDateChange={setSelectedDate}
            onRefresh={() => {
              loadClasses();
              if (selectedClass) {
                loadStudents();
                loadGrades();
              }
            }}
          />

          {/* Statistics */}
          {selectedClass && selectedGradeType && (
            <GradeStats
              grades={grades}
              students={students}
              selectedClass={selectedClass}
              selectedGradeType={selectedGradeType}
            />
          )}

          {/* Main Content */}
          {!selectedClass ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardBody>
                  <EmptyState
                    icon={BookOpen}
                    title="Pilih kelas untuk mulai input nilai"
                    description="Pilih kelas dan jenis tugas di atas untuk mulai menginput nilai siswa"
                    showAction={false}
                  />
                </CardBody>
              </Card>
            </motion.div>
          ) : selectedClass && selectedGradeType ? (
            <GradeTable
              students={students}
              grades={grades}
              selectedClass={selectedClass}
              selectedGradeType={selectedGradeType}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              isLoading={isLoading}
              isSaving={isSaving}
              onPageChange={handlePageChange}
              onQuickGrade={handleQuickGrade}
              onEditGrade={handleEditGrade}
              onOpenGradeModal={handleOpenGradeModal}
            />
          ) : null}
        </>
      )}

      {activeTab === 'recap' && (
        <GradeRecap
          classes={classes}
          onLoadRecapData={handleLoadRecapData}
        />
      )}

      {/* Modals */}
      <GradeModals
        isOpen={isOpen}
        onClose={handleModalClose}
        selectedGrade={selectedGrade}
        editScore={editScore}
        editMaxScore={editMaxScore}
        editDescription={editDescription}
        isSaving={isSaving}
        onScoreChange={setEditScore}
        onMaxScoreChange={setEditMaxScore}
        onDescriptionChange={setEditDescription}
        onSave={handleSave}
      />
    </div>
  );
};

export default GradeManager;
