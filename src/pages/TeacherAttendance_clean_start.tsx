import React, { useState, useEffect, useCallback } from 'react';
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
} from '@heroui/react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users,
  BookOpen,
  Save,
  RotateCcw,
  Eye,
  Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { attendanceService } from '../services/attendanceService';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { Class, Student, Attendance } from '../services/types';

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
    nim?: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  studentNim?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn?: string;
  notes?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  studentCount: number;
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

  // Fetch available classes for teacher
  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true);
      console.log('🔍 Fetching classes...');
      
      const response = await classService.getClasses();
      console.log('📥 Classes API response:', {
        success: response.success,
        data: response.data,
        dataLength: response.data?.length,
        error: response.error,
        fullResponse: response
      });
      
      if (response.success) {
        const classes = response.data || [];
        console.log('📊 Raw classes data:', classes);
        
        // Transform Class[] to ClassInfo[]
        const classInfos: ClassInfo[] = classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          studentCount: cls.studentCount || 0
        }));
        
        setClasses(classInfos);
        console.log('✅ Classes transformed and set:', classInfos);
      } else {
        console.error('❌ Failed to fetch classes:', response.error);
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, []);
