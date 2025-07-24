// BulkAssignClassModal.tsx - Modal untuk assign kelas ke multiple siswa
import React, { useState, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Chip,
  Divider,
  addToast,
  cn
} from '@heroui/react';
import { Users, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Student } from '../../../services/types';

interface Class {
  id: string;
  name: string;
  gradeLevel?: string;
}

interface BulkAssignClassModalProps {
  isOpen: boolean;
  selectedStudents: Student[];
  classes: Class[];
  onClose: () => void;
  onAssign: (classId: string) => Promise<void>;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

const BulkAssignClassModal: React.FC<BulkAssignClassModalProps> = ({
  isOpen,
  selectedStudents,
  classes,
  onClose,
  onAssign,
  onSuccess,
  onError
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Analyze students and their current class status
  const studentAnalysis = useMemo(() => {
    const studentsWithClass = selectedStudents.filter(student => student.classId && student.class);
    const studentsWithoutClass = selectedStudents.filter(student => !student.classId);
    
    return {
      studentsWithClass,
      studentsWithoutClass,
      hasStudentsWithClass: studentsWithClass.length > 0,
      hasStudentsWithoutClass: studentsWithoutClass.length > 0
    };
  }, [selectedStudents]);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, description: string, actions?: React.ReactNode) => {
    const colorMap = {
      success: 'success',
      error: 'danger', 
      warning: 'warning',
      info: 'primary'
    };

    const iconMap = {
      success: 'border-l-success',
      error: 'border-l-danger',
      warning: 'border-l-warning', 
      info: 'border-l-primary'
    };

    addToast({
      title,
      description,
      classNames: {
        base: cn([
          "bg-default-50 dark:bg-background shadow-sm",
          "border border-l-8 rounded-md rounded-l-none",
          "flex flex-col items-start",
          `border-${colorMap[type]}-200 dark:border-${colorMap[type]}-100 ${iconMap[type]}`,
        ]),
        icon: "w-6 h-6 fill-current",
      },
      endContent: actions,
      color: colorMap[type] as 'success' | 'danger' | 'warning' | 'primary',
    });
  };

  const handleAssign = async () => {
    if (!selectedClassId) {
      showToast('warning', 'Peringatan', 'Pilih kelas terlebih dahulu');
      return;
    }

    const selectedClass = classes.find(cls => cls.id === selectedClassId);
    if (!selectedClass) {
      showToast('error', 'Error', 'Kelas yang dipilih tidak valid');
      return;
    }

    // Check if any students already have the same class
    const studentsInSameClass = selectedStudents.filter(student => student.classId === selectedClassId);
    if (studentsInSameClass.length > 0) {
      const studentNames = studentsInSameClass.map(s => s.fullName).join(', ');
      showToast(
        'warning', 
        'Siswa Sudah di Kelas Ini', 
        `Siswa ${studentNames} sudah ada di kelas ${selectedClass.name}, tidak bisa di-assign ke kelas yang sama`,
        <div className="ms-11 my-2 flex gap-x-2">
          <Button 
            color="warning" 
            size="sm" 
            variant="bordered"
            onPress={() => {
              setSelectedClassId('');
            }}
          >
            Pilih Kelas Lain
          </Button>
        </div>
      );
      return;
    }

    // If students have existing classes (but different from target), show confirmation
    if (studentAnalysis.hasStudentsWithClass && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    await performAssignment();
  };

  const performAssignment = async () => {
    const selectedClass = classes.find(cls => cls.id === selectedClassId);
    
    console.log('🔄 Starting bulk assign:', {
      selectedClassId,
      selectedStudentsCount: selectedStudents.length,
      studentIds: selectedStudents.map(s => s.id)
    });

    setIsAssigning(true);
    try {
      await onAssign(selectedClassId);
      
      // Reset state and close modal
      setSelectedClassId('');
      setShowConfirmation(false);
      onClose();
      
      // Call success callback after modal is closed
      if (onSuccess) {
        onSuccess(`${selectedStudents.length} siswa berhasil di-assign ke kelas ${selectedClass?.name}`);
      }
      
    } catch (error) {
      console.error('❌ Error assigning class:', error);
      
      // Call error callback
      if (onError) {
        onError('Terjadi kesalahan saat mengassign kelas');
      } else {
        showToast('error', 'Error', 'Terjadi kesalahan saat mengassign kelas');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedClassId('');
    setShowConfirmation(false);
    onClose();
  };

  const handleConfirmationAction = (confirmed: boolean) => {
    if (confirmed) {
      performAssignment();
    } else {
      setShowConfirmation(false);
      setSelectedClassId('');
    }
  };

  const selectedClass = classes.find(cls => cls.id === selectedClassId);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh]",
        body: "py-4",
        footer: "py-3"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Assign Kelas ke Siswa</h3>
              </div>
              <p className="text-xs text-gray-600">
                Pilih kelas untuk {selectedStudents.length} siswa terpilih
              </p>
            </ModalHeader>
            
            <ModalBody className="gap-3 overflow-y-auto">
              {/* Student Analysis - Compact */}
              {studentAnalysis.hasStudentsWithClass && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <p className="text-xs text-orange-800">
                      <span className="font-medium">{studentAnalysis.studentsWithClass.length} siswa</span> sudah memiliki kelas dan akan dipindahkan
                    </p>
                  </div>
                </div>
              )}

              {/* Selected Students List - Compact */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Siswa yang akan di-assign ({selectedStudents.length})
                </h4>
                <div className="max-h-24 overflow-y-auto bg-gray-50 rounded-md p-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedStudents.slice(0, 8).map((student) => (
                      <Chip 
                        key={student.id} 
                        size="sm" 
                        variant="flat" 
                        color={student.classId ? "warning" : "primary"}
                        className="text-xs"
                      >
                        {student.fullName}
                        {student.classId && (
                          <span className="opacity-60 ml-1">
                            ({student.class?.name})
                          </span>
                        )}
                      </Chip>
                    ))}
                    {selectedStudents.length > 8 && (
                      <Chip size="sm" variant="flat" color="default" className="text-xs">
                        +{selectedStudents.length - 8} lainnya
                      </Chip>
                    )}
                  </div>
                </div>
              </div>

              {/* Class Selection - Compact */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Pilih Kelas Tujuan
                </h4>
                <Select
                  label="Kelas"
                  placeholder="Pilih kelas"
                  selectedKeys={selectedClassId ? [selectedClassId] : []}
                  onSelectionChange={(keys) => {
                    const classId = Array.from(keys)[0] as string;
                    setSelectedClassId(classId);
                    setShowConfirmation(false);
                  }}
                  isRequired
                  size="md"
                  classNames={{
                    trigger: "h-10"
                  }}
                >
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} textValue={cls.name}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{cls.name}</span>
                        {cls.gradeLevel && (
                          <span className="text-xs text-gray-500">{cls.gradeLevel}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Confirmation Dialog - Compact */}
              {showConfirmation && selectedClass && studentAnalysis.hasStudentsWithClass && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-yellow-900 mb-1">
                        Konfirmasi Pemindahan Kelas
                      </p>
                      <p className="text-xs text-yellow-800 mb-2">
                        {studentAnalysis.studentsWithClass.length} siswa akan dipindahkan ke{' '}
                        <span className="font-medium">{selectedClass.name}</span>
                      </p>
                      <div className="text-xs text-yellow-700 mb-3 max-h-16 overflow-y-auto">
                        <p className="font-medium mb-1">Siswa yang dipindahkan:</p>
                        <div className="space-y-0.5">
                          {studentAnalysis.studentsWithClass.map((student) => (
                            <div key={student.id} className="truncate">
                              {student.fullName} (dari {student.class?.name})
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          color="warning"
                          size="sm"
                          onPress={() => handleConfirmationAction(true)}
                          isLoading={isAssigning}
                          className="h-8 text-xs"
                        >
                          Ya, Pindahkan
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          onPress={() => handleConfirmationAction(false)}
                          isDisabled={isAssigning}
                          className="h-8 text-xs"
                        >
                          Tidak, Batal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            
            <ModalFooter className="pt-2">
              <Button 
                variant="light" 
                onPress={handleClose}
                isDisabled={isAssigning}
                size="sm"
                className="h-9"
              >
                Batal
              </Button>
              {!showConfirmation ? (
                <Button
                  color="primary"
                  onPress={handleAssign}
                  isLoading={isAssigning}
                  isDisabled={!selectedClassId}
                  startContent={!isAssigning ? <Users className="w-4 h-4" /> : null}
                  size="sm"
                  className="h-9"
                >
                  {isAssigning ? 'Mengassign...' : 
                   studentAnalysis.hasStudentsWithClass ? 
                   `Pindahkan ${selectedStudents.length} Siswa` : 
                   `Assign ${selectedStudents.length} Siswa`}
                </Button>
              ) : (
                <div className="text-xs text-gray-600 flex items-center">
                  Konfirmasi pemindahan di atas untuk melanjutkan
                </div>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BulkAssignClassModal;
