// StudentFormModal.tsx - Komponen modal form siswa terpisah
import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem
} from '@heroui/react';

interface Class {
  id: string;
  name: string;
  gradeLevel?: string;
}

interface StudentFormData {
  studentId: string;
  fullName: string;
  email: string;
  classId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  status: string;
  asalSekolah: string;
  kecamatan: string;
  desaKelurahan: string;
}

interface StudentFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: StudentFormData;
  classes: Class[];
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: string, value: string) => void;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  isEditing,
  formData,
  classes,
  onClose,
  onSave,
  onFormChange
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                <span>{isEditing ? 'Edit Siswa' : 'Tambah Siswa Baru'}</span>
              </div>
            </ModalHeader>
            <ModalBody className="gap-6 bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NISN"
                  placeholder="10 digit NISN"
                  value={formData.studentId}
                  onChange={(e) => onFormChange('studentId', e.target.value)}
                  isRequired
                  maxLength={10}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Select
                  label="Kelas"
                  placeholder="Pilih kelas"
                  selectedKeys={formData.classId ? [formData.classId] : []}
                  onSelectionChange={(keys) => {
                    const classId = Array.from(keys)[0] as string;
                    onFormChange('classId', classId);
                  }}
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
                    <SelectItem key={cls.id} className="text-white hover:bg-gray-700">
                      {cls.name}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Nama Lengkap"
                  placeholder="Nama lengkap siswa"
                  value={formData.fullName}
                  onChange={(e) => onFormChange('fullName', e.target.value)}
                  isRequired
                  className="md:col-span-2"
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Select
                  label="Jenis Kelamin"
                  placeholder="Pilih jenis kelamin"
                  selectedKeys={formData.gender ? [formData.gender] : []}
                  onSelectionChange={(keys) => {
                    const gender = Array.from(keys)[0] as string;
                    onFormChange('gender', gender);
                  }}
                  classNames={{
                    trigger: "bg-gray-800 border-gray-600 hover:border-gray-500 data-[open=true]:border-blue-500",
                    value: "text-white",
                    label: "text-gray-300 font-medium",
                    popoverContent: "bg-gray-800 border-gray-600",
                    listbox: "bg-gray-800"
                  }}
                >
                  <SelectItem key="L" className="text-white hover:bg-gray-700">Laki-laki</SelectItem>
                  <SelectItem key="P" className="text-white hover:bg-gray-700">Perempuan</SelectItem>
                </Select>

                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => onFormChange('dateOfBirth', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="No. Telepon"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="Alamat"
                  placeholder="Alamat lengkap"
                  value={formData.address}
                  onChange={(e) => onFormChange('address', e.target.value)}
                  className="md:col-span-2"
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="Asal Sekolah"
                  placeholder="Nama sekolah asal"
                  value={formData.asalSekolah}
                  onChange={(e) => onFormChange('asalSekolah', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="Kecamatan"
                  placeholder="Nama kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) => onFormChange('kecamatan', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="Desa/Kelurahan"
                  placeholder="Nama desa atau kelurahan"
                  value={formData.desaKelurahan}
                  onChange={(e) => onFormChange('desaKelurahan', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="Nama Orang Tua"
                  placeholder="Nama orang tua/wali"
                  value={formData.parentName}
                  onChange={(e) => onFormChange('parentName', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />

                <Input
                  label="No. Telepon Orang Tua"
                  placeholder="08xxxxxxxxxx"
                  value={formData.parentPhone}
                  onChange={(e) => onFormChange('parentPhone', e.target.value)}
                  classNames={{
                    input: "bg-gray-800 text-white placeholder:text-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600 hover:border-gray-500 focus-within:border-blue-500",
                    label: "text-gray-300 font-medium"
                  }}
                />
              </div>
            </ModalBody>
            <ModalFooter className="bg-gray-900 border-t border-gray-700">
              <Button 
                variant="light" 
                onPress={onClose}
                className="text-gray-300 hover:bg-gray-700"
              >
                Batal
              </Button>
              <Button 
                color="primary" 
                onPress={onSave}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                {isEditing ? 'Update' : 'Simpan'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default StudentFormModal;
