// Student Dashboard Component for Guru Digital Pelangi
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
  Avatar,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Award, 
  Target,
  BookOpen,
  Zap,
  Flame,
  Calendar,
  BarChart3
} from 'lucide-react';
import { gamificationService, gradeService } from '../../../services/expressApi';
import { getLevelColor } from '../../../utils/levelUtils';

interface StudentXp {
  id: string;
  studentId: string;
  totalXp: number;
  level: number;
  levelName: string;
  attendanceStreak: number;
  assignmentStreak: number;
  lastAttendance?: string;
  lastAssignment?: string;
  updatedAt: string;
}

interface Achievement {
  id: string;
  studentId: string;
  type: string;
  title: string;
  description?: string;
  xpReward: number;
  earnedAt: string;
  metadata?: any;
}

interface Grade {
  id: string;
  gradeType: string;
  score: number;
  maxScore: number;
  description?: string;
  date: string;
  subject?: {
    name: string;
  };
}

const StudentDashboard = ({ studentId }: { studentId: string }) => {
  const [studentXp, setStudentXp] = useState<StudentXp | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    setIsLoading(true);
    
    // Load student XP
    const xpResponse = await gamificationService.getStudentXp(studentId);
    if (xpResponse.success && xpResponse.data) {
      setStudentXp(xpResponse.data);
    }

    // Load achievements
    const achievementsResponse = await gamificationService.getStudentAchievements(studentId);
    if (achievementsResponse.success && achievementsResponse.data) {
      setAchievements(achievementsResponse.data);
    }

    // Load recent grades
    const gradesResponse = await gradeService.getGrades({ 
      studentId, 
      limit: 10 
    });
    if (gradesResponse.success && gradesResponse.data) {
      setRecentGrades(gradesResponse.data);
    }

    setIsLoading(false);
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  const getGradeTypeText = (type: string) => {
    const types: Record<string, string> = {
      'TUGAS_HARIAN': 'Tugas Harian',
      'QUIZ': 'Quiz',
      'ULANGAN_HARIAN': 'Ulangan Harian',
      'PTS': 'PTS',
      'PAS': 'PAS',
      'PRAKTIK': 'Praktik',
      'SIKAP': 'Sikap',
      'KETERAMPILAN': 'Keterampilan'
    };
    return types[type] || type;
  };

  const getNextLevelXp = () => {
    // Default level thresholds
    const thresholds = [
      { level: 1, name: 'Pemula', xp: 0 },
      { level: 2, name: 'Pelajar', xp: 100 },
      { level: 3, name: 'Rajin', xp: 250 },
      { level: 4, name: 'Berprestasi', xp: 500 },
      { level: 5, name: 'Juara', xp: 1000 },
      { level: 6, name: 'Master', xp: 2000 },
      { level: 7, name: 'Legend', xp: 5000 }
    ];

    if (!studentXp) return null;

    const nextLevel = thresholds.find(t => t.level > studentXp.level);
    if (!nextLevel) return null;

    return {
      nextLevel: nextLevel.level,
      nextLevelName: nextLevel.name,
      nextLevelXp: nextLevel.xp,
      progress: ((studentXp.totalXp - thresholds[studentXp.level - 1].xp) / 
                (nextLevel.xp - thresholds[studentXp.level - 1].xp)) * 100
    };
  };

  const nextLevelInfo = getNextLevelXp();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  name={studentXp?.studentId || 'S'}
                  size="lg"
                  color={getLevelColor(studentXp?.level || 1)}
                />
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Siswa</h1>
                  <p className="text-gray-600">Pantau progress dan pencapaian kamu</p>
                </div>
              </div>
              <div className="text-right">
                <Chip
                  color={getLevelColor(studentXp?.levelName || 'Pemula')}
                  variant="flat"
                  size="lg"
                  startContent={<Star className="w-4 h-4" />}
                  aria-label={`Level saat ini: ${studentXp?.level} - ${studentXp?.levelName}`}
                >
                  Level {studentXp?.level} - {studentXp?.levelName}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* XP and Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total XP */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total XP</p>
                <p className="text-2xl font-bold text-blue-800">{studentXp?.totalXp.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Current Level */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Level Saat Ini</p>
                <p className="text-2xl font-bold text-purple-800">{studentXp?.level}</p>
                <Chip 
                  color={getLevelColor(studentXp?.levelName || 'Pemula')}
                  variant="flat"
                  size="sm"
                  className="font-semibold"
                  aria-label={`Level saat ini: ${studentXp?.levelName}`}
                >
                  {studentXp?.levelName}
                </Chip>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Attendance Streak */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Streak Kehadiran</p>
                <p className="text-2xl font-bold text-orange-800">{studentXp?.attendanceStreak}</p>
                <p className="text-xs text-orange-600">hari berturut-turut</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Assignment Streak */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Streak Tugas</p>
                <p className="text-2xl font-bold text-green-800">{studentXp?.assignmentStreak}</p>
                <p className="text-xs text-green-600">tugas berturut-turut</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Level Progress */}
      {nextLevelInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Progress ke Level Berikutnya</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Level {studentXp?.level}</span>
                    <Chip 
                      color={getLevelColor(studentXp?.levelName || 'Pemula')}
                      variant="flat"
                      size="sm"
                      aria-label={`Level saat ini: ${studentXp?.levelName}`}
                    >
                      {studentXp?.levelName}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Level {nextLevelInfo.nextLevel}</span>
                    <Chip 
                      color={getLevelColor(nextLevelInfo.nextLevelName)}
                      variant="flat"
                      size="sm"
                      aria-label={`Level selanjutnya: ${nextLevelInfo.nextLevelName}`}
                    >
                      {nextLevelInfo.nextLevelName}
                    </Chip>
                  </div>
                </div>
                <Progress
                  value={nextLevelInfo.progress}
                  color="primary"
                  size="lg"
                  showValueLabel
                />
                <div className="text-center text-sm text-gray-600">
                  {nextLevelInfo.nextLevelXp - (studentXp?.totalXp || 0)} XP lagi untuk naik level!
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Recent Achievements and Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Pencapaian Terbaru
              </h3>
            </CardHeader>
            <CardBody>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.slice(0, 5).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <Chip color="warning" variant="flat" size="sm">
                        +{achievement.xpReward} XP
                      </Chip>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada pencapaian</p>
                  <p className="text-sm">Terus belajar untuk mendapatkan pencapaian!</p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Nilai Terbaru
              </h3>
            </CardHeader>
            <CardBody>
              {recentGrades.length > 0 ? (
                <Table aria-label="Recent grades table" removeWrapper>
                  <TableHeader>
                    <TableColumn>MATA PELAJARAN</TableColumn>
                    <TableColumn>JENIS</TableColumn>
                    <TableColumn>NILAI</TableColumn>
                    <TableColumn>TANGGAL</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {recentGrades.slice(0, 5).map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {grade.subject?.name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {getGradeTypeText(grade.gradeType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getScoreColor(grade.score, grade.maxScore)}
                            variant="flat"
                            size="sm"
                            aria-label={`Nilai: ${grade.score} dari ${grade.maxScore}`}
                          >
                            {grade.score}/{grade.maxScore}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600">
                            {new Date(grade.date).toLocaleDateString('id-ID')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada nilai</p>
                  <p className="text-sm">Nilai akan muncul setelah guru menginput</p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
