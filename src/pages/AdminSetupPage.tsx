import React, { useState, useEffect } from 'react';
import SystemSetup from '../components/admin/SystemSetup';
import configService, { SystemStatus } from '../services/configService';

const AdminSetupPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const status = await configService.checkSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    // Refresh status after setup completion
    checkSystemStatus();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat status sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎓 Guru Digital Pelangi
          </h1>
          <p className="text-gray-600">
            {systemStatus?.initialized 
              ? 'Sistem Sudah Dikonfigurasi' 
              : 'Setup Awal Aplikasi'
            }
          </p>
        </div>

        {/* Content */}
        <SystemSetup onSetupComplete={handleSetupComplete} />

        {/* Navigation Back */}
        {systemStatus?.initialized && (
          <div className="text-center mt-8">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Guru Digital Pelangi - Sistem Manajemen Pendidikan</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;
