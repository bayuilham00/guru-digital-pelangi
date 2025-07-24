import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Card,
  CardBody,
  Chip
} from '@heroui/react';
import { Camera, Upload, Trash2, X } from 'lucide-react';
import { studentService } from '../../services/studentService';

interface ProfilePhotoManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  studentId: string;
  studentName: string;
  currentPhoto?: string;
  canEdit?: boolean; // Allows different roles to control edit permissions
}

const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  studentName,
  currentPhoto,
  canEdit = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      console.log('🔄 Starting API upload for studentId:', studentId);
      console.log('🔄 File details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Try API first
      const result = await studentService.uploadProfilePhoto(studentId, selectedFile);
      
      console.log('🔄 API upload result:', result);
      
      if (result.success) {
        console.log('✅ API upload successful!');
        alert('Foto profil berhasil diupload!');
        onSuccess?.();
        handleClose();
      } else {
        // Fallback to local storage
        console.warn('❌ API upload failed, using local storage fallback');
        console.warn('❌ Error details:', result.error);
        await handleLocalUpload();
      }
    } catch (error) {
      console.error('❌ API upload error, using local storage fallback:', error);
      await handleLocalUpload();
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocalUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          // Store in localStorage as base64
          localStorage.setItem(`profile_photo_${studentId}`, result.toString());
          alert('Foto profil berhasil disimpan secara lokal!');
          onSuccess?.();
          handleClose();
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Local upload error:', error);
      alert('Terjadi kesalahan saat menyimpan foto secara lokal');
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Try API first
      const result = await studentService.updateProfilePhoto(studentId, selectedFile);
      
      if (result.success) {
        alert('Foto profil berhasil diupdate!');
        onSuccess?.();
        handleClose();
      } else {
        // Fallback to local storage
        console.warn('API update failed, using local storage fallback');
        await handleLocalUpload();
      }
    } catch (error) {
      console.error('API update error, using local storage fallback:', error);
      await handleLocalUpload();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus foto profil?')) return;

    setIsUploading(true);
    try {
      // Try API first
      const result = await studentService.deleteProfilePhoto(studentId);
      
      if (result.success) {
        alert('Foto profil berhasil dihapus!');
        onSuccess?.();
        handleClose();
      } else {
        // Fallback to local storage
        console.warn('API delete failed, using local storage fallback');
        localStorage.removeItem(`profile_photo_${studentId}`);
        alert('Foto profil berhasil dihapus secara lokal!');
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error('API delete error, using local storage fallback:', error);
      localStorage.removeItem(`profile_photo_${studentId}`);
      alert('Foto profil berhasil dihapus secara lokal!');
      onSuccess?.();
      handleClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const hasCurrentPhoto = currentPhoto && currentPhoto !== '/placeholder.svg';
  const isUpdate = hasCurrentPhoto;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6 overflow-y-auto",
        footer: "py-4 border-t"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold">
                    {isUpdate ? 'Update' : 'Upload'} Foto Profil
                  </h3>
                  <p className="text-sm text-gray-500 font-normal">
                    {studentName}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6">
              {/* Current Photo */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-block"
                >
                  <Avatar
                    src={previewUrl || currentPhoto || '/placeholder.svg'}
                    name={studentName}
                    className="w-32 h-32 text-large"
                  />
                </motion.div>
                
                {hasCurrentPhoto && (
                  <div className="mt-2">
                    <Chip color="success" variant="flat" size="sm">
                      Foto saat ini
                    </Chip>
                  </div>
                )}
              </div>

              {canEdit && (
                <>
                  {/* File Upload */}
                  <Card>
                    <CardBody>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Upload className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold">Pilih Foto Baru</h4>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        
                        {selectedFile && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-green-700">
                              ✓ File dipilih: {selectedFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 space-y-1">
                          <p>• Format yang didukung: JPG, PNG, GIF</p>
                          <p>• Ukuran maksimal: 5MB</p>
                          <p>• Dimensi yang direkomendasikan: 400x400px</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </>
              )}

              {!canEdit && (
                <Card className="bg-gray-50">
                  <CardBody>
                    <p className="text-center text-gray-600 text-sm">
                      Anda tidak memiliki izin untuk mengubah foto profil siswa ini.
                    </p>
                  </CardBody>
                </Card>
              )}
            </ModalBody>

            <ModalFooter className="flex justify-between">
              <Button 
                variant="light" 
                onPress={handleClose}
                startContent={<X className="w-4 h-4" />}
              >
                Tutup
              </Button>
              
              {canEdit && (
                <div className="flex gap-3">
                  <Button
                    color="primary"
                    variant="shadow"
                    isDisabled={!selectedFile || isUploading}
                    isLoading={isUploading}
                    onPress={isUpdate ? handleUpdate : handleUpload}
                    startContent={<Upload className="w-4 h-4" />}
                  >
                    {isUpdate ? 'Update Foto' : 'Upload Foto'}
                  </Button>

                  {hasCurrentPhoto && (
                    <Button
                      color="danger"
                      variant="flat"
                      isDisabled={isUploading}
                      onPress={handleDelete}
                      startContent={<Trash2 className="w-4 h-4" />}
                    >
                      Hapus Foto
                    </Button>
                  )}
                </div>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProfilePhotoManager;
