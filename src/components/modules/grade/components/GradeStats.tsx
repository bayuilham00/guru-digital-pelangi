import React, { useMemo } from 'react';
import { Card, CardBody } from '@heroui/react';
import { BarChart3, TrendingUp, Users, Trophy } from 'lucide-react';
import { GradeRecord, GradeStudent } from '../types/gradeTypes';

interface GradeStatsProps {
  grades: GradeRecord[];
  students: GradeStudent[];
  selectedClass: string;
  selectedGradeType: string;
}

const GradeStats: React.FC<GradeStatsProps> = ({ 
  grades, 
  students, 
  selectedClass, 
  selectedGradeType 
}) => {
  // Calculate stats from the provided data
  const stats = useMemo(() => {
    // Defensive checks
    if (!grades || !Array.isArray(grades) || !students || !Array.isArray(students)) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        passRate: 0
      };
    }

    // Filter grades for the selected class and grade type
    const filteredGrades = grades.filter(grade => 
      grade.classId === selectedClass && 
      grade.gradeType === selectedGradeType
    );

    if (filteredGrades.length === 0) {
      return {
        totalStudents: students.length || 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        passRate: 0
      };
    }

    // Calculate percentages for each grade
    const percentages = filteredGrades.map(grade => {
      const percentage = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0;
      return Math.round(percentage * 10) / 10; // Round to 1 decimal place
    });

    // Calculate statistics
    const totalStudents = students.length || 0;
    const averageGrade = percentages.length > 0 
      ? percentages.reduce((sum, grade) => sum + grade, 0) / percentages.length 
      : 0;
    const highestGrade = percentages.length > 0 ? Math.max(...percentages) : 0;
    const lowestGrade = percentages.length > 0 ? Math.min(...percentages) : 0;
    const passRate = percentages.length > 0 
      ? (percentages.filter(grade => grade >= 70).length / percentages.length) * 100 
      : 0;

    return {
      totalStudents,
      averageGrade: Math.round(averageGrade * 10) / 10,
      highestGrade: Math.round(highestGrade * 10) / 10,
      lowestGrade: Math.round(lowestGrade * 10) / 10,
      passRate: Math.round(passRate * 10) / 10
    };
  }, [grades, students, selectedClass, selectedGradeType]);
  const getGradeColor = (grade: number) => {
    if (!grade || isNaN(grade)) return 'text-gray-600';
    if (grade >= 80) return 'text-green-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Defensive check for stats
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardBody className="p-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">-</h3>
            <p className="text-sm text-gray-600">Data tidak tersedia</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</h3>
          <p className="text-sm text-gray-600">Total Siswa</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className={`text-2xl font-bold ${getGradeColor(stats?.averageGrade || 0)}`}>
            {stats?.averageGrade?.toFixed(1) || '0.0'}
          </h3>
          <p className="text-sm text-gray-600">Rata-rata</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-600">{stats?.highestGrade?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-gray-600">Tertinggi</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-red-600 rotate-180" />
          </div>
          <h3 className="text-2xl font-bold text-red-600">{stats?.lowestGrade?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-gray-600">Terendah</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-orange-600">{stats?.passRate?.toFixed(1) || '0.0'}%</h3>
          <p className="text-sm text-gray-600">Lulus</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default GradeStats;
