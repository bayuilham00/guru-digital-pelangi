import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Chip
} from '@heroui/react';
import { Save } from 'lucide-react';
import { GradeRecord } from '../types/gradeTypes';
import { getScoreColor, validateScore, calculatePercentage } from '../utils/gradeUtils';

interface GradeModalsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: GradeRecord | null;
  editScore: string;
  editMaxScore: string;
  editDescription: string;
  isSaving: boolean;
  onScoreChange: (value: string) => void;
  onMaxScoreChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
}

const GradeModals: React.FC<GradeModalsProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  editScore,
  editMaxScore,
  editDescription,
  isSaving,
  onScoreChange,
  onMaxScoreChange,
  onDescriptionChange,
  onSave
}) => {
  const validation = validateScore(editScore, editMaxScore);
  const isValidScore = validation.isValid && editScore !== '' && editMaxScore !== '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h3>
                {selectedGrade?.id ? 'Edit Nilai' : 'Input Nilai'} - {selectedGrade?.student?.fullName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Nilai"
                    placeholder="0-100"
                    value={editScore}
                    onChange={(e) => onScoreChange(e.target.value)}
                    min="0"
                    max={editMaxScore}
                    isInvalid={!validation.isValid && editScore !== ''}
                    errorMessage={validation.error}
                  />
                  <Input
                    type="number"
                    label="Nilai Maksimal"
                    placeholder="100"
                    value={editMaxScore}
                    onChange={(e) => onMaxScoreChange(e.target.value)}
                    min="1"
                  />
                </div>

                <Textarea
                  label="Deskripsi"
                  placeholder="Tambahkan deskripsi tugas (opsional)"
                  value={editDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                />

                {isValidScore && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Persentase:</span>
                      <Chip
                        color={getScoreColor(parseFloat(editScore), parseFloat(editMaxScore))}
                        variant="flat"
                      >
                        {calculatePercentage(parseFloat(editScore), parseFloat(editMaxScore))}%
                      </Chip>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button
                color="primary"
                onPress={onSave}
                isLoading={isSaving}
                isDisabled={!isValidScore}
                startContent={<Save className="w-4 h-4" />}
              >
                {selectedGrade?.id ? 'Update' : 'Simpan'} Nilai
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default GradeModals;
