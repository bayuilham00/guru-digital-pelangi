// Student Grades Page - Halaman Nilai Siswa
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Badge, Spinner } from '@heroui/react';
import { ArrowLeft, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { studentService } from '../services/studentService';
import { Grade } from '../services/types';

export const StudentGrades: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const { user } = useAuthStore();

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User ID tidak ditemukan');
        return;
      }

      // Use real API
      const response = await studentService.getStudentGrades(user.id);
      
      if (response.success) {
        setGrades(response.data);
      } else {
        console.error('Failed to fetch grades:', response.error);
        // Fallback to empty array if API fails
        setGrades([]);
      }
      
    } catch (error) {
      console.error('Error fetching grades:', error);
      // Fallback to empty array if API fails
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-blue-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGradeType = (type: string) => {
    const types = {
      'Ulangan Harian': { color: 'primary', icon: '📝' },
      'Quiz': { color: 'secondary', icon: '⚡' },
      'Tugas Harian': { color: 'success', icon: '📚' },
      'Praktikum': { color: 'warning', icon: '🔬' },
      'UTS': { color: 'danger', icon: '📋' },
      'UAS': { color: 'danger', icon: '📊' }
    };
    return types[type] || { color: 'default', icon: '📄' };
  };

  const subjects = ['all', ...Array.from(new Set(grades.map(g => g.subject.name)))];
  const filteredGrades = selectedSubject === 'all' 
    ? grades 
    : grades.filter(g => g.subject.name === selectedSubject);

  const averageScore = grades.length > 0 
    ? Math.round((grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0) / grades.length) * 10) / 10
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <Spinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10"
      >
        <div className="flex items-center gap-3 p-4">
          <Button
            isIconOnly
            variant="ghost"
            className="text-white"
            onPress={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-white font-bold text-xl">Nilai</h1>
            <p className="text-white/60 text-sm">Daftar nilai pelajaran</p>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* Stats Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardBody className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
                <style>{`
                  @media (max-width: 767px) {
                    .grades-stats {
                      gap: 15px;
                    }
                    .grades-stats .text-2xl {
                      font-size: 1.25rem;
                    }
                  }
                `}</style>
                <div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{averageScore}</p>
                  <p className="text-white/60 text-sm">Rata-rata</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{grades.length}</p>
                  <p className="text-white/60 text-sm">Total Nilai</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{subjects.length - 1}</p>
                  <p className="text-white/60 text-sm">Mata Pelajaran</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Subject Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {subjects.map((subject) => (
            <Button
              key={subject}
              size="sm"
              variant={selectedSubject === subject ? "solid" : "ghost"}
              color="primary"
              className={`flex-shrink-0 ${selectedSubject === subject ? 'text-white' : 'text-white/70'}`}
              onPress={() => setSelectedSubject(subject)}
            >
              {subject === 'all' ? 'Semua' : subject}
            </Button>
          ))}
        </motion.div>

        {/* Grades List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredGrades.map((grade, index) => {
            const gradeType = getGradeType(grade.gradeType);
            const percentage = Math.round((grade.score / grade.maxScore) * 100);
            
            return (
              <motion.div
                key={grade.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{gradeType.icon}</span>
                          <h3 className="text-white font-semibold">{grade.subject.name}</h3>
                          <Badge 
                            size="sm" 
                            color={gradeType.color}
                            variant="flat"
                          >
                            {grade.gradeType}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm mb-1">{grade.description}</p>
                        <p className="text-white/40 text-xs">{new Date(grade.date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(grade.score, grade.maxScore)}`}>
                          {grade.score}
                        </p>
                        <p className="text-white/60 text-sm">/ {grade.maxScore}</p>
                        <p className="text-white/40 text-xs">{percentage}%</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredGrades.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/60">Belum ada nilai untuk mata pelajaran ini</p>
          </div>
        )}
      </div>
    </div>
  );
};
