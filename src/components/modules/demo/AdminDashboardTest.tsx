import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { 
  Settings, 
  CheckCircle, 
  FileText,
  GraduationCap,
  CalendarCheck,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import AdminMultiSubjectDashboard from '../dashboard/AdminMultiSubjectDashboard';

const AdminDashboardTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Test Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardBody className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Enhanced Admin Dashboard Test</h1>
              <p className="text-green-100">Testing semua fitur baru multi-subject management</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Assignment Manager</h3>
            <p className="text-sm text-gray-600">Integrated penuh dengan admin dashboard</p>
            <Chip size="sm" color="success" variant="flat" className="mt-2">
              ✅ Ready
            </Chip>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Grade Manager</h3>
            <p className="text-sm text-gray-600">Manajemen nilai per subject</p>
            <Chip size="sm" color="success" variant="flat" className="mt-2">
              ✅ Ready
            </Chip>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <CalendarCheck className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Attendance Manager</h3>
            <p className="text-sm text-gray-600">Tracking absensi per subject</p>
            <Chip size="sm" color="success" variant="flat" className="mt-2">
              ✅ Ready
            </Chip>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <UserPlus className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold">Enrollment Approvals</h3>
            <p className="text-sm text-gray-600">Workflow persetujuan siswa</p>
            <Chip size="sm" color="success" variant="flat" className="mt-2">
              ✅ Ready
            </Chip>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <h3 className="font-semibold">Teacher Assignment</h3>
            <p className="text-sm text-gray-600">Assign guru ke mata pelajaran</p>
            <Chip size="sm" color="success" variant="flat" className="mt-2">
              ✅ Ready
            </Chip>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="font-semibold">Analytics & Reporting</h3>
            <p className="text-sm text-gray-600">Dashboard analytics lengkap</p>
            <Chip size="sm" color="success" variant="flat" className="mt-2">
              ✅ Ready
            </Chip>
          </CardBody>
        </Card>
      </div>

      {/* Live Dashboard Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Live Demo: Enhanced Admin Dashboard</h2>
        </CardHeader>
        <CardBody>
          <AdminMultiSubjectDashboard />
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboardTest;
