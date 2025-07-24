import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Pagination
} from '@heroui/react';
import { Plus, Search, Edit, Trash2, Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { classService } from '../../../services/classService';
import { teacherService } from '../../../services/teacherService';
import { subjectService } from '../../../services/subjectService';
import { Class, Subject, Teacher } from '../../../services/types';
import { useAuthStore } from '../../../stores/authStore';

interface ClassManagerCoreProps {
  onClassSelect?: (classId: string) => void;
}

const ClassManagerCore: React.FC<ClassManagerCoreProps> = ({ onClassSelect }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // Modal states for classes only
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', subjectId: '', teacherIds: [] as string[], description: '', gradeLevel: ''
  });

  const gradeOptions = [
    { key: '7', label: 'Kelas 7' }, { key: '8', label: 'Kelas 8' }, { key: '9', label: 'Kelas 9' },
    { key: '10', label: 'Kelas 10' }, { key: '11', label: 'Kelas 11' }, { key: '12', label: 'Kelas 12' }
  ];

  const getGradientColor = (index: number) => {
    const colors = ['from-cyan-400 to-blue-500', 'from-purple-400 to-pink-500', 'from-green-400 to-teal-500'];
    return colors[index % colors.length];
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(), // Read-only for dropdown
        user?.role === 'ADMIN' ? teacherService.getTeachers() : Promise.resolve({ success: true, data: [] }) // Read-only for dropdown
      ]);
      
      if (classRes.success) setClasses(classRes.data || []);
      if (subjectRes.success) setSubjects(subjectRes.data || []);
      if (teacherRes.success) setTeachers(teacherRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const filtered = classes.filter(cls => 
      cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
    setCurrentPage(1);
  }, [searchTerm, classes]);

  const handleCreate = () => {
    setSelectedClass(null);
    setIsEditing(false);
    setFormData({ name: '', subjectId: '', teacherIds: [], description: '', gradeLevel: '' });
    onOpen();
  };

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls);
    setIsEditing(true);
    setFormData({
      name: cls.name,
      subjectId: cls.subjectId || '',
      teacherIds: cls.classTeachers?.map(ct => ct.teacherId) || [],
      description: cls.description || '',
      gradeLevel: cls.gradeLevel || ''
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.gradeLevel || !formData.subjectId || formData.teacherIds.length === 0) {
        alert('Nama kelas, tingkat kelas, mata pelajaran, dan minimal satu guru wajib dipilih');
        return;
      }

      const classData = {
        name: formData.name,
        gradeLevel: formData.gradeLevel,
        description: formData.description,
        subjectId: formData.subjectId,
        teacherIds: formData.teacherIds
      };

      const response = isEditing && selectedClass
        ? await classService.updateClass(selectedClass.id, classData)
        : await classService.createClass(classData);

      if (response.success) {
        loadData();
        onClose();
        alert(`Kelas berhasil ${isEditing ? 'diupdate' : 'dibuat'}!`);
      } else {
        alert(`Error: ${response.error || `Gagal ${isEditing ? 'update' : 'buat'} kelas`}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi error saat menyimpan data');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        const response = await classService.deleteClass(id);
        if (response.success) {
          loadData();
          alert('Kelas berhasil dihapus!');
        } else {
          alert(`Error: ${response.error || 'Gagal menghapus kelas'}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Terjadi error saat menghapus data');
      }
    }
  };

  const getPaginatedClasses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClasses.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleClassClick = (cls: Class) => {
    if (onClassSelect) {
      onClassSelect(cls.id);
    } else {
      navigate(`/admin/class/${cls.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Data Kelas</h2>
            <p className="text-gray-300">Kelola kelas dan assignment guru</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
          startContent={<Plus className="w-4 h-4" />} onPress={handleCreate}>
          Tambah Kelas
        </Button>
      </div>

      {/* Search */}
      <Input 
        placeholder="Cari kelas..."
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        classNames={{
          input: "bg-white/10 text-white placeholder:text-gray-400",
          inputWrapper: "bg-white/10 border-white/20 hover:border-white/30 focus-within:border-blue-500"
        }}
      />

      {/* Class Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getPaginatedClasses().length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum ada kelas</h3>
            <p className="text-gray-300 mb-6">Mulai dengan membuat kelas pertama</p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
              startContent={<Plus className="w-4 h-4" />} onPress={handleCreate}>
              Buat Kelas Pertama
            </Button>
          </div>
        ) : (
          getPaginatedClasses().map((cls, index) => (
            <div key={cls.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 group cursor-pointer"
              onClick={() => handleClassClick(cls)}>
              <div className={`bg-gradient-to-r ${getGradientColor(index)} p-6`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 text-white">{cls.name}</h3>
                    <p className="text-white/90 text-sm font-medium">{cls.subject?.name || 'Mata Pelajaran'}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {cls.teachers && cls.teachers.length > 0 ? (
                    cls.teachers.slice(0, 2).map((teacher) => (
                      <Chip key={teacher.id} size="sm" className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {teacher.fullName}
                      </Chip>
                    ))
                  ) : (
                    <Chip size="sm" className="bg-gray-500/20 text-gray-300 border border-gray-500/30">
                      Belum ada guru
                    </Chip>
                  )}
                  {cls.teachers && cls.teachers.length > 2 && (
                    <Chip size="sm" className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      +{cls.teachers.length - 2} lagi
                    </Chip>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cls.studentCount || 0} siswa
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      Kelas {cls.gradeLevel}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button isIconOnly size="sm" variant="light" 
                      onPress={(e) => { e.stopPropagation(); handleEdit(cls); }}
                      className="text-blue-400 hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" 
                      onPress={(e) => { e.stopPropagation(); handleDelete(cls.id); }}
                      className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {filteredClasses.length > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination
            total={Math.ceil(filteredClasses.length / itemsPerPage)}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            className="text-white"
          />
        </div>
      )}

      {/* Class Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">{isEditing ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Nama Kelas"
              placeholder="Masukkan nama kelas"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              isRequired
            />
            <Select
              label="Tingkat Kelas"
              placeholder="Pilih tingkat kelas"
              selectedKeys={formData.gradeLevel ? [formData.gradeLevel] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setFormData(prev => ({ ...prev, gradeLevel: selected }));
              }}
              isRequired
            >
              {gradeOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Mata Pelajaran"
              placeholder="Pilih mata pelajaran"
              selectedKeys={formData.subjectId ? [formData.subjectId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setFormData(prev => ({ ...prev, subjectId: selected }));
              }}
              isRequired
            >
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </Select>
            <Select
              label="Guru Pengajar"
              placeholder="Pilih guru (bisa lebih dari satu)"
              selectedKeys={formData.teacherIds}
              onSelectionChange={(keys) => {
                setFormData(prev => ({ ...prev, teacherIds: Array.from(keys) as string[] }));
              }}
              selectionMode="multiple"
              isRequired
            >
              {teachers.map(teacher => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.fullName}</SelectItem>
              ))}
            </Select>
            <Input
              label="Deskripsi (Opsional)"
              placeholder="Masukkan deskripsi kelas"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Batal</Button>
            <Button color="primary" onPress={handleSave}>
              {isEditing ? 'Update' : 'Simpan'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ClassManagerCore;