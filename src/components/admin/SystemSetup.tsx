import React, { useState, useEffect } from 'react';
import { School, Calendar, Settings, CheckCircle, Save, MapPin, Phone, Mail, User, CreditCard, Edit3 } from 'lucide-react';
import configService, { SystemStatus } from '../../services/configService';

interface SystemSetupProps {
  onSetupComplete?: () => void;
}

const SystemSetup: React.FC<SystemSetupProps> = ({ onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolId: '',
    academicYear: '2024/2025',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    principalName: '',
    principalNip: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const status = await configService.checkSystemStatus();
      setSystemStatus(status);
      
      // Always populate form data with current values
      setFormData({
        schoolName: status.school_name || '',
        schoolId: status.default_school_id || '',
        academicYear: status.default_academic_year || '2024/2025',
        schoolAddress: status.school_address || '',
        schoolPhone: status.school_phone || '',
        schoolEmail: status.school_email || '',
        principalName: status.principal_name || '',
        principalNip: status.principal_nip || ''
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'Nama sekolah wajib diisi';
    }
    
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Tahun ajaran wajib diisi';
    }
    
    if (formData.academicYear && !/^\d{4}\/\d{4}$/.test(formData.academicYear)) {
      newErrors.academicYear = 'Format tahun ajaran harus YYYY/YYYY (contoh: 2024/2025)';
    }

    // Validate email format if provided
    if (formData.schoolEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail)) {
      newErrors.schoolEmail = 'Format email tidak valid';
    }

    // Validate phone format if provided
    if (formData.schoolPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.schoolPhone)) {
      newErrors.schoolPhone = 'Format telepon tidak valid (hanya angka, spasi, -, +, (, ) yang diizinkan)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccess('');
    setErrors({});

    try {
      if (systemStatus?.initialized) {
        // Update existing configuration
        const configsToUpdate = [
          { key: 'SCHOOL_NAME', value: formData.schoolName, category: 'school' },
          { key: 'DEFAULT_SCHOOL_ID', value: formData.schoolId, category: 'school' },
          { key: 'DEFAULT_ACADEMIC_YEAR', value: formData.academicYear, category: 'academic' },
          { key: 'SCHOOL_ADDRESS', value: formData.schoolAddress, category: 'school' },
          { key: 'SCHOOL_PHONE', value: formData.schoolPhone, category: 'school' },
          { key: 'SCHOOL_EMAIL', value: formData.schoolEmail, category: 'school' },
          { key: 'PRINCIPAL_NAME', value: formData.principalName, category: 'school' },
          { key: 'PRINCIPAL_NIP', value: formData.principalNip, category: 'school' }
        ];

        await configService.updateMultipleConfigs(configsToUpdate);
        setSuccess('Konfigurasi berhasil diperbarui!');
        setIsEditing(false);
      } else {
        // Initialize system for first time
        await configService.initializeSystem({
          schoolName: formData.schoolName,
          schoolId: formData.schoolId || undefined,
          academicYear: formData.academicYear,
          schoolAddress: formData.schoolAddress || undefined,
          schoolPhone: formData.schoolPhone || undefined,
          schoolEmail: formData.schoolEmail || undefined,
          principalName: formData.principalName || undefined,
          principalNip: formData.principalNip || undefined
        });
        setSuccess('Sistem berhasil dikonfigurasi! Anda dapat mulai menggunakan aplikasi.');
      }
      
      // Refresh system status
      await checkSystemStatus();
      
      // Call callback if provided
      if (onSetupComplete) {
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      }

    } catch (error: unknown) {
      console.error('Setup error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data?.message || 'Terjadi kesalahan saat menyimpan konfigurasi';
      
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}/${nextYear}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (systemStatus?.initialized && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <h2 className="text-lg font-semibold">Sistem Sudah Dikonfigurasi</h2>
                <p className="text-sm text-gray-500">
                  Sistem Guru Digital Pelangi sudah siap digunakan
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={16} />
              Edit Konfigurasi
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Berhasil</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <School className="text-green-600" size={20} />
              <div>
                <p className="font-medium text-green-800">
                  {systemStatus.school_name || 'Belum diset'}
                </p>
                <p className="text-sm text-green-600">Nama Sekolah</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <p className="font-medium text-blue-800">
                  {systemStatus.default_academic_year || '2024/2025'}
                </p>
                <p className="text-sm text-blue-600">Tahun Ajaran</p>
              </div>
            </div>

            {systemStatus.default_school_id && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Settings className="text-gray-600" size={20} />
                <div>
                  <p className="font-medium text-gray-800">
                    {systemStatus.default_school_id}
                  </p>
                  <p className="text-sm text-gray-600">ID Sekolah</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <MapPin className="text-purple-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-purple-800 whitespace-pre-wrap">
                  {systemStatus.school_address || 'Belum diisi'}
                </p>
                <p className="text-sm text-purple-600">Alamat Sekolah</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Phone className="text-orange-600" size={20} />
              <div>
                <p className="font-medium text-orange-800">
                  {systemStatus.school_phone || 'Belum diisi'}
                </p>
                <p className="text-sm text-orange-600">Telepon Sekolah</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
              <Mail className="text-teal-600" size={20} />
              <div>
                <p className="font-medium text-teal-800">
                  {systemStatus.school_email || 'Belum diisi'}
                </p>
                <p className="text-sm text-teal-600">Email Sekolah</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <User className="text-indigo-600" size={20} />
              <div>
                <p className="font-medium text-indigo-800">
                  {systemStatus.principal_name || 'Belum diisi'}
                </p>
                <p className="text-sm text-indigo-600">Nama Kepala Sekolah</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
              <CreditCard className="text-pink-600" size={20} />
              <div>
                <p className="font-medium text-pink-800">
                  {systemStatus.principal_nip || 'Belum diisi'}
                </p>
                <p className="text-sm text-pink-600">NIP Kepala Sekolah</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Sistem Siap Digunakan</h4>
            <p className="text-sm text-green-700">
              Anda dapat mulai mengelola kelas, siswa, dan mata pelajaran. Klik "Edit Konfigurasi" untuk mengubah pengaturan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show setup/edit form
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-600" size={24} />
            <div>
              <h2 className="text-lg font-semibold">
                {systemStatus?.initialized ? 'Edit Konfigurasi Sistem' : 'Setup Awal Sistem'}
              </h2>
              <p className="text-sm text-gray-500">
                {systemStatus?.initialized 
                  ? 'Perbarui pengaturan sistem Guru Digital Pelangi'
                  : 'Konfigurasikan pengaturan dasar untuk Guru Digital Pelangi'
                }
              </p>
            </div>
          </div>
          {systemStatus?.initialized && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Berhasil</p>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Sekolah <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.schoolName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama sekolah"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                />
              </div>
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Sekolah (Opsional)
              </label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan ID sekolah jika ada"
                  value={formData.schoolId}
                  onChange={(e) => handleInputChange('schoolId', e.target.value)}
                />
              </div>
              <p className="text-gray-500 text-sm mt-1">
                ID unik sekolah yang akan otomatis diterapkan pada kelas baru
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.academicYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="YYYY/YYYY"
                    value={formData.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  />
                </div>
                {errors.academicYear && (
                  <p className="text-red-500 text-sm mt-1">{errors.academicYear}</p>
                )}
              </div>
              <button
                type="button"
                className="mt-7 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                onClick={() => handleInputChange('academicYear', generateAcademicYear())}
              >
                Generate
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Sekolah
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.schoolAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan alamat lengkap sekolah"
                  rows={3}
                  value={formData.schoolAddress}
                  onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                />
              </div>
              {errors.schoolAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telepon Sekolah
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.schoolPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: (021) 123-4567"
                    value={formData.schoolPhone}
                    onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                  />
                </div>
                {errors.schoolPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.schoolPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Sekolah
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.schoolEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="contoh@sekolah.sch.id"
                    value={formData.schoolEmail}
                    onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                  />
                </div>
                {errors.schoolEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.schoolEmail}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kepala Sekolah
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.principalName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nama lengkap kepala sekolah"
                    value={formData.principalName}
                    onChange={(e) => handleInputChange('principalName', e.target.value)}
                  />
                </div>
                {errors.principalName && (
                  <p className="text-red-500 text-sm mt-1">{errors.principalName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIP Kepala Sekolah
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.principalNip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="NIP kepala sekolah"
                    value={formData.principalNip}
                    onChange={(e) => handleInputChange('principalNip', e.target.value)}
                  />
                </div>
                {errors.principalNip && (
                  <p className="text-red-500 text-sm mt-1">{errors.principalNip}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Informasi:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <span className="text-red-500">*</span> = Field wajib diisi</li>
              <li>• Nama sekolah akan tampil di seluruh aplikasi</li>
              <li>• ID Sekolah akan otomatis diterapkan pada kelas baru</li>
              <li>• Tahun ajaran akan menjadi default untuk kelas baru</li>
              <li>• Informasi kontak berguna untuk komunikasi dan laporan</li>
              <li>• Data kepala sekolah akan digunakan untuk tanda tangan dokumen</li>
            </ul>
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            } text-white`}
            disabled={isLoading}
          >
            <Save size={18} />
            {isLoading 
              ? (systemStatus?.initialized ? 'Memperbarui...' : 'Mengkonfigurasi...') 
              : (systemStatus?.initialized ? 'Simpan Perubahan' : 'Simpan Konfigurasi')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSetup;
