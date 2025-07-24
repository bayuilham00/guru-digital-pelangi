// Assignment Create/Edit Modal Component - Guru Digital Pelangi
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  DatePicker,
  Card,
  CardBody
} from '@heroui/react';
import { FileText, Calendar, Award, Users } from 'lucide-react';
import { assignmentService, classService } from '../../../services/expressApi';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment?: any; // For edit mode
  initialClassId?: string; // For pre-selecting class
}

interface Class {
  id: string;
  name: string;
  subject?: {
    name: string;
  };
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  assignment,
  initialClassId 
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    points: 0,
    deadline: '',
    type: 'TUGAS_HARIAN',
    classId: ''
  });

  const assignmentTypes = [
    { key: 'TUGAS_HARIAN', label: 'Tugas Harian' },
    { key: 'QUIZ', label: 'Quiz' },
    { key: 'ULANGAN_HARIAN', label: 'Ulangan Harian' },
    { key: 'PTS', label: 'PTS' },
    { key: 'PAS', label: 'PAS' },
    { key: 'PRAKTIK', label: 'Praktik' },
    { key: 'PROYEK', label: 'Proyek' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadClasses();
      if (assignment) {
        // Edit mode - populate form with existing data
        setFormData({
          title: assignment.title || '',
          description: assignment.description || '',
          instructions: assignment.instructions || '',
          points: assignment.points || 0,
          deadline: assignment.deadline ? assignment.deadline.split('T')[0] : '',
          type: assignment.type || 'TUGAS_HARIAN',
          classId: assignment.classId || ''
        });
      } else {
        // Create mode - reset form
        setFormData({
          title: '',
          description: '',
          instructions: '',
          points: 0,
          deadline: '',
          type: 'TUGAS_HARIAN',
          classId: initialClassId || ''
        });
      }
    }
  }, [isOpen, assignment, initialClassId]);

  const loadClasses = async () => {
    const response = await classService.getClasses();
    if (response.success && response.data) {
      setClasses(response.data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline || !formData.classId) {
      alert('Judul, deadline, dan kelas wajib diisi!');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
        points: parseInt(formData.points.toString())
      };

      let response;
      if (assignment) {
        // Edit mode
        response = await assignmentService.updateAssignment(assignment.id, submitData);
      } else {
        // Create mode
        response = await assignmentService.createAssignment(submitData);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        alert(response.error || 'Gagal menyimpan tugas');
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Terjadi kesalahan saat menyimpan tugas');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      instructions: '',
      points: 100,
      deadline: '',
      type: 'TUGAS_HARIAN',
      classId: ''
    });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="3xl" 
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        backdrop: "bg-black/50 backdrop-blur-sm",
        body: "py-6 bg-gray-900 text-white",
        footer: "py-4 bg-gray-900 border-t border-gray-700",
        closeButton: "text-white hover:bg-white/10"
      }}
    >
      <ModalContent className="bg-gray-900 text-white">
        {(onClose) => (
          <>
            <ModalHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xl rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>{assignment ? 'Edit Tugas' : 'Buat Tugas Baru'}</span>
              </div>
            </ModalHeader>
            <ModalBody className="space-y-6 bg-gray-900">
              {/* Informasi Dasar */}
              <div className="space-y-4">
                <h4 className="font-bold text-white text-lg flex items-center gap-2 border-b border-gray-700 pb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Informasi Dasar
                </h4>
                
                <Input
                  label="Judul Tugas"
                  placeholder="Masukkan judul tugas"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  isRequired
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Textarea
                  label="Deskripsi"
                  placeholder="Masukkan deskripsi singkat tugas"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  minRows={2}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Textarea
                  label="Instruksi Lengkap"
                  placeholder="Masukkan instruksi detail untuk mengerjakan tugas"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  minRows={3}b
                  classNames={{
                    input: "bg-blue-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-blue-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-800 font-medium"
                  }}
                />
              </div>

              {/* Pengaturan Tugas */}
              <div className="space-y-4">
                <h4 className="font-bold text-white text-lg flex items-center gap-2 border-b border-gray-700 pb-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Pengaturan Tugas
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Jenis Tugas"
                    placeholder="Pilih jenis tugas"
                    selectedKeys={formData.type ? [formData.type] : []}
                    onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                    isRequired
                    classNames={{
                      trigger: "bg-gray-800 border-gray-600 hover:border-gray-500 data-[open=true]:border-blue-500",
                      value: "text-white",
                      label: "text-gray-300 font-medium",
                      popoverContent: "bg-gray-800 border-gray-600",
                      listbox: "bg-gray-800"
                    }}
                  >
                    {assignmentTypes.map((type) => (
                      <SelectItem key={type.key} className="text-white hover:bg-gray-700">
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Poin Maksimal"
                    type="number"
                    placeholder=""
                    value={formData.points.toString()}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0 })}
                    endContent={<span className="text-sm text-gray-400">poin</span>}
                    isRequired
                    classNames={{
                      input: "bg-gray-800 text-white placeholder:text-gray-400",
                      inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                      label: "text-gray-300 font-medium"
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Kelas"
                    placeholder="Pilih kelas"
                    selectedKeys={formData.classId ? [formData.classId] : []}
                    onSelectionChange={(keys) => setFormData({...formData, classId: Array.from(keys)[0] as string})}
                    isRequired
                    classNames={{
                      trigger: "bg-gray-800 border-gray-600 hover:border-gray-500 data-[open=true]:border-blue-500",
                      value: "text-white",
                      label: "text-gray-300 font-medium",
                      popoverContent: "bg-gray-800 border-gray-600",
                      listbox: "bg-gray-800"
                    }}
                  >
                    {classes.map((cls) => (
                      <SelectItem 
                        key={cls.id}
                        textValue={`${cls.name}${cls.subject?.name ? ` - ${cls.subject.name}` : ''}`}
                        className="text-white hover:bg-gray-700"
                      >
                        {cls.name} {cls.subject?.name ? `- ${cls.subject.name}` : ''}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    isRequired
                    classNames={{
                      input: "bg-gray-800 text-white placeholder:text-gray-400",
                      inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                      label: "text-gray-300 font-medium"
                    }}
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.title && (
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-bold text-blue-300 mb-3">Preview Tugas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">{formData.title}</span>
                    </div>
                    {formData.description && (
                      <p className="text-gray-300 ml-6">{formData.description}</p>
                    )}
                    <div className="flex items-center gap-4 ml-6 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{formData.points} poin</span>
                      </div>
                      {formData.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(formData.deadline).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {formData.classId && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{classes.find(c => c.id === formData.classId)?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="bg-gray-900 border-t border-gray-700">
              <Button 
                variant="light" 
                onPress={handleClose} 
                isDisabled={isLoading}
                className="text-gray-300 hover:bg-gray-700"
              >
                Batal
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={isLoading}
                startContent={!isLoading ? <FileText className="w-4 h-4" /> : null}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                {isLoading ? 'Menyimpan...' : (assignment ? 'Update Tugas' : 'Buat Tugas')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AssignmentModal;
