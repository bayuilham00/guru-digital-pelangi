import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AttendanceStatsProps {
  stats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
  };
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalDays}</h3>
          <p className="text-sm text-gray-600">Total Hari</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.presentDays}</h3>
          <p className="text-sm text-gray-600">Hadir</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.absentDays}</h3>
          <p className="text-sm text-gray-600">Tidak Hadir</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.lateDays}</h3>
          <p className="text-sm text-gray-600">Terlambat</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceStats;
