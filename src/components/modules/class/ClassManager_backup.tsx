// Backup file to check content
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Pagination
} from '@heroui/react';
import { Plus, Search, Edit, Trash2, Users, BookOpen, Calendar, GraduationCap, UserPlus, Settings } from 'lucide-react';
import EmptyState from '../../common/EmptyState';
import { classService } from '../../../services/classService';
import { teacherService } from '../../../services/teacherService';
import { subjectService } from '../../../services/subjectService';
import { Class, Subject, Teacher } from '../../../services/types';
import { useAuthStore } from '../../../stores/authStore';
import AttendanceManager from '../attendance/AttendanceManager';

const ClassManager: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  if (activeTab === 'attendance') {
    return <AttendanceManager />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div>Test content</div>
    </div>
  );
};

export default ClassManager;
