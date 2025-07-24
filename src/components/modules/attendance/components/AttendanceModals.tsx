// AttendanceModals - Edit and absent modals component
import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react';
import { Save } from 'lucide-react';
import { AttendanceModalsProps } from '../types/attendanceTypes';

const AttendanceModals: React.FC<AttendanceModalsProps> = ({
  // Edit modal props
  isEditOpen,
  onEditClose,
  selectedStudent,
  editForm,
  onEditFormChange,
  onEditSubmit,
  
  // Absent modal props
  isAbsentOpen,
  onAbsentClose,
  selectedStudentForAbsent,
  absentForm,
  onAbsentFormChange,
  onAbsentSubmit,
  
  // Common props
  selectedDate,
  isSaving
}) => {
  return (
    <>
      {/* Edit Attendance Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Edit Presensi</h3>
              </ModalHeader>
              <ModalBody>
                {selectedStudent && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">
                        {selectedStudent.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedDate}
                      </p>
                    </div>

                    <Select
                      label="Status Kehadiran"
                      placeholder="Pilih status"
                      selectedKeys={editForm.status ? [editForm.status] : []}
                      onSelectionChange={(keys) => {
                        const status = Array.from(keys)[0] as string;
                        onEditFormChange('status', status);
                      }}
                    >
                      <SelectItem key="PRESENT" textValue="Hadir">
                        Hadir
                      </SelectItem>
                      <SelectItem key="LATE" textValue="Terlambat">
                        Terlambat
                      </SelectItem>
                      <SelectItem key="ABSENT" textValue="Tidak Hadir">
                        Tidak Hadir
                      </SelectItem>
                      <SelectItem key="EXCUSED" textValue="Izin">
                        Izin
                      </SelectItem>
                    </Select>

                    {editForm.status === 'ABSENT' && (
                      <Select
                        label="Alasan Tidak Hadir"
                        placeholder="Pilih alasan"
                        selectedKeys={editForm.reason ? [editForm.reason] : []}
                        onSelectionChange={(keys) => {
                          const reason = Array.from(keys)[0] as string;
                          onEditFormChange('reason', reason);
                        }}
                      >
                        <SelectItem key="ALPA" textValue="Alpa">
                          Alpa (Tanpa Keterangan)
                        </SelectItem>
                        <SelectItem key="IZIN" textValue="Izin">
                          Izin
                        </SelectItem>
                        <SelectItem key="SAKIT" textValue="Sakit">
                          Sakit
                        </SelectItem>
                      </Select>
                    )}

                    <Textarea
                      label="Catatan"
                      placeholder="Tambahkan catatan (opsional)"
                      value={editForm.notes}
                      onChange={(e) => onEditFormChange('notes', e.target.value)}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={onEditSubmit}
                  isLoading={isSaving}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Absent Reason Modal */}
      <Modal isOpen={isAbsentOpen} onClose={onAbsentClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Tandai Tidak Hadir</h3>
              </ModalHeader>
              <ModalBody>
                {selectedStudentForAbsent && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">
                        {selectedStudentForAbsent.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Alasan Tidak Hadir:</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="absentReason"
                            value="ALPA"
                            checked={absentForm.reason === 'ALPA'}
                            onChange={(e) => onAbsentFormChange('reason', e.target.value)}
                            className="text-danger"
                          />
                          <span>Alpa (Tanpa Keterangan)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="absentReason"
                            value="IZIN"
                            checked={absentForm.reason === 'IZIN'}
                            onChange={(e) => onAbsentFormChange('reason', e.target.value)}
                            className="text-primary"
                          />
                          <span>Izin</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="absentReason"
                            value="SAKIT"
                            checked={absentForm.reason === 'SAKIT'}
                            onChange={(e) => onAbsentFormChange('reason', e.target.value)}
                            className="text-warning"
                          />
                          <span>Sakit</span>
                        </label>
                      </div>
                    </div>

                    <Textarea
                      label="Keterangan"
                      placeholder="Tambahkan keterangan (opsional)"
                      value={absentForm.notes}
                      onChange={(e) => onAbsentFormChange('notes', e.target.value)}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="danger"
                  onPress={onAbsentSubmit}
                  isLoading={isSaving}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Tandai Tidak Hadir
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AttendanceModals;
