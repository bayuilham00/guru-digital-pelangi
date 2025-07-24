// GradeFilters - Class, grade type, and date selection component
import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Button
} from '@heroui/react';
import { RotateCcw, Plus } from 'lucide-react';
import { GradeFiltersProps } from '../types/gradeTypes';
import { getGradeTypeLabel, getSubjectName } from '../utils/gradeUtils';

const gradeTypeOptions = [
  'TUGAS_HARIAN',
  'QUIZ',
  'ULANGAN_HARIAN',
  'PTS',
  'PAS',
  'PRAKTIK',
  'SIKAP',
  'KETERAMPILAN'
] as const;

const GradeFilters: React.FC<GradeFiltersProps> = ({
  classes,
  selectedClass,
  selectedGradeType,
  selectedDate,
  isLoading,
  onClassChange,
  onGradeTypeChange,
  onDateChange,
  onRefresh
}) => {
  return (
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
                const subjectName = getSubjectName(cls);
                return (
                  <SelectItem key={cls.id} textValue={`${cls.name} - ${subjectName}`}>
                    {cls.name} - {subjectName}
                  </SelectItem>
                );
              })}
            </Select>

            <Select
              label="Jenis Penilaian"
              placeholder="Semua jenis"
              selectedKeys={selectedGradeType ? [selectedGradeType] : []}
              onSelectionChange={(keys) => {
                const gradeType = Array.from(keys)[0] as string;
                onGradeTypeChange(gradeType);
              }}
            >
              {gradeTypeOptions.map((type) => (
                <SelectItem key={type} textValue={getGradeTypeLabel(type)}>
                  {getGradeTypeLabel(type)}
                </SelectItem>
              ))}
            </Select>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                color="primary"
                className="flex-1"
                onPress={onRefresh}
                isLoading={isLoading}
                startContent={<RotateCcw className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default GradeFilters;
