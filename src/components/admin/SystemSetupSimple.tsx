import React, { useState, useEffect } from 'react';
import { School, Calendar, Settings, CheckCircle, Save } from 'lucide-react';
import configService, { SystemStatus } from '../../services/configService';

interface SystemSetupProps {
  onSetupComplete?: () => void;
}

const SystemSetup: React.FC<SystemSetupProps> = ({ onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolId: '',
    academicYear: '2024/2025'
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
      
      if (status.initialized) {
        setFormData({
          schoolName: status.school_name || '',
          schoolId: status.default_school_id || '',
          academicYear: status.default_academic_year || '2024/2025'
        });
      }
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
      await configService.initializeSystem({
        schoolName: formData.schoolName,
        schoolId: formData.schoolId || undefined,
        academicYear: formData.academicYear
      });

      setSuccess('Sistem berhasil dikonfigurasi! Anda dapat mulai menggunakan aplikasi.');
      
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
        : 'Terjadi kesalahan saat mengkonfigurasi sistem';
      
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

  if (systemStatus?.initialized) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h2 className="text-lg font-semibold">Sistem Sudah Dikonfigurasi</h2>
              <p className="text-sm text-gray-500">
                Sistem Guru Digital Pelangi sudah siap digunakan
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <School className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-green-800">
                {systemStatus.school_name || 'Nama sekolah belum diset'}
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
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Sistem Siap Digunakan</h4>
            <p className="text-sm text-green-700">
              Anda dapat mulai mengelola kelas, siswa, dan mata pelajaran.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Settings className="text-blue-600" size={24} />
          <div>
            <h2 className="text-lg font-semibold">Setup Awal Sistem</h2>
            <p className="text-sm text-gray-500">
              Konfigurasikan pengaturan dasar untuk Guru Digital Pelangi
            </p>
          </div>
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
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Informasi Setup:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Nama sekolah akan tampil di seluruh aplikasi</li>
              <li>• ID Sekolah akan otomatis diterapkan pada kelas baru</li>
              <li>• Tahun ajaran akan menjadi default untuk kelas baru</li>
              <li>• Pengaturan ini bisa diubah nanti melalui menu admin</li>
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
            {isLoading ? 'Mengkonfigurasi...' : 'Simpan Konfigurasi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSetup;
