import React, { useState, useEffect, useCallback } from 'react';
import { 
  Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Chip
} from '@heroui/react';
import { Plus, Users, BookOpen, UserPlus } from 'lucide-react';
import { classService } from '../../../services/classService';
import { teacherService } from '../../../services/teacherService';
import { subjectService } from '../../../services/subjectService';
import { Class, Subject, Teacher } from '../../../services/types';

interface ClassAssignmentManagerProps {
  selectedClassId?: string;
  onAssignmentUpdate?: () => void;
}

const ClassAssignmentManager: React.FC<ClassAssignmentManagerProps> = ({ 
  selectedClassId, 
  onAssignmentUpdate 
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Assignment modal
  const { isOpen: isAssignModalOpen, onOpen: onAssignModalOpen, onClose: onAssignModalClose } = useDisclosure();
  const [assignmentType, setAssignmentType] = useState<'subject' | 'teacher'>('subject');
  const [assignmentData, setAssignmentData] = useState({
    subjectId: '',
    teacherIds: [] as string[]
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        teacherService.getTeachers()
      ]);
      
      if (classRes.success) setClasses(classRes.data || []);
      if (subjectRes.success) setSubjects(subjectRes.data || []);
      if (teacherRes.success) setTeachers(teacherRes.data || []);
    } catch (error) {
      console.error('Error loading assignment data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedClassId && classes.length > 0) {
      const cls = classes.find(c => c.id === selectedClassId);
      setSelectedClass(cls || null);
    }
  }, [selectedClassId, classes]);

  const handleOpenAssignmentModal = (type: 'subject' | 'teacher') => {
    setAssignmentType(type);
    if (selectedClass) {
      setAssignmentData({
        subjectId: selectedClass.subjectId || '',
        teacherIds: selectedClass.classTeachers?.map(ct => ct.teacherId) || []
      });
    }
    onAssignModalOpen();
  };

  const handleSaveAssignment = async () => {
    if (!selectedClass) return;

    try {
      const updateData: any = {};
      
      if (assignmentType === 'subject' && assignmentData.subjectId) {
        updateData.subjectId = assignmentData.subjectId;
      }
      
      if (assignmentType === 'teacher' && assignmentData.teacherIds.length > 0) {
        updateData.teacherIds = assignmentData.teacherIds;
      }

      const response = await classService.updateClass(selectedClass.id, updateData);
      
      if (response.success) {
        await loadData();
        onAssignModalClose();
        if (onAssignmentUpdate) onAssignmentUpdate();
        alert(`${assignmentType === 'subject' ? 'Mata pelajaran' : 'Guru'} berhasil di-assign!`);
      } else {
        alert(`Error: ${response.error || 'Gagal menyimpan assignment'}`);
      }
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Terjadi error saat menyimpan assignment');
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!selectedClass) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus guru dari kelas ini?')) {
      try {
        const currentTeacherIds = selectedClass.classTeachers?.map(ct => ct.teacherId) || [];
        const updatedTeacherIds = currentTeacherIds.filter(id => id !== teacherId);
        
        const response = await classService.updateClass(selectedClass.id, {
          teacherIds: updatedTeacherIds
        });
        
        if (response.success) {
          await loadData();
          if (onAssignmentUpdate) onAssignmentUpdate();
          alert('Guru berhasil dihapus dari kelas!');
        } else {
          alert(`Error: ${response.error || 'Gagal menghapus guru'}`);
        }
      } catch (error) {
        console.error('Remove teacher error:', error);
        alert('Terjadi error saat menghapus guru');
      }
    }
  };

  if (!selectedClass) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Pilih Kelas</h3>
        <p className="text-gray-300">Pilih kelas untuk mengelola assignment guru dan mata pelajaran</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Info Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedClass.name}</h2>
            <p className="text-gray-300">Kelola assignment mata pelajaran dan guru</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<BookOpen className="w-4 h-4" />}
              onPress={() => handleOpenAssignmentModal('subject')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Assign Mata Pelajaran
            </Button>
            <Button
              variant="bordered"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={() => handleOpenAssignmentModal('teacher')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Assign Guru
            </Button>
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subject Assignment */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Mata Pelajaran
            </h3>
            <Button
              size="sm"
              variant="light"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => handleOpenAssignmentModal('subject')}
              className="text-purple-400 hover:text-purple-300"
            >
              Edit
            </Button>
          </div>
          
          {selectedClass.subject ? (
            <div className="space-y-2">
              <Chip size="lg" className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {selectedClass.subject.name}
              </Chip>
              {selectedClass.subject.description && (
                <p className="text-gray-400 text-sm">{selectedClass.subject.description}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">Belum ada mata pelajaran</p>
              <Button
                size="sm"
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => handleOpenAssignmentModal('subject')}
                className="mt-2"
              >
                Assign Mata Pelajaran
              </Button>
            </div>
          )}
        </div>

        {/* Teachers Assignment */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Guru Pengajar ({selectedClass.teachers?.length || 0})
            </h3>
            <Button
              size="sm"
              variant="light"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={() => handleOpenAssignmentModal('teacher')}
              className="text-blue-400 hover:text-blue-300"
            >
              Tambah
            </Button>
          </div>
          
          {selectedClass.teachers && selectedClass.teachers.length > 0 ? (
            <div className="space-y-2">
              {selectedClass.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{teacher.fullName}</p>
                    <p className="text-gray-400 text-sm">{teacher.email}</p>
                  </div>
                  <Button size="sm" variant="light" color="danger"
                    onPress={() => handleRemoveTeacher(teacher.id)}
                    className="text-red-400 hover:text-red-300">
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">Belum ada guru</p>
              <Button
                size="sm"
                color="primary"
                startContent={<UserPlus className="w-4 h-4" />}
                onPress={() => handleOpenAssignmentModal('teacher')}
                className="mt-2"
              >
                Assign Guru
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">
              {assignmentType === 'subject' ? 'Assign Mata Pelajaran' : 'Assign Guru'}
            </h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {assignmentType === 'subject' ? (
              <Select
                label="Pilih Mata Pelajaran"
                placeholder="Pilih mata pelajaran untuk kelas ini"
                selectedKeys={assignmentData.subjectId ? [assignmentData.subjectId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setAssignmentData(prev => ({ ...prev, subjectId: selected }));
                }}
                isRequired
              >
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Select
                label="Pilih Guru"
                placeholder="Pilih guru untuk kelas ini (bisa lebih dari satu)"
                selectedKeys={assignmentData.teacherIds}
                onSelectionChange={(keys) => {
                  setAssignmentData(prev => ({ ...prev, teacherIds: Array.from(keys) as string[] }));
                }}
                selectionMode="multiple"
                isRequired
              >
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.fullName} - {teacher.email}
                  </SelectItem>
                ))}
              </Select>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAssignModalClose}>Batal</Button>
            <Button color="primary" onPress={handleSaveAssignment}>
              Simpan Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ClassAssignmentManager;