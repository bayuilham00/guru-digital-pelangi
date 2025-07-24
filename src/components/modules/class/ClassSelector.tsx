import React, { useState, useEffect } from 'react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { ChevronDown, Plus } from 'lucide-react';
import { classService } from '../../../services/classService';
import { Class } from '../../../services/types';

interface ClassSelectorProps {
  value: string;
  onChange: (className: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface ExistingClass {
  id: string;
  name: string;
  studentCount: number;
  subjectCount: number;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  value,
  onChange,
  placeholder = "Pilih kelas yang ada atau buat baru",
  disabled = false
}) => {
  const [existingClasses, setExistingClasses] = useState<ExistingClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load existing classes for the dropdown
  useEffect(() => {
    loadExistingClasses();
  }, []);

  const loadExistingClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classService.getClasses();
      
      // Handle API response that might be wrapped
      let classes: Class[] = [];
      if (Array.isArray(response)) {
        classes = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        classes = response.data;
      }
      
      // Get unique class names with their info
      const uniqueClasses = classes.reduce((acc: ExistingClass[], cls: Class) => {
        const existing = acc.find(c => c.name === cls.name);
        if (!existing) {
          acc.push({
            id: cls.id,
            name: cls.name,
            studentCount: cls.studentCount || 0,
            subjectCount: 1 // Will be updated by backend
          });
        }
        return acc;
      }, []);

      setExistingClasses(uniqueClasses);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewClass = () => {
    if (newClassName.trim()) {
      onChange(newClassName.trim());
      setNewClassName('');
      onClose();
    }
  };

  const handleSelectExisting = (className: string) => {
    onChange(className);
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="bordered"
            className="w-full justify-between"
            endContent={<ChevronDown className="w-4 h-4" />}
            isDisabled={disabled}
          >
            {value || placeholder}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Class Selection"
          className="max-h-60 overflow-y-auto"
          disallowEmptySelection
          children={[
            <DropdownItem
              key="create-new"
              startContent={<Plus className="w-4 h-4" />}
              className="text-blue-600 border-b border-gray-200"
              onPress={onOpen}
            >
              Buat Kelas Baru
            </DropdownItem>,

            ...(isLoading ? [
              <DropdownItem key="loading" isDisabled>
                Loading kelas yang ada...
              </DropdownItem>
            ] : []),

            ...(!isLoading && existingClasses.length === 0 ? [
              <DropdownItem key="empty" isDisabled>
                Belum ada kelas yang tersedia
              </DropdownItem>
            ] : []),

            ...(!isLoading ? existingClasses.map((cls) => (
              <DropdownItem
                key={cls.id}
                onPress={() => handleSelectExisting(cls.name)}
                className="hover:bg-gray-50"
                description={`${cls.studentCount} siswa • ${cls.subjectCount} mata pelajaran`}
              >
                {cls.name}
              </DropdownItem>
            )) : [])
          ]}
        />
      </Dropdown>

      {/* Create New Class Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Buat Kelas Baru</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nama Kelas"
                    placeholder="Contoh: Kelas 7A, Kelas 8.1, Kelas IX-A"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    autoFocus
                  />
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Tips penamaan:</strong>
                    </p>
                    <ul className="text-xs text-blue-600 mt-1 space-y-1">
                      <li>• Gunakan format yang konsisten (Kelas 7A, 7B, 7C)</li>
                      <li>• Hindari karakter khusus yang rumit</li>
                      <li>• Pastikan nama mudah dikenali oleh guru dan siswa</li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="light" 
                  onPress={onClose}
                >
                  Batal
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreateNewClass}
                  isDisabled={!newClassName.trim()}
                >
                  Buat Kelas
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ClassSelector;
