// Settings Manager Component (Admin Only)
// Combines Teacher Management and Subject Management in tabs

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab
} from '@heroui/react';
import { Settings, Users, BookOpen } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import TeacherManager from './TeacherManager';
import SubjectManager from './SubjectManager';

const SettingsManager: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('teachers');

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600">Kelola data guru, mata pelajaran, dan pengaturan lainnya</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as string)}
            className="w-full"
          >
            <Tab 
              key="teachers" 
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Data Guru</span>
                </div>
              }
            />
            <Tab 
              key="subjects" 
              title={
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Mata Pelajaran</span>
                </div>
              }
            />
          </Tabs>
        </CardHeader>
        <CardBody>
          {activeTab === 'teachers' && <TeacherManager />}
          {activeTab === 'subjects' && <SubjectManager />}
        </CardBody>
      </Card>
    </div>
  );
};

export default SettingsManager;
