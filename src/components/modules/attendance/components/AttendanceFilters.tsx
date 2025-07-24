// AttendanceFilters - Class and date selection component
import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
  Button
} from '@heroui/react';
import { Download, UserCheck } from 'lucide-react';
import { AttendanceFiltersProps } from '../types/attendanceTypes';

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  classes,
  selectedClass,
  selectedDate,
  isLoading,
  isSaving,
  onClassChange,
  onDateChange,
  onRefresh,
  onBulkMarkPresent
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Input
              type="date"
              label="Tanggal"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />

            <div className="flex items-end gap-2">
              <Button
                color="primary"
                className="flex-1"
                onPress={onRefresh}
                isLoading={isLoading}
              >
                Muat Data
              </Button>
              <Button
                color="success"
                variant="flat"
                onPress={onBulkMarkPresent}
                isLoading={isSaving}
                startContent={<UserCheck className="w-4 h-4" />}
              >
                Tandai Semua Hadir
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AttendanceFilters;
