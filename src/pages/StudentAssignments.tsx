// Student Assignments Page - Halaman Tugas Siswa
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Badge, Spinner, Chip } from '@heroui/react';
import { ArrowLeft, FileText, Calendar, Clock, CheckCircle2, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { studentService } from '../services/studentService';

interface ApiAssignment {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  type: string;
  points: number;
  subject?: {
    name: string;
  };
  studentSubmission?: {
    id: string;
    status: string;
    score?: number;
    feedback?: string;
    submittedAt: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED';
  type: 'TUGAS_HARIAN' | 'QUIZ' | 'ULANGAN_HARIAN' | 'PTS' | 'PAS' | 'PRAKTIK' | 'PROYEK';
  points: number;
  subject?: {
    name: string;
  };
  submission?: {
    id: string;
    score?: number;
    feedback?: string;
    submittedAt: string;
  };
}

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const { user } = useAuthStore();

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User ID tidak ditemukan');
        return;
      }

      // Call the assignments API that now supports students
      const response = await fetch('http://localhost:5000/api/assignments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.assignments) {
        // Transform API data to match frontend interface
        const transformedAssignments: Assignment[] = data.data.assignments.map((assignment: ApiAssignment) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          deadline: assignment.deadline,
          status: assignment.studentSubmission?.status || 'NOT_SUBMITTED',
          type: assignment.type,
          points: assignment.points,
          subject: assignment.subject,
          submission: assignment.studentSubmission ? {
            id: assignment.studentSubmission.id,
            score: assignment.studentSubmission.score,
            feedback: assignment.studentSubmission.feedback,
            submittedAt: assignment.studentSubmission.submittedAt
          } : undefined
        }));

        setAssignments(transformedAssignments);
      } else {
        console.error('Invalid API response:', data);
        setAssignments([]);
      }
      
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getStatusConfig = (status: string) => {
    const configs = {
      'NOT_SUBMITTED': { 
        color: 'warning', 
        icon: Clock, 
        text: 'Belum Dikumpul',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400'
      },
      'SUBMITTED': { 
        color: 'primary', 
        icon: CheckCircle2, 
        text: 'Sudah Dikumpul',
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400'
      },
      'LATE_SUBMITTED': { 
        color: 'danger', 
        icon: X, 
        text: 'Terlambat',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400'
      },
      'GRADED': { 
        color: 'success', 
        icon: CheckCircle2, 
        text: 'Sudah Dinilai',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400'
      }
    };
    return configs[status as keyof typeof configs] || configs['NOT_SUBMITTED'];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'TUGAS_HARIAN': 'Tugas Harian',
      'QUIZ': 'Quiz',
      'ULANGAN_HARIAN': 'Ulangan Harian',
      'PTS': 'PTS',
      'PAS': 'PAS',
      'PRAKTIK': 'Praktik',
      'PROYEK': 'Proyek'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'pending') return assignment.status === 'NOT_SUBMITTED';
    if (filter === 'submitted') return ['SUBMITTED', 'LATE_SUBMITTED'].includes(assignment.status);
    if (filter === 'graded') return assignment.status === 'GRADED';
    return true;
  });

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <Spinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            isIconOnly
            variant="ghost"
            className="text-white hover:bg-white/10"
            onPress={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Tugas</h1>
            <p className="text-white/60">Kelola dan kumpulkan tugas Anda</p>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {[
            { key: 'all', label: 'Semua', count: assignments.length },
            { key: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'NOT_SUBMITTED').length },
            { key: 'submitted', label: 'Dikumpul', count: assignments.filter(a => ['SUBMITTED', 'LATE_SUBMITTED'].includes(a.status)).length },
            { key: 'graded', label: 'Dinilai', count: assignments.filter(a => a.status === 'GRADED').length }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'solid' : 'ghost'}
              color={filter === tab.key ? 'primary' : 'default'}
              className={filter === tab.key ? '' : 'text-white hover:bg-white/10'}
              onPress={() => setFilter(tab.key as 'all' | 'pending' | 'submitted' | 'graded')}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </motion.div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Tidak ada tugas</h3>
              <p className="text-white/60">Belum ada tugas untuk filter yang dipilih</p>
            </motion.div>
          ) : (
            filteredAssignments.map((assignment, index) => {
              const statusConfig = getStatusConfig(assignment.status);
              const StatusIcon = statusConfig.icon;
              const overdue = isOverdue(assignment.deadline) && assignment.status === 'NOT_SUBMITTED';

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-white/10 backdrop-blur-xl border border-white/20 ${overdue ? 'border-red-500/50' : ''}`}>
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold text-lg">{assignment.title}</h3>
                            {overdue && (
                              <Chip
                                color="danger"
                                variant="flat"
                                size="sm"
                              >
                                Terlambat
                              </Chip>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                            <span>{assignment.subject?.name}</span>
                            <span>•</span>
                            <span>{getTypeLabel(assignment.type)}</span>
                            <span>•</span>
                            <span>{assignment.points} poin</span>
                          </div>

                          {assignment.description && (
                            <p className="text-white/80 mb-4">{assignment.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                              <Calendar className="w-4 h-4" />
                              <span>Deadline: {new Date(assignment.deadline).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>

                          {assignment.submission && (
                            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                              <h4 className="text-white font-medium mb-2">Status Pengumpulan</h4>
                              <div className="space-y-1 text-sm text-white/60">
                                <p>Dikumpul: {new Date(assignment.submission.submittedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</p>
                                {assignment.submission.score && (
                                  <p>Nilai: <span className="text-green-400 font-semibold">{assignment.submission.score}/{assignment.points}</span></p>
                                )}
                                {assignment.submission.feedback && (
                                  <p>Feedback: {assignment.submission.feedback}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <Badge
                            content=""
                            className={`${statusConfig.bgColor} border-0`}
                            classNames={{
                              badge: statusConfig.textColor
                            }}
                          >
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                              <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                                {statusConfig.text}
                              </span>
                            </div>
                          </Badge>

                          {assignment.status === 'NOT_SUBMITTED' && (
                            <Button
                              color="primary"
                              variant="solid"
                              size="sm"
                              startContent={<Upload className="w-4 h-4" />}
                            >
                              Kumpulkan
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
