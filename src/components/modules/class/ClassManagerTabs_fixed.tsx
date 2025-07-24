import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { BookOpen, Calendar, Settings } from 'lucide-react';
import ClassManagerCore from './ClassManagerCore';
import AttendanceManager from '../attendance/AttendanceManager';

interface ClassManagerTabsProps {
  onNavigateToSettings?: () => void;
}

const ClassManagerTabs: React.FC<ClassManagerTabsProps> = ({ onNavigateToSettings }) => {
  const [activeTab, setActiveTab] = useState('classes');

  const handleNavigateToSettings = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    } else {
      // Use React Router navigation instead of window.location
      console.log('Navigate to settings - implement proper routing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {activeTab === 'classes' && <BookOpen className="w-8 h-8 text-blue-400" />}
            {activeTab === 'attendance' && <Calendar className="w-8 h-8 text-green-400" />}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {activeTab === 'classes' && 'Manajemen Kelas'}
                {activeTab === 'attendance' && 'Presensi Siswa'}
              </h1>
              <p className="text-gray-300">
                {activeTab === 'classes' && 'Kelola data kelas dan assignment guru'}
                {activeTab === 'attendance' && 'Kelola presensi siswa per kelas'}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="bordered" 
              startContent={<Settings className="w-4 h-4" />}
              onPress={handleNavigateToSettings}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Kelola Guru & Mata Pelajaran
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={activeTab === 'classes' ? 'solid' : 'bordered'}
            className={activeTab === 'classes' 
              ? 'bg-blue-600 text-white' 
              : 'border-white/20 text-white hover:bg-white/10'
            }
            startContent={<BookOpen className="w-4 h-4" />} 
            onPress={() => setActiveTab('classes')}
          >
            Data Kelas
          </Button>
          
          <Button 
            variant={activeTab === 'attendance' ? 'solid' : 'bordered'}
            className={activeTab === 'attendance' 
              ? 'bg-green-600 text-white' 
              : 'border-white/20 text-white hover:bg-white/10'
            }
            startContent={<Calendar className="w-4 h-4" />} 
            onPress={() => setActiveTab('attendance')}
          >
            Presensi
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'classes' && <ClassManagerCore />}
          {activeTab === 'attendance' && <AttendanceManager />}
        </div>

        {/* Helper Text */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Panduan Penggunaan</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• <strong>Data Kelas:</strong> Buat kelas → Assign mata pelajaran → Assign guru</li>
                <li>• <strong>Presensi:</strong> Kelola presensi siswa per kelas dan mata pelajaran</li>
                <li>• <strong>Kelola Guru & Mata Pelajaran:</strong> Tambah/edit data master guru dan mata pelajaran</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassManagerTabs;