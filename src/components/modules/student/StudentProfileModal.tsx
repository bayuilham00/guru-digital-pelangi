// StudentProfileModal.tsx - Komponen modal profil siswa terpisah
import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Chip
} from '@heroui/react';
import { Edit } from 'lucide-react';
import { Student } from '../../../services/types';

interface StudentProfileModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  student,
  onClose,
  onEdit
}) => {
  if (!student) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
        footer: "py-4"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">Profil Siswa</h3>
            </ModalHeader>
            <ModalBody className="gap-4">
              <div className="space-y-6">
                {/* Header Profile */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Avatar
                    name={student.fullName?.split(' ').map(n => n.charAt(0)).join('') || 'S'}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xl"
                    size="lg"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{student.fullName}</h4>
                    <p className="text-gray-600">NISN: {student.studentId}</p>
                    {student.class && (
                      <Chip color="primary" variant="flat" size="sm">
                        {student.class.name}
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{student.email || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                    <p className="text-gray-900">
                      {student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : 'Tidak tersedia'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                    <p className="text-gray-900">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">No. Telepon</label>
                    <p className="text-gray-900">{student.phone || 'Tidak tersedia'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Alamat</label>
                    <p className="text-gray-900">{student.address || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Asal Sekolah</label>
                    <p className="text-gray-900">{student.asalSekolah || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Kecamatan</label>
                    <p className="text-gray-900">{student.kecamatan || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Desa/Kelurahan</label>
                    <p className="text-gray-900">{student.desaKelurahan || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Orang Tua</label>
                    <p className="text-gray-900">{student.parentName || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">No. Telepon Orang Tua</label>
                    <p className="text-gray-900">{student.parentPhone || 'Tidak tersedia'}</p>
                  </div>
                </div>

                {/* XP Info */}
                {student.studentXp && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Gamifikasi</h5>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{student.studentXp.totalXp}</p>
                        <p className="text-sm text-gray-600">Total XP</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{student.studentXp.level}</p>
                        <p className="text-sm text-gray-600">Level</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-purple-600">{student.studentXp.levelName}</p>
                        <p className="text-sm text-gray-600">Rank</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Tutup
              </Button>
              <Button
                color="primary"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => {
                  onEdit(student);
                  onClose();
                }}
              >
                Edit Siswa
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default StudentProfileModal;
