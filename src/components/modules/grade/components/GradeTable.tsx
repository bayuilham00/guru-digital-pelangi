import React from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
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
import { motion } from 'framer-motion';
import { Plus, Edit, Users } from 'lucide-react';
import { GradeRecord, GradeStudent, GradeType } from '../types/gradeTypes';
import { getScoreColor, getGradeTypeLabel, calculatePercentage, getPaginatedItems, getTotalPages } from '../utils/gradeUtils';

interface GradeTableProps {
  students: GradeStudent[];
  grades: GradeRecord[];
  selectedClass: string;
  selectedGradeType: string;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  isSaving: boolean;
  onPageChange: (page: number) => void;
  onQuickGrade: (studentId: string, score: number) => void;
  onEditGrade: (grade: GradeRecord) => void;
  onOpenGradeModal: (student: GradeStudent) => void;
}

const GradeTable: React.FC<GradeTableProps> = ({
  students,
  grades,
  selectedClass,
  selectedGradeType,
  currentPage,
  itemsPerPage,
  isLoading,
  isSaving,
  onPageChange,
  onQuickGrade,
  onEditGrade,
  onOpenGradeModal
}) => {
  if (!selectedClass || !selectedGradeType) {
    return null;
  }

  const paginatedStudents = getPaginatedItems(students, currentPage, itemsPerPage);
  const totalPages = getTotalPages(students.length, itemsPerPage);

  const getExistingGrade = (studentId: string): GradeRecord | undefined => {
    return grades.find(g => g.studentId === studentId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">
              Input Nilai - {getGradeTypeLabel(selectedGradeType as GradeType)}
            </h3>
            <div className="flex gap-2">
              <Button
                color="success"
                variant="flat"
                startContent={<Users className="w-4 h-4" />}
                size="sm"
              >
                {students.length} Siswa
              </Button>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                size="sm"
              >
                Bulk Input
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Grade input table">
            <TableHeader>
              <TableColumn>NAMA SISWA</TableColumn>
              <TableColumn>NISN</TableColumn>
              <TableColumn>NILAI SAAT INI</TableColumn>
              <TableColumn>INPUT CEPAT</TableColumn>
              <TableColumn>AKSI</TableColumn>
            </TableHeader>
            <TableBody 
              emptyContent="Tidak ada siswa dalam kelas ini"
              isLoading={isLoading}
              loadingContent="Memuat data siswa..."
            >
              {paginatedStudents.map((student) => {
                const existingGrade = getExistingGrade(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.fullName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">{student.studentId}</div>
                    </TableCell>
                    <TableCell>
                      {existingGrade ? (
                        <Chip
                          color={getScoreColor(existingGrade.score, existingGrade.maxScore)}
                          variant="flat"
                        >
                          {existingGrade.score}/{existingGrade.maxScore} ({calculatePercentage(existingGrade.score, existingGrade.maxScore)}%)
                        </Chip>
                      ) : (
                        <span className="text-gray-400">Belum dinilai</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!existingGrade && (
                        <ButtonGroup size="sm" variant="flat">
                          <Button
                            color="success"
                            onPress={() => onQuickGrade(student.id, 100)}
                            isLoading={isSaving}
                          >
                            100
                          </Button>
                          <Button
                            color="primary"
                            onPress={() => onQuickGrade(student.id, 90)}
                            isLoading={isSaving}
                          >
                            90
                          </Button>
                          <Button
                            color="warning"
                            onPress={() => onQuickGrade(student.id, 80)}
                            isLoading={isSaving}
                          >
                            80
                          </Button>
                          <Button
                            color="danger"
                            onPress={() => onQuickGrade(student.id, 70)}
                            isLoading={isSaving}
                          >
                            70
                          </Button>
                        </ButtonGroup>
                      )}
                    </TableCell>
                    <TableCell>
                      {existingGrade ? (
                        <Button
                          size="sm"
                          variant="light"
                          startContent={<Edit className="w-4 h-4" />}
                          onPress={() => onEditGrade(existingGrade)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          startContent={<Plus className="w-4 h-4" />}
                          onPress={() => onOpenGradeModal(student)}
                        >
                          Input
                        </Button>
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

export default GradeTable;
