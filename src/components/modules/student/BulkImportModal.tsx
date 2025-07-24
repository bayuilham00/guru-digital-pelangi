// Bulk Import Students Modal Component
import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Progress,
  Chip
} from '@heroui/react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { studentService } from '../../../services/studentService';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
      setValidationErrors([]);
    }
  };

  const parseCSV = (csvText: string) => {
    console.log('📁 Starting CSV parsing...');
    console.log('📁 CSV content:', csvText.substring(0, 200) + '...');
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📁 Total lines found:', lines.length);
    
    if (lines.length < 2) {
      console.error('📁 CSV file has less than 2 lines');
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    console.log('📁 Headers found:', headers);
    
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      console.log(`📁 Row ${i} values:`, values);
      
      const student: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header.toLowerCase()) {
          case 'nisn':
          case 'student_id':
            student.studentId = value;
            break;
          case 'nama':
          case 'nama_lengkap':
          case 'full_name':
            student.fullName = value;
            break;
          case 'email':
            student.email = value;
            break;
          case 'kelas':
          case 'class_id':
            student.classId = value;
            break;
          case 'tanggal_lahir':
          case 'date_of_birth':
            student.dateOfBirth = value;
            break;
          case 'jenis_kelamin':
          case 'gender':
            student.gender = value.toUpperCase();
            break;
          case 'alamat':
          case 'address':
            student.address = value;
            break;
          case 'telepon':
          case 'phone':
            student.phone = value;
            break;
          case 'nama_ortu':
          case 'parent_name':
            student.parentName = value;
            break;
          case 'telepon_ortu':
          case 'parent_phone':
            student.parentPhone = value;
            break;
          case 'asal_sekolah':
          case 'previous_school':
            student.asalSekolah = value;
            break;
          case 'kecamatan':
          case 'district':
            student.kecamatan = value;
            break;
          case 'desa_kelurahan':
          case 'village':
            student.desaKelurahan = value;
            break;
        }
      });

      console.log(`📁 Parsed student ${i}:`, student);

      if (student.studentId && student.fullName) {
        students.push(student);
      } else {
        console.warn(`📁 Skipping row ${i} - missing required fields:`, student);
      }
    }

    console.log('📁 Final parsed students:', students);
    return students;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setValidationErrors([]);

    try {
      console.log('🚀 Starting upload process...');
      console.log('🚀 File:', file);
      
      const fileText = await file.text();
      console.log('🚀 File text length:', fileText.length);
      
      const students = parseCSV(fileText);
      console.log('🚀 Parsed students count:', students.length);

      if (students.length === 0) {
        setValidationErrors(['File CSV tidak valid atau tidak ada data siswa yang dapat diproses']);
        setIsUploading(false);
        return;
      }

      console.log('🚀 Sending bulk import request...');
      console.log('🚀 Students data:', students);
      
      const response = await studentService.bulkImportStudents(students);
      console.log('🚀 Backend response:', response);

      if (response.success) {
        setUploadResult({
          success: true,
          created: response.data.created,
          message: response.message
        });
        onSuccess();
      } else {
        console.error('🚀 Backend error:', response.error);
        setUploadResult({
          success: false,
          error: response.error
        });
        if (response.validationErrors) {
          setValidationErrors(response.validationErrors);
        }
      }
    } catch (error) {
      console.error('🚀 Upload error:', error);
      setUploadResult({
        success: false,
        error: 'Gagal memproses file CSV: ' + error.message
      });
    }

    setIsUploading(false);
  };

  const downloadTemplate = () => {
    const csvContent = `NISN,Nama_Lengkap,Email,Kelas,Tanggal_Lahir,Jenis_Kelamin,Alamat,Telepon,Nama_Ortu,Telepon_Ortu,Asal_Sekolah,Kecamatan,Desa_Kelurahan
1234567890,John Doe,john@example.com,,2010-01-15,L,Jl. Contoh No. 1,08123456789,Jane Doe,08987654321,SD Negeri 1,Kecamatan Contoh,Desa Contoh
0987654321,Jane Smith,jane@example.com,,2010-02-20,P,Jl. Contoh No. 2,08234567890,John Smith,08876543210,SD Negeri 2,Kecamatan Contoh,Kelurahan Contoh`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_siswa.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setValidationErrors([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Bulk Import Siswa</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Download Template */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">Download Template</h4>
                          <p className="text-sm text-gray-600">
                            Download template CSV untuk format yang benar
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="flat"
                        color="primary"
                        startContent={<Download className="w-4 h-4" />}
                        onPress={downloadTemplate}
                      >
                        Download
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {/* File Upload */}
                <Card>
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold">Upload File CSV</h4>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        aria-label="Pilih file CSV untuk upload"
                      />
                      {file && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>{file.name}</span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Upload Progress */}
                {isUploading && (
                  <Card>
                    <CardBody>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Memproses file...</span>
                        </div>
                        <Progress value={50} className="w-full" />
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Upload Result */}
                {uploadResult && (
                  <Card>
                    <CardBody>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {uploadResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-semibold ${uploadResult.success ? 'text-green-600' : 'text-red-600'}`}>
                            {uploadResult.success ? 'Berhasil!' : 'Gagal!'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {uploadResult.success ? uploadResult.message : uploadResult.error}
                        </p>
                        {uploadResult.success && (
                          <Chip color="success" variant="flat">
                            {uploadResult.created} siswa berhasil ditambahkan
                          </Chip>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Card>
                    <CardBody>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-600">Kesalahan Validasi</span>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          {validationErrors.map((error, index) => (
                            <p key={index} className="text-sm text-red-600">
                              • {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Instructions */}
                <Card className="bg-blue-50">
                  <CardBody>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-900">Petunjuk:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• File harus dalam format CSV</li>
                        <li>• NISN dan Nama Lengkap wajib diisi</li>
                        <li>• Jenis kelamin: L (Laki-laki) atau P (Perempuan)</li>
                        <li>• Format tanggal: YYYY-MM-DD</li>
                        <li>• Kelas ID opsional (bisa diisi nanti)</li>
                        <li>• Asal Sekolah, Kecamatan, dan Desa/Kelurahan opsional</li>
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleClose}>
                Tutup
              </Button>
              <Button
                color="primary"
                onPress={handleUpload}
                isDisabled={!file || isUploading}
                isLoading={isUploading}
                startContent={!isUploading ? <Upload className="w-4 h-4" /> : null}
              >
                {isUploading ? 'Mengupload...' : 'Upload'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BulkImportModal;
