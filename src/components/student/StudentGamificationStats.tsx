import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Avatar,
  Button,
  Divider,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  SparklesIcon,
  ArrowUpIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { gamificationService } from '../../services/gamificationService';
import type { StudentXp } from '../../services/types';

interface LeaderboardStudent {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
  totalXp: number;
  level: number;
  levelName: string;
  badgeCount: number;
  rank: number;
}

interface StudentGamificationStatsProps {
  compact?: boolean;
  showLeaderboard?: boolean;
}

const StudentGamificationStats: React.FC<StudentGamificationStatsProps> = ({ 
  compact = false,
  showLeaderboard = true 
}) => {
  const { user } = useAuthStore();
  const [studentXp, setStudentXp] = useState<StudentXp | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Load student XP data
  const loadStudentXp = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔍 Loading student XP for:', user.id);
      const response = await gamificationService.getStudentXp(user.id);
      
      if (response.success) {
        setStudentXp(response.data);
        console.log('✅ Student XP loaded:', response.data);
      } else {
        console.error('Failed to load student XP:', response.error);
      }
    } catch (error) {
      console.error('Error loading student XP:', error);
    }
  }, [user?.id]);

  // Load leaderboard data
  const loadLeaderboard = useCallback(async () => {
    try {
      console.log('🏆 Loading leaderboard...');
      const response = await gamificationService.getAllStudentsLeaderboard({ limit: 50 });
      
      if (response.success) {
        setLeaderboard(response.data);
        
        // Find current user's rank
        const currentUserRank = response.data.find(
          (student: LeaderboardStudent) => student.id === user?.id
        );
        
        if (currentUserRank) {
          setMyRank(currentUserRank.rank);
        }
        
        console.log('✅ Leaderboard loaded with', response.data.length, 'students');
      } else {
        console.error('Failed to load leaderboard:', response.error);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }, [user?.id]);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadStudentXp(),
      showLeaderboard ? loadLeaderboard() : Promise.resolve()
    ]);
    setLoading(false);
  }, [loadStudentXp, loadLeaderboard, showLeaderboard]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  // Calculate progress to next level (simple calculation)
  const getNextLevelProgress = () => {
    if (!studentXp) return { current: 0, required: 100, percentage: 0 };
    
    const currentLevel = studentXp.level;
    const currentXp = studentXp.totalXp;
    
    // Simple level calculation: every 100 XP = 1 level
    const currentLevelBaseXp = (currentLevel - 1) * 100;
    const nextLevelRequiredXp = currentLevel * 100;
    const progressXp = currentXp - currentLevelBaseXp;
    const requiredXp = nextLevelRequiredXp - currentLevelBaseXp;
    
    const percentage = Math.min((progressXp / requiredXp) * 100, 100);
    
    return {
      current: progressXp,
      required: requiredXp,
      percentage: Math.round(percentage),
      nextLevelXp: nextLevelRequiredXp
    };
  };

  // Get level color
  const getLevelColor = (level: number) => {
    if (level >= 8) return 'danger'; // Mythic+
    if (level >= 6) return 'warning'; // Grandmaster+
    if (level >= 4) return 'secondary'; // Ahli+
    if (level >= 2) return 'primary'; // Berkembang+
    return 'default'; // Pemula
  };

  // Get level color gradient for new chip styling
  const getLevelColorGradient = (level: number) => {
    if (level >= 8) return 'from-red-500 to-pink-600'; // Mythic+
    if (level >= 6) return 'from-yellow-500 to-orange-600'; // Grandmaster+
    if (level >= 4) return 'from-purple-500 to-indigo-600'; // Ahli+
    if (level >= 2) return 'from-blue-500 to-cyan-600'; // Berkembang+
    return 'from-gray-500 to-gray-600'; // Pemula
  };

  // Get rank color
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'warning'; // Gold
    if (rank <= 3) return 'default'; // Silver/Bronze
    if (rank <= 10) return 'primary'; // Top 10
    return 'default';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-6 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!studentXp) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Data gamifikasi belum tersedia</p>
        </CardBody>
      </Card>
    );
  }

  const nextLevelData = getNextLevelProgress();

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                icon={<SparklesIcon className="w-6 h-6" />}
                color={getLevelColor(studentXp.level)}
                size="sm"
              />
              <div>
                <p className="font-semibold text-sm">{studentXp.levelName}</p>
                <p className="text-xs text-gray-600">{studentXp.totalXp} XP</p>
              </div>
            </div>
            <div className="text-right">
              <Chip
                classNames={{
                  base: `bg-gradient-to-br ${getLevelColorGradient(studentXp.level)} border-small border-white/50 shadow-lg`,
                  content: "drop-shadow shadow-black text-white font-bold",
                }}
                variant="shadow"
                size="sm"
              >
                Level {studentXp.level}
              </Chip>
              {myRank && (
                <p className="text-xs text-gray-600 mt-1">
                  Rank #{myRank}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Stats Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-3">
              <Avatar
                icon={<SparklesIcon className="w-8 h-8" />}
                color={getLevelColor(studentXp.level)}
                size="lg"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {studentXp.student.fullName}
                </h2>
                <p className="text-sm text-gray-600">
                  {studentXp.student?.fullName || 'Data siswa belum tersedia'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Level and XP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Chip
                  classNames={{
                    base: `bg-gradient-to-br ${getLevelColorGradient(studentXp.level)} border-small border-white/50 shadow-lg`,
                    content: "drop-shadow shadow-black text-white font-bold",
                  }}
                  variant="shadow"
                  size="lg"
                  className="mb-2"
                >
                  Level {studentXp.level}
                </Chip>
                <p className="text-sm font-medium">{studentXp.levelName}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <TrophyIcon className="w-5 h-5 text-warning-500" />
                  <span className="text-2xl font-bold text-warning-600">
                    {studentXp.totalXp}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total XP</p>
              </div>
            </div>

            <Divider />

            {/* Progress to Next Level */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress ke Level {studentXp.level + 1}</span>
                <span className="text-sm text-gray-600">
                  {nextLevelData.current}/{nextLevelData.required} XP
                </span>
              </div>
              <Progress 
                value={nextLevelData.percentage} 
                color={getLevelColor(studentXp.level + 1)}
                size="md"
                className="mb-2"
              />
              <p className="text-xs text-gray-500 text-center">
                {nextLevelData.required - nextLevelData.current} XP lagi untuk naik level
              </p>
            </div>

            {/* Ranking and Leaderboard */}
            {showLeaderboard && myRank && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium">Peringkat Saya</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Chip 
                      color={getRankColor(myRank)}
                      variant="flat"
                      size="sm"
                    >
                      #{myRank}
                    </Chip>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onClick={() => setLeaderboardModalOpen(true)}
                    >
                      Lihat Leaderboard
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Streaks (if available) */}
            {(studentXp.attendanceStreak || studentXp.assignmentStreak) && (
              <>
                <Divider />
                <div className="grid grid-cols-2 gap-4">
                  {studentXp.attendanceStreak && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <ArrowUpIcon className="w-4 h-4 text-success-500" />
                        <span className="text-lg font-bold text-success-600">
                          {studentXp.attendanceStreak}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Hari Hadir Berturut</p>
                    </div>
                  )}
                  {studentXp.assignmentStreak && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <ArrowUpIcon className="w-4 h-4 text-primary-500" />
                        <span className="text-lg font-bold text-primary-600">
                          {studentXp.assignmentStreak}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Tugas Berturut</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Leaderboard Modal */}
      <Modal 
        isOpen={leaderboardModalOpen} 
        onClose={() => setLeaderboardModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">🏆 Leaderboard Global</h2>
            <p className="text-sm text-gray-600">Peringkat semua siswa berdasarkan XP</p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              {leaderboard.map((student, index) => {
                const isCurrentUser = student.id === user?.id;
                const rankColor = getRankColor(student.rank);
                
                return (
                  <Card 
                    key={student.id}
                    className={`${isCurrentUser ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Chip 
                            color={rankColor}
                            variant={student.rank <= 3 ? 'solid' : 'flat'}
                            size="sm"
                            className="min-w-[40px]"
                          >
                            #{student.rank}
                          </Chip>
                          <div>
                            <p className={`font-medium ${isCurrentUser ? 'text-primary-700' : 'text-gray-800'}`}>
                              {student.fullName}
                              {isCurrentUser && (
                                <span className="text-xs text-primary-600 ml-2">(Saya)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-600">{student.className}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <TrophyIcon className="w-4 h-4 text-warning-500" />
                            <span className="font-bold text-warning-600">
                              {student.totalXp}
                            </span>
                          </div>
                          <Chip 
                            color={getLevelColor(student.level)}
                            variant="flat"
                            size="sm"
                          >
                            {student.levelName}
                          </Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              variant="light" 
              onPress={() => setLeaderboardModalOpen(false)}
            >
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StudentGamificationStats;
