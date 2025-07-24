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
import AttendanceManager from '../attendance/AttendanceManager';

const ClassManager: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // Modal states for classes
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', subjectId: '', teacherIds: [] as string[], description: '', gradeLevel: ''
  });

  // Modal states for subjects
  const { isOpen: isSubjectModalOpen, onOpen: onSubjectModalOpen, onClose: onSubjectModalClose } = useDisclosure();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '', description: '', code: ''
  });

  // Modal states for teachers
  const { isOpen: isTeacherModalOpen, onOpen: onTeacherModalOpen, onClose: onTeacherModalClose } = useDisclosure();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    fullName: '', email: '', phone: '', specialization: ''
  });

  const gradeOptions = [
    { key: '7', label: 'Kelas 7' }, { key: '8', label: 'Kelas 8' }, { key: '9', label: 'Kelas 9' },
    { key: '10', label: 'Kelas 10' }, { key: '11', label: 'Kelas 11' }, { key: '12', label: 'Kelas 12' }
  ];

  const gradientColors = [
    'from-cyan-400 to-blue-500', 'from-purple-400 to-pink-500', 'from-green-400 to-teal-500',
    'from-orange-400 to-red-500', 'from-indigo-400 to-purple-500', 'from-pink-400 to-rose-500'
  ];

  const getGradientColor = (index: number) => gradientColors[index % gradientColors.length];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        user?.role === 'ADMIN' ? teacherService.getTeachers() : Promise.resolve({ success: true, data: [] })
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

  useEffect(() => {
    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
    setCurrentPage(1);
  }, [searchTerm, subjects]);

  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
    setCurrentPage(1);  
  }, [searchTerm, teachers]);

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

  const getPaginatedSubjects = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubjects.slice(startIndex, startIndex + itemsPerPage);
  };

  const getPaginatedTeachers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  };

  // Subject management functions
  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setIsEditingSubject(false);
    setSubjectFormData({ name: '', description: '', code: '' });
    onSubjectModalOpen();
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditingSubject(true);
    setSubjectFormData({
      name: subject.name,
      description: subject.description || '',
      code: subject.code || ''
    });
    onSubjectModalOpen();
  };

  const handleSaveSubject = async () => {
    try {
      if (!subjectFormData.name) {
        alert('Nama mata pelajaran wajib diisi');
        return;
      }

      const response = isEditingSubject && selectedSubject
        ? await subjectService.updateSubject(selectedSubject.id, subjectFormData)
        : await subjectService.createSubject(subjectFormData);

      if (response.success) {
        loadData();
        onSubjectModalClose();
        alert(`Mata pelajaran berhasil ${isEditingSubject ? 'diupdate' : 'dibuat'}!`);
      } else {
        alert(`Error: ${response.error || `Gagal ${isEditingSubject ? 'update' : 'buat'} mata pelajaran`}`);
      }
    } catch (error) {
      console.error('Save subject error:', error);
      alert('Terjadi error saat menyimpan data mata pelajaran');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      try {
        const response = await subjectService.deleteSubject(id);
        if (response.success) {
          loadData();
          alert('Mata pelajaran berhasil dihapus!');
        } else {
          alert(`Error: ${response.error || 'Gagal menghapus mata pelajaran'}`);
        }
      } catch (error) {
        console.error('Delete subject error:', error);
        alert('Terjadi error saat menghapus mata pelajaran');
      }
    }
  };

  // Teacher management functions
  const handleCreateTeacher = () => {
    setSelectedTeacher(null);
    setIsEditingTeacher(false);
    setTeacherFormData({ fullName: '', email: '', phone: '', specialization: '' });
    onTeacherModalOpen();
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditingTeacher(true);
    setTeacherFormData({
      fullName: teacher.fullName,
      email: teacher.email || '',
      phone: teacher.phone || '',
      specialization: teacher.specialization || ''
    });
    onTeacherModalOpen();
  };

  const handleSaveTeacher = async () => {
    try {
      if (!teacherFormData.fullName || !teacherFormData.email) {
        alert('Nama lengkap dan email wajib diisi');
        return;
      }

      const response = isEditingTeacher && selectedTeacher
        ? await teacherService.updateTeacher(selectedTeacher.id, teacherFormData)
        : await teacherService.createTeacher(teacherFormData);

      if (response.success) {
        loadData();
        onTeacherModalClose();
        alert(`Data guru berhasil ${isEditingTeacher ? 'diupdate' : 'dibuat'}!`);
      } else {
        alert(`Error: ${response.error || `Gagal ${isEditingTeacher ? 'update' : 'buat'} data guru`}`);
      }
    } catch (error) {
      console.error('Save teacher error:', error);
      alert('Terjadi error saat menyimpan data guru');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      try {
        const response = await teacherService.deleteTeacher(id);
        if (response.success) {
          loadData();
          alert('Data guru berhasil dihapus!');
        } else {
          alert(`Error: ${response.error || 'Gagal menghapus data guru'}`);
        }
      } catch (error) {
        console.error('Delete teacher error:', error);
        alert('Terjadi error saat menghapus data guru');
      }
    }
  };

  if (activeTab === 'attendance') return <AttendanceManager />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header dengan dynamic content berdasarkan tab aktif */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {activeTab === 'classes' && <BookOpen className="w-8 h-8 text-blue-400" />}
            {activeTab === 'subjects' && <GraduationCap className="w-8 h-8 text-purple-400" />}
            {activeTab === 'teachers' && <Users className="w-8 h-8 text-orange-400" />}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {activeTab === 'classes' && 'Manajemen Kelas'}
                {activeTab === 'subjects' && 'Mata Pelajaran'}
                {activeTab === 'teachers' && 'Data Guru'}
              </h1>
              <p className="text-gray-300">
                {activeTab === 'classes' && 'Kelola data kelas dan presensi siswa'}
                {activeTab === 'subjects' && 'Kelola mata pelajaran yang diajarkan'}
                {activeTab === 'teachers' && 'Kelola data guru pengajar'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="bordered" startContent={<Calendar className="w-4 h-4" />}
              onPress={() => setActiveTab('attendance')} className="border-white/20 text-white hover:bg-white/10">
              Presensi
            </Button>
            {activeTab === 'classes' && (
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
                startContent={<Plus className="w-4 h-4" />} onPress={handleCreate}>
                Tambah Kelas
              </Button>
            )}
            {activeTab === 'subjects' && (
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium"
                startContent={<Plus className="w-4 h-4" />} onPress={handleCreateSubject}>
                Tambah Mata Pelajaran
              </Button>
            )}
            {activeTab === 'teachers' && (
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
                startContent={<Plus className="w-4 h-4" />} onPress={handleCreateTeacher}>
                Tambah Guru
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button variant={activeTab === 'classes' ? 'solid' : 'bordered'}
            className={activeTab === 'classes' ? 'bg-blue-600 text-white' : 'border-white/20 text-white hover:bg-white/10'}
            startContent={<GraduationCap className="w-4 h-4" />} 
            onPress={() => {
              setActiveTab('classes');
              setSearchTerm('');
              setCurrentPage(1);
            }}>
            Data Kelas
          </Button>
          <Button variant={activeTab === 'subjects' ? 'solid' : 'bordered'}
            className={activeTab === 'subjects' ? 'bg-blue-600 text-white' : 'border-white/20 text-white hover:bg-white/10'}
            startContent={<BookOpen className="w-4 h-4" />} 
            onPress={() => {
              setActiveTab('subjects');
              setSearchTerm('');
              setCurrentPage(1);
            }}>
            Mata Pelajaran
          </Button>
          <Button variant={activeTab === 'teachers' ? 'solid' : 'bordered'}
            className={activeTab === 'teachers' ? 'bg-blue-600 text-white' : 'border-white/20 text-white hover:bg-white/10'}
            startContent={<Users className="w-4 h-4" />} 
            onPress={() => {
              setActiveTab('teachers');
              setSearchTerm('');
              setCurrentPage(1);
            }}>
            Data Guru
          </Button>
          <Button variant={activeTab === 'attendance' ? 'solid' : 'bordered'}
            className={activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'border-white/20 text-white hover:bg-white/10'}
            startContent={<Calendar className="w-4 h-4" />} onPress={() => setActiveTab('attendance')}>
            Presensi
          </Button>
        </div>

        {/* Search */}
        <Input 
          placeholder={
            activeTab === 'classes' ? 'Cari kelas...' :
            activeTab === 'subjects' ? 'Cari mata pelajaran...' :
            'Cari guru...'
          }
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          classNames={{
            input: "bg-white/10 text-white placeholder:text-gray-400",
            inputWrapper: "bg-white/10 border-white/20 hover:border-white/30 focus-within:border-blue-500"
          }}
        />

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{classes.length}</p>
                <p className="text-sm text-blue-400 font-medium">Total Kelas</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{subjects.length}</p>
                <p className="text-sm text-purple-400 font-medium">Mata Pelajaran</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{teachers.length}</p>
                <p className="text-sm text-orange-400 font-medium">Total Guru</p>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {classes.reduce((total, cls) => total + (cls.studentCount || 0), 0)}
                </p>
                <p className="text-sm text-cyan-400 font-medium">Total Siswa</p>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Content berdasarkan tab aktif */}
        {activeTab === 'classes' && (
          <>
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
                    onClick={() => navigate(`/admin/class/${cls.id}`)}>
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
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-lg font-bold text-white">{cls.studentCount || 0}</div>
                          <div className="text-xs text-gray-300">Siswa</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-lg font-bold text-white">{cls.teachers?.length || 0}</div>
                          <div className="text-xs text-gray-300">Guru</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="bordered" size="sm" startContent={<Edit className="w-3 h-3" />}
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onPress={(e) => { e.stopPropagation(); handleEdit(cls); }}>
                          Edit
                        </Button>
                        <Button variant="bordered" size="sm" startContent={<Trash2 className="w-3 h-3" />}
                          className="border-red-400/30 text-red-300 hover:bg-red-500/10"
                          onPress={(e) => { e.stopPropagation(); handleDelete(cls.id); }}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>

            {/* Pagination untuk Classes */}
            {filteredClasses.length > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination total={Math.ceil(filteredClasses.length / itemsPerPage)} page={currentPage} onChange={setCurrentPage} showControls />
              </div>
            )}
          </>
        )}

        {/* Subject Grid */}
        {activeTab === 'subjects' && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPaginatedSubjects().length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? 'Mata pelajaran tidak ditemukan' : 'Belum ada mata pelajaran'}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {searchTerm ? 'Coba kata kunci lain atau buat mata pelajaran baru' : 'Mulai dengan membuat mata pelajaran pertama'}
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium"
                    startContent={<Plus className="w-4 h-4" />} onPress={handleCreateSubject}>
                    {searchTerm ? 'Buat Mata Pelajaran' : 'Buat Mata Pelajaran Pertama'}
                  </Button>
                </div>
              ) : (
                getPaginatedSubjects().map((subject, index) => (
                  <div key={subject.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                    <div className={`bg-gradient-to-r ${getGradientColor(index)} p-6`}>
                      <h3 className="text-2xl font-bold mb-1 text-white">{subject.name}</h3>
                      {subject.code && <p className="text-white/90 text-sm font-medium">Kode: {subject.code}</p>}
                    </div>
                    <div className="p-6">
                      {subject.description && (
                        <p className="text-gray-300 text-sm mb-4">{subject.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="bordered" size="sm" startContent={<Edit className="w-3 h-3" />}
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onPress={() => handleEditSubject(subject)}>
                          Edit
                        </Button>
                        <Button variant="bordered" size="sm" startContent={<Trash2 className="w-3 h-3" />}
                          className="border-red-400/30 text-red-300 hover:bg-red-500/10"
                          onPress={() => handleDeleteSubject(subject.id)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>

            {/* Pagination untuk Subjects */}
            {filteredSubjects.length > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination total={Math.ceil(filteredSubjects.length / itemsPerPage)} page={currentPage} onChange={setCurrentPage} showControls />
              </div>
            )}
          </>
        )}

        {/* Teacher Grid */}
        {activeTab === 'teachers' && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPaginatedTeachers().length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? 'Guru tidak ditemukan' : 'Belum ada data guru'}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {searchTerm ? 'Coba kata kunci lain atau tambah guru baru' : 'Mulai dengan menambahkan guru pertama'}
                  </p>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
                    startContent={<Plus className="w-4 h-4" />} onPress={handleCreateTeacher}>
                    {searchTerm ? 'Tambah Guru' : 'Tambah Guru Pertama'}
                  </Button>
                </div>
              ) : (
                getPaginatedTeachers().map((teacher, index) => (
                  <div key={teacher.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                    <div className={`bg-gradient-to-r ${getGradientColor(index)} p-6`}>
                      <h3 className="text-2xl font-bold mb-1 text-white">{teacher.fullName}</h3>
                      {teacher.email && <p className="text-white/90 text-sm font-medium">{teacher.email}</p>}
                    </div>
                    <div className="p-6">
                      {teacher.phone && (
                        <p className="text-gray-300 text-sm mb-2">Telepon: {teacher.phone}</p>
                      )}
                      {teacher.specialization && (
                        <p className="text-gray-300 text-sm mb-4">Spesialisasi: {teacher.specialization}</p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="bordered" size="sm" startContent={<Edit className="w-3 h-3" />}
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                          onPress={() => handleEditTeacher(teacher)}>
                          Edit
                        </Button>
                        <Button variant="bordered" size="sm" startContent={<Trash2 className="w-3 h-3" />}
                          className="border-red-400/30 text-red-300 hover:bg-red-500/10"
                          onPress={() => handleDeleteTeacher(teacher.id)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>

            {/* Pagination untuk Teachers */}
            {filteredTeachers.length > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination total={Math.ceil(filteredTeachers.length / itemsPerPage)} page={currentPage} onChange={setCurrentPage} showControls />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700">
          {(onClose) => (
            <>
              <ModalHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b border-gray-700">
                <h3 className="text-white font-semibold">{isEditing ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
              </ModalHeader>
              <ModalBody className="bg-gray-900 text-white p-6">
                <div className="space-y-4">
                  <Input label="Nama Kelas" placeholder="Contoh: Kelas 7A" value={formData.name} isRequired
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-blue-500 focus-within:border-blue-500"
                    }}
                  />
                  <Select label="Tingkat Kelas" placeholder="Pilih tingkat kelas" isRequired
                    selectedKeys={formData.gradeLevel ? [formData.gradeLevel] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setFormData(prev => ({...prev, gradeLevel: key}));
                    }}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      trigger: "bg-gray-800/50 border border-gray-600 hover:border-blue-500 text-white",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border border-gray-600"
                    }}>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.key} className="text-white hover:bg-gray-700">{grade.label}</SelectItem>
                    ))}
                  </Select>
                  <Select label="Mata Pelajaran" placeholder="Pilih mata pelajaran" isRequired
                    selectedKeys={formData.subjectId ? [formData.subjectId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setFormData(prev => ({...prev, subjectId: key}));
                    }}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      trigger: "bg-gray-800/50 border border-gray-600 hover:border-blue-500 text-white",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border border-gray-600"
                    }}>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} className="text-white hover:bg-gray-700">{subject.name}</SelectItem>
                    ))}
                  </Select>
                  <Select label="Guru Pengajar" placeholder="Pilih guru (bisa lebih dari satu)" isRequired
                    selectionMode="multiple"
                    selectedKeys={formData.teacherIds}
                    onSelectionChange={(keys) => {
                      setFormData(prev => ({...prev, teacherIds: Array.from(keys) as string[]}));
                    }}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      trigger: "bg-gray-800/50 border border-gray-600 hover:border-blue-500 text-white",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border border-gray-600"
                    }}>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} className="text-white hover:bg-gray-700">{teacher.fullName}</SelectItem>
                    ))}
                  </Select>
                  <Input label="Deskripsi" placeholder="Deskripsi kelas (opsional)" value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-blue-500 focus-within:border-blue-500"
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="bg-gray-900 text-white border-t border-gray-700">
                <Button variant="light" onPress={onClose} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Batal
                </Button>
                <Button color="primary" onPress={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                  {isEditing ? 'Update' : 'Buat Kelas'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={onSubjectModalClose} size="xl">
        <ModalContent className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700">
          {(onClose) => (
            <>
              <ModalHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b border-gray-700">
                <h3 className="text-white font-semibold">{isEditingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
              </ModalHeader>
              <ModalBody className="bg-gray-900 text-white p-6">
                <div className="space-y-4">
                  <Input label="Nama Mata Pelajaran" placeholder="Contoh: Matematika" value={subjectFormData.name} isRequired
                    onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-purple-500 focus-within:border-purple-500"
                    }}
                  />
                  <Input label="Kode Mata Pelajaran" placeholder="Contoh: MTK" value={subjectFormData.code}
                    onChange={(e) => setSubjectFormData({...subjectFormData, code: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-purple-500 focus-within:border-purple-500"
                    }}
                  />
                  <Input label="Deskripsi" placeholder="Deskripsi mata pelajaran (opsional)" value={subjectFormData.description}
                    onChange={(e) => setSubjectFormData({...subjectFormData, description: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-purple-500 focus-within:border-purple-500"
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="bg-gray-900 text-white border-t border-gray-700">
                <Button variant="light" onPress={onClose} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Batal
                </Button>
                <Button color="primary" onPress={handleSaveSubject} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                  {isEditingSubject ? 'Update' : 'Buat Mata Pelajaran'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Teacher Modal */}
      <Modal isOpen={isTeacherModalOpen} onClose={onTeacherModalClose} size="xl">
        <ModalContent className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700">
          {(onClose) => (
            <>
              <ModalHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-b border-gray-700">
                <h3 className="text-white font-semibold">{isEditingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
              </ModalHeader>
              <ModalBody className="bg-gray-900 text-white p-6">
                <div className="space-y-4">
                  <Input label="Nama Lengkap" placeholder="Contoh: Dr. Ahmad Sulaiman" value={teacherFormData.fullName} isRequired
                    onChange={(e) => setTeacherFormData({...teacherFormData, fullName: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-orange-500 focus-within:border-orange-500"
                    }}
                  />
                  <Input label="Email" type="email" placeholder="guru@sekolah.com" value={teacherFormData.email} isRequired
                    onChange={(e) => setTeacherFormData({...teacherFormData, email: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-orange-500 focus-within:border-orange-500"
                    }}
                  />
                  <Input label="Nomor Telepon" placeholder="08123456789" value={teacherFormData.phone}
                    onChange={(e) => setTeacherFormData({...teacherFormData, phone: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-orange-500 focus-within:border-orange-500"
                    }}
                  />
                  <Input label="Spesialisasi" placeholder="Contoh: Matematika & Fisika" value={teacherFormData.specialization}
                    onChange={(e) => setTeacherFormData({...teacherFormData, specialization: e.target.value})}
                    classNames={{
                      label: "text-gray-300 font-medium",
                      input: "text-white placeholder:text-gray-400 bg-gray-800/50",
                      inputWrapper: "bg-gray-800/50 border border-gray-600 hover:border-orange-500 focus-within:border-orange-500"
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="bg-gray-900 text-white border-t border-gray-700">
                <Button variant="light" onPress={onClose} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Batal
                </Button>
                <Button color="primary" onPress={handleSaveTeacher} className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold">
                  {isEditingTeacher ? 'Update' : 'Tambah Guru'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ClassManager;
