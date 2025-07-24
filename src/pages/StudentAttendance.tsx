// Student Attendance Page - Halaman Absensi Siswa
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Badge, Spinner, Select, SelectItem, Chip, Spacer } from '@heroui/react';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { studentService } from '../services/studentService';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  timeIn?: string;
  reason?: string;
  class?: {
    name: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export const StudentAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('❌ User ID tidak ditemukan');
        return;
      }

      const params = {
        month: parseInt(selectedMonth) + 1, // Convert 0-based index to 1-based month
        year: parseInt(selectedYear),
        subjectId: selectedSubject || undefined
      };

      console.log('🔍 Fetching student attendance:', {
        studentId: user.id,
        params: params,
        apiEndpoint: `/students/${user.id}/attendance`
      });

      // Use real API with month, year, and subject parameters
      const response = await studentService.getStudentAttendance(user.id, params);
      
      console.log('📥 Student attendance API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Attendance data received:', {
          recordsCount: response.data.attendanceData.length,
          summary: response.data.summary,
          firstRecord: response.data.attendanceData[0]
        });

        // Transform backend data to frontend format
        const transformedAttendance = response.data.attendanceData.map((item, index) => ({
          id: `${item.date}-${item.status}-${index}`, // Generate unique ID
          date: item.date,
          status: item.status === 'SICK' || item.status === 'PERMISSION' ? 'EXCUSED' : item.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
          reason: item.notes || undefined,
          subject: item.subject ? {
            id: item.subject.id,
            name: item.subject.name,
            code: item.subject.code
          } : undefined,
          // Add class info if available (fallback to default)
          class: item.subject ? {
            name: `Kelas - ${item.subject.name}`
          } : undefined
        }));
        
        console.log('📊 Transformed attendance data:', transformedAttendance);
        setAttendance(transformedAttendance);
        
        // Set stats from backend response
        const backendSummary = response.data.summary;
        setAttendanceStats({
          total: backendSummary.totalDays,
          present: backendSummary.presentDays,
          absent: backendSummary.absentDays,
          late: backendSummary.lateDays,
          excused: backendSummary.sickDays + backendSummary.permissionDays // Combine sick and permission as excused
        });
        console.log('📈 Attendance stats set:', backendSummary);
      } else {
        console.error('❌ Failed to fetch attendance:', response.error);
        setAttendance([]);
        setAttendanceStats(null);
      }
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
      setAttendanceStats(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedMonth, selectedYear, selectedSubject]);

  const fetchSubjects = useCallback(async () => {
    try {
      setSubjectsLoading(true);
      
      if (!user?.id) {
        console.error('User ID tidak ditemukan');
        return;
      }

      const response = await studentService.getStudentSubjects(user.id);
      
      if (response.success) {
        setSubjects(response.data || []);
        console.log('✅ Subjects loaded successfully:', response.data?.length, 'subjects');
      } else {
        console.error('❌ Failed to fetch subjects:', response.error);
        setSubjects([]);
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const getSubjectColor = (subjectCode: string) => {
    // Generate consistent colors based on subject code
    const colors = [
      { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
      { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
      { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
      { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    ];
    
    // Use simple hash to get consistent color index
    let hash = 0;
    for (let i = 0; i < subjectCode.length; i++) {
      hash = subjectCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    
    return colors[colorIndex];
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'PRESENT': { 
        color: 'success', 
        icon: CheckCircle, 
        text: 'Hadir', 
        bgColor: 'bg-emerald-400/20',
        textColor: 'text-emerald-300',
        chipColor: 'bg-emerald-400 text-emerald-900'
      },
      'LATE': { 
        color: 'warning', 
        icon: Clock, 
        text: 'Terlambat',
        bgColor: 'bg-amber-400/20',
        textColor: 'text-amber-300',
        chipColor: 'bg-amber-400 text-amber-900'
      },
      'ABSENT': { 
        color: 'danger', 
        icon: XCircle, 
        text: 'Tidak Hadir',
        bgColor: 'bg-rose-400/20',
        textColor: 'text-rose-300',
        chipColor: 'bg-rose-400 text-rose-900'
      },
      'SICK': { 
        color: 'secondary', 
        icon: AlertCircle, 
        text: 'Sakit',
        bgColor: 'bg-sky-400/20',
        textColor: 'text-sky-300',
        chipColor: 'bg-sky-400 text-sky-900'
      },
      'PERMISSION': { 
        color: 'primary', 
        icon: AlertCircle, 
        text: 'Izin',
        bgColor: 'bg-violet-400/20',
        textColor: 'text-violet-300',
        chipColor: 'bg-violet-400 text-violet-900'
      }
    };
    return configs[status] || configs['ABSENT'];
  };

  // Group attendance by date
  const groupAttendanceByDate = (records: AttendanceRecord[]) => {
    const grouped = records.reduce((acc, record) => {
      const dateKey = new Date(record.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

    // Sort dates (newest first) and sessions within each date
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, sessions]) => ({
        date: dateKey,
        dateObj: new Date(dateKey),
        sessions: sessions.sort((a, b) => {
          // Sort by time if available, otherwise by ID
          if (a.timeIn && b.timeIn) {
            return a.timeIn.localeCompare(b.timeIn);
          }
          return a.id.localeCompare(b.id);
        })
      }));
  };

  const toggleDateExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };

  // Use stats from backend or calculate from frontend data as fallback
  const stats = attendanceStats ? {
    present: attendanceStats.present,
    late: attendanceStats.late,
    absent: attendanceStats.absent,
    excused: attendanceStats.excused,
  } : {
    present: (attendance || []).filter(a => a.status === 'PRESENT').length,
    late: (attendance || []).filter(a => a.status === 'LATE').length,
    absent: (attendance || []).filter(a => a.status === 'ABSENT').length,
    excused: (attendance || []).filter(a => a.status === 'EXCUSED').length,
  };

  const totalDays = attendanceStats?.total || (attendance || []).length;
  const attendanceRate = attendanceStats?.total 
    ? Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100)
    : totalDays > 0 ? Math.round(((stats.present + stats.late) / totalDays) * 100) : 0;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

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
            <h1 className="text-white font-bold text-xl">Absensi</h1>
            <p className="text-white/60 text-sm">Riwayat kehadiran</p>
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
            <CardBody className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">{attendanceRate}%</p>
                <p className="text-white/60">Tingkat Kehadiran</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <style>{`
                  @media (max-width: 767px) {
                    .attendance-grid {
                      gap: 15px;
                    }
                    .attendance-grid .text-xl {
                      font-size: 1.125rem;
                    }
                  }
                `}</style>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-400">{stats.present}</p>
                  <p className="text-white/60 text-sm">Hadir</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-400">{stats.late}</p>
                  <p className="text-white/60 text-sm">Terlambat</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-400">{stats.absent}</p>
                  <p className="text-white/60 text-sm">Tidak Hadir</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-400">{stats.excused}</p>
                  <p className="text-white/60 text-sm">Sakit/Izin</p>
                </div>
              </div>
              
              {/* Subject-specific info when filtered */}
              {selectedSubject && (() => {
                const selectedSubjectObj = subjects.find(s => s.id === selectedSubject);
                const subjectAttendance = attendance.filter(a => a.subject?.id === selectedSubject);
                
                if (!selectedSubjectObj || subjectAttendance.length === 0) return null;
                
                const presentCount = stats.present;
                const lateCount = stats.late;
                const absentCount = stats.absent;
                const totalCount = subjectAttendance.length;
                const punctualityRate = (presentCount + lateCount) > 0 ? Math.round((presentCount / (presentCount + lateCount)) * 100) : 0;
                const subjectColor = getSubjectColor(selectedSubjectObj.code);
                
                // Recent attendance trend (last 5 sessions)
                const recentSessions = subjectAttendance.slice(-5);
                const recentPresentCount = recentSessions.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
                const trendPercentage = recentSessions.length > 0 ? Math.round((recentPresentCount / recentSessions.length) * 100) : 0;
                
                const getTrendIndicator = (current: number, recent: number) => {
                  const diff = recent - current;
                  if (Math.abs(diff) < 5) return { text: 'Stabil', icon: '➖', color: 'text-blue-400' };
                  if (diff > 0) return { text: 'Meningkat', icon: '📈', color: 'text-green-400' };
                  return { text: 'Menurun', icon: '📉', color: 'text-red-400' };
                };
                
                const trend = getTrendIndicator(attendanceRate, trendPercentage);
                
                return (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-center mb-4">
                      <div className={`w-12 h-12 ${subjectColor.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <Badge 
                          size="sm" 
                          variant="flat"
                          className={`${subjectColor.bg} ${subjectColor.text} ${subjectColor.border} border`}
                        >
                          {selectedSubjectObj.code}
                        </Badge>
                      </div>
                      <p className="text-white font-semibold">
                        {selectedSubjectObj.name}
                      </p>
                      <p className="text-white/60 text-sm">Analisis mendalam mata pelajaran</p>
                    </div>
                    
                    {/* Advanced Subject Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-white/5 rounded-lg p-3">
                        <div className={`text-lg font-bold ${subjectColor.text}`}>
                          {punctualityRate}%
                        </div>
                        <div className="text-white/60 text-xs">Tepat Waktu</div>
                      </div>
                      <div className="text-center bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm">{trend.icon}</span>
                          <div className={`text-lg font-bold ${trend.color}`}>
                            {trendPercentage}%
                          </div>
                        </div>
                        <div className="text-white/60 text-xs">Trend Terbaru</div>
                      </div>
                      <div className="text-center bg-white/5 rounded-lg p-3">
                        <div className="text-lg font-bold text-purple-400">
                          {totalCount}
                        </div>
                        <div className="text-white/60 text-xs">Total Sesi</div>
                      </div>
                    </div>
                    
                    {/* Trend Status */}
                    <div className="mt-3 text-center">
                      <span className={`text-sm font-medium ${trend.color}`}>
                        {trend.icon} {trend.text}
                      </span>
                      <span className="text-white/60 text-xs ml-2">
                        (berdasarkan 5 sesi terakhir)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </CardBody>
          </Card>
        </motion.div>

        {/* Subject Breakdown Stats (when not filtered) */}
        {!selectedSubject && subjects.length > 0 && attendance.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardBody className="p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  Breakdown per Mata Pelajaran
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const subjectStats = subjects.map(subject => {
                      const subjectAttendance = attendance.filter(a => a.subject?.id === subject.id);
                      const presentCount = subjectAttendance.filter(a => a.status === 'PRESENT').length;
                      const lateCount = subjectAttendance.filter(a => a.status === 'LATE').length;
                      const absentCount = subjectAttendance.filter(a => a.status === 'ABSENT').length;
                      const totalCount = subjectAttendance.length;
                      const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;
                      const punctualityRate = (presentCount + lateCount) > 0 ? Math.round((presentCount / (presentCount + lateCount)) * 100) : 0;
                      const subjectColor = getSubjectColor(subject.code);
                      
                      // Performance indicator
                      const getPerformanceLevel = (rate: number) => {
                        if (rate >= 90) return { level: 'Excellent', icon: '🏆', color: 'text-green-400' };
                        if (rate >= 80) return { level: 'Good', icon: '👍', color: 'text-blue-400' };
                        if (rate >= 70) return { level: 'Average', icon: '⚠️', color: 'text-yellow-400' };
                        return { level: 'Needs Improvement', icon: '📈', color: 'text-red-400' };
                      };
                      
                      const performance = getPerformanceLevel(attendanceRate);
                      
                      return {
                        subject,
                        presentCount,
                        lateCount,
                        absentCount,
                        totalCount,
                        attendanceRate,
                        punctualityRate,
                        performance,
                        color: subjectColor
                      };
                    }).filter(stat => stat.totalCount > 0) // Only show subjects with data
                    .sort((a, b) => b.attendanceRate - a.attendanceRate); // Sort by performance
                    
                    return subjectStats.map((stat, index) => (
                      <div key={stat.subject.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <Badge 
                            size="sm" 
                            variant="flat"
                            className={`${stat.color.bg} ${stat.color.text} ${stat.color.border} border`}
                          >
                            {stat.subject.code}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {index === 0 && subjectStats.length > 1 && (
                              <div className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                Top
                              </div>
                            )}
                            <span className="text-lg">{stat.performance.icon}</span>
                          </div>
                        </div>
                        
                        <h4 className="text-white font-medium text-sm mb-2">{stat.subject.name}</h4>
                        
                        {/* Main Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-center">
                            <span className={`text-xl font-bold ${stat.color.text}`}>
                              {stat.attendanceRate}%
                            </span>
                            <p className="text-white/60 text-xs">Kehadiran</p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-blue-400">
                              {stat.punctualityRate}%
                            </span>
                            <p className="text-white/60 text-xs">Tepat Waktu</p>
                          </div>
                        </div>
                        
                        {/* Performance Indicator */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className={`font-medium ${stat.performance.color}`}>
                            {stat.performance.level}
                          </span>
                          <span className="text-white/60">
                            Rank #{index + 1}
                          </span>
                        </div>
                        
                        {/* Detailed Breakdown */}
                        <div className="flex justify-between text-xs text-white/60">
                          <span className="text-green-400">H: {stat.presentCount}</span>
                          <span className="text-yellow-400">T: {stat.lateCount}</span>
                          <span className="text-red-400">A: {stat.absentCount}</span>
                          <span>Total: {stat.totalCount}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Overall Performance Summary */}
                {subjects.length > 0 && attendance.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                        <span className="text-sm">📊</span>
                      </div>
                      Ringkasan Performa
                    </h4>
                    
                    {(() => {
                      const allSubjectsWithData = subjects.filter(subject => 
                        attendance.some(a => a.subject?.id === subject.id)
                      );
                      
                      if (allSubjectsWithData.length === 0) return null;
                      
                      const subjectPerformances = allSubjectsWithData.map(subject => {
                        const subjectAttendance = attendance.filter(a => a.subject?.id === subject.id);
                        const presentCount = subjectAttendance.filter(a => a.status === 'PRESENT').length;
                        const lateCount = subjectAttendance.filter(a => a.status === 'LATE').length;
                        const totalCount = subjectAttendance.length;
                        return totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;
                      });
                      
                      const avgPerformance = Math.round(
                        subjectPerformances.reduce((sum, perf) => sum + perf, 0) / subjectPerformances.length
                      );
                      
                      const bestPerformance = Math.max(...subjectPerformances);
                      const worstPerformance = Math.min(...subjectPerformances);
                      const consistencyScore = Math.round(100 - ((bestPerformance - worstPerformance) / 2));
                      
                      const getConsistencyLevel = (score: number) => {
                        if (score >= 90) return { text: 'Sangat Konsisten', color: 'text-green-400', icon: '🎯' };
                        if (score >= 75) return { text: 'Konsisten', color: 'text-blue-400', icon: '✅' };
                        if (score >= 60) return { text: 'Cukup Konsisten', color: 'text-yellow-400', icon: '⚖️' };
                        return { text: 'Perlu Konsistensi', color: 'text-red-400', icon: '📈' };
                      };
                      
                      const consistency = getConsistencyLevel(consistencyScore);
                      
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-400">{avgPerformance}%</div>
                            <div className="text-white/60 text-xs">Rata-rata</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-400">{bestPerformance}%</div>
                            <div className="text-white/60 text-xs">Terbaik</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-lg font-bold text-red-400">{worstPerformance}%</div>
                            <div className="text-white/60 text-xs">Terrendah</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <span className="text-sm">{consistency.icon}</span>
                              <div className={`text-lg font-bold ${consistency.color}`}>{consistencyScore}%</div>
                            </div>
                            <div className="text-white/60 text-xs">Konsistensi</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Month/Year/Subject Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              {months.map((month, index) => (
                <option key={index} value={index.toString()} className="bg-gray-800">
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="2024" className="bg-gray-800">2024</option>
              <option value="2025" className="bg-gray-800">2025</option>
            </select>
          </div>
          
          {/* Subject Filter */}
          <div className="w-full">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={subjectsLoading}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white disabled:opacity-50"
            >
              <option value="" className="bg-gray-800">
                {subjectsLoading ? 'Loading subjects...' : 'Semua Mata Pelajaran'}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id} className="bg-gray-800">
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Attendance List - Grouped by Date with Expandable Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Grid Layout for Date Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(() => {
              const groupedAttendance = groupAttendanceByDate(attendance);
              
              return groupedAttendance.map((dateGroup, groupIndex) => {
                const dateKey = dateGroup.date;
                const isExpanded = expandedDates.has(dateKey);
                const sessions = dateGroup.sessions;
                
                // Calculate summary statistics for this date
                const presentCount = sessions.filter(s => s.status === 'PRESENT').length;
                const lateCount = sessions.filter(s => s.status === 'LATE').length;
                const absentCount = sessions.filter(s => s.status === 'ABSENT').length;
                const totalSessions = sessions.length;
                
                const formattedDate = dateGroup.dateObj.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                
                const shortDate = dateGroup.dateObj.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short'
                });
                
                return (
                  <motion.div
                    key={dateKey}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * groupIndex }}
                    className="col-span-1"
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <CardBody className="p-0">
                        {/* Compact Header */}
                        <div 
                          className="p-4 cursor-pointer select-none"
                          onClick={() => toggleDateExpansion(dateKey)}
                        >
                          {/* Date Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-base truncate">
                                {shortDate}
                              </div>
                              <div className="text-white/60 text-sm">
                                {totalSessions} sesi
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-white/60" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-white/60" />
                              )}
                            </div>
                          </div>

                          {/* Summary Chips - Compact Layout */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {presentCount > 0 && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium bg-emerald-400 text-emerald-900`}>
                                {presentCount} Hadir
                              </div>
                            )}
                            {lateCount > 0 && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium bg-amber-400 text-amber-900`}>
                                {lateCount} Terlambat
                              </div>
                            )}
                            {absentCount > 0 && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium bg-rose-400 text-rose-900`}>
                                {absentCount} Tidak Hadir
                              </div>
                            )}
                          </div>

                          {/* Expand Hint */}
                          <div className="text-white/40 text-xs text-center">
                            {isExpanded ? 'Klik untuk sembunyikan' : 'Klik untuk lihat detail'}
                          </div>
                        </div>

                        {/* Expandable Content - Session Details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-4">
                              {/* Full Date Display */}
                              <div className="text-white/80 text-sm font-medium mb-4 text-center">
                                {formattedDate}
                              </div>
                              
                              {/* Sessions List */}
                              <div className="space-y-3">
                                {sessions.map((record, sessionIndex) => {
                                  const statusConfig = getStatusConfig(record.status);
                                  const StatusIcon = statusConfig.icon;
                                  const subjectColor = record.subject ? getSubjectColor(record.subject.code) : null;
                                  
                                  // Better handling for missing subject data
                                  const subjectInfo = record.subject ? {
                                    name: record.subject.name,
                                    code: record.subject.code
                                  } : {
                                    name: record.class?.name || 'Kegiatan Sekolah',
                                    code: 'UMUM'
                                  };
                                  
                                  return (
                                    <div
                                      key={record.id}
                                      className="bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 rounded-lg p-3"
                                    >
                                      <div className="flex items-start gap-3">
                                        {/* Status Icon */}
                                        <div className={`w-8 h-8 ${statusConfig.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                                          <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                                        </div>

                                        {/* Session Content */}
                                        <div className="flex-1 min-w-0">
                                          {/* Status & Subject Badge */}
                                          <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.chipColor}`}>
                                              {statusConfig.text}
                                            </div>
                                            {subjectColor ? (
                                              <Badge 
                                                size="sm" 
                                                variant="flat"
                                                className={`${subjectColor.bg} ${subjectColor.text} ${subjectColor.border} border font-medium`}
                                              >
                                                {subjectInfo.code}
                                              </Badge>
                                            ) : (
                                              <Badge size="sm" variant="flat" className="bg-slate-400/20 text-slate-300 border border-slate-400/30">
                                                {subjectInfo.code}
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          {/* Subject Name */}
                                          <h4 className="text-white font-medium text-sm mb-1 truncate">
                                            {subjectInfo.name}
                                          </h4>
                                          
                                          {/* Session Info */}
                                          <div className="text-white/60 text-xs mb-2">
                                            Sesi {sessionIndex + 1}
                                          </div>

                                          {/* Teacher's Note */}
                                          {record.reason && (
                                            <>
                                              <div className="text-white/60 text-xs mb-1">Catatan Guru:</div>
                                              <div className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white/80 text-xs italic">
                                                "{record.reason}"
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              });
            })()}
          </div>
        </motion.div>

        {attendance.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/60">Belum ada data absensi untuk bulan ini</p>
          </div>
        )}
      </div>
    </div>
  );
};
