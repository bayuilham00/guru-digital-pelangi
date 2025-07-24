import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface GradeRecapProps {
  grades?: Array<{
    id: string;
    subject: string;
    score: number;
    date: string;
    category: string;
  }>;
  stats?: {
    average: number;
    highest: number;
    lowest: number;
    totalGrades: number;
  };
}

const GradeRecap: React.FC<GradeRecapProps> = ({ grades = [], stats }) => {
  const defaultStats = {
    average: stats?.average || 0,
    highest: stats?.highest || 0,
    lowest: stats?.lowest || 0,
    totalGrades: stats?.totalGrades || grades.length
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Rekap Nilai</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{defaultStats.average.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Rata-rata</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{defaultStats.highest}</span>
              </div>
              <div className="text-sm text-gray-600">Tertinggi</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">{defaultStats.lowest}</span>
              </div>
              <div className="text-sm text-gray-600">Terendah</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{defaultStats.totalGrades}</div>
              <div className="text-sm text-gray-600">Total Nilai</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {grades.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold">Nilai Terbaru</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {grades.slice(0, 5).map((grade) => (
                <div key={grade.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium">{grade.subject}</div>
                    <div className="text-sm text-gray-600">{grade.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{grade.score}</div>
                    <div className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default GradeRecap;
