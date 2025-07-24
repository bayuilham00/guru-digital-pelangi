// Student Dashboard - Mobile First Design
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Progress, Avatar, Badge, Spinner, Chip } from '@heroui/react';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Users, 
  Target,
  RefreshCcw,
  Award,
  ChevronRight,
  Bell,
  Settings,
  Home,
  BarChart3,
  LogOut,
  Crown,
  Medal,
  Sprout
} from 'lucide-react';
import { motion } from 'framer-motion';
// import { studentService } from '../services/studentService';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import ProfilePhotoButton from '../components/common/ProfilePhotoButton';
import { getLevelColor } from '../utils/levelUtils';

// Phase 2 Gamification Components
import StudentGamificationStats from '../components/student/StudentGamificationStats';
import StudentChallengeView from '../components/student/StudentChallengeView';
import StudentGamificationWidget from '../components/student/StudentGamificationWidget';

interface StudentDashboardData {
  profile: {
    id: string;
    fullName: string;
    studentId: string;
    profilePhoto?: string;
    class: {
      name: string;
      academicYear: string;
    };
  };
  xp: {
    totalXp: number;
    currentLevel: number;
    levelName: string;
    nextLevelXp: number;
    progressToNextLevel: number;
  };
  stats: {
    averageGrade: number;
    attendancePercentage: number;
    completedAssignments: number;
    totalAssignments: number;
    classRank: number;
    totalClassmates: number;
  };
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    xpReward: number;
    earnedAt: string;
  }>;
  recentGrades: Array<{
    subject: string;
    score: number;
    date: string;
  }>;
}

interface LeaderboardEntry {
  id: string;
  fullName: string;
  totalXp: number;
  level: number;
  rank: number;
}

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [refreshingLeaderboard, setRefreshingLeaderboard] = useState(false);
  const { user } = useAuthStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && data && !error) {
      // Don't refetch if we already have data and there's no error
      return;
    }

    try {
      setRefreshing(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      let dashboardData: StudentDashboardData;
      
      try {
        // Try to fetch actual student data from API
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`http://localhost:5000/api/students/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('API fetch failed with status:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Gagal mengambil data siswa');
        }

        const student = result.data.student;

        if (!student) {
          throw new Error('Data siswa tidak ditemukan di response API');
        }
        
        // Construct dashboard data from student API response
        dashboardData = {
          profile: {
            id: student.id,
            fullName: student.fullName || 'Nama Siswa',
            studentId: student.studentId || 'NISN-XXXX',
            profilePhoto: student.profilePhoto || undefined, // Don't modify the URL - it's already base64
            class: {
              name: student.class?.name || 'Belum ada kelas',
              academicYear: '2024/2025'
            }
          },
          xp: {
            totalXp: student.studentXp?.totalXp || 0,
            currentLevel: student.studentXp?.level || 1,
            levelName: student.studentXp?.levelName || 'Pemula',
            nextLevelXp: student.studentXp?.nextLevelXp || 100,
            progressToNextLevel: student.studentXp?.progressToNextLevel || 0
          },
          stats: {
            averageGrade: student.stats?.averageGrade || 0,
            attendancePercentage: student.stats?.attendancePercentage || 0,
            completedAssignments: student.stats?.completedAssignments || 0,
            totalAssignments: student.stats?.totalAssignments || 0,
            classRank: student.stats?.classRank || 0,
            totalClassmates: student.stats?.totalClassmates || 0
          },
          badges: student.studentBadges?.map((sb: { badge: { id: string; name: string; icon?: string }; earnedAt: string }) => ({
            id: sb.badge.id,
            name: sb.badge.name,
            icon: sb.badge.icon || '🏆',
            earnedAt: sb.earnedAt
          })) || [],
          achievements: student.achievements || [],
          recentGrades: student.recentGrades || []
        };

        setData(dashboardData);

      } catch (apiError) {
        console.error("API Error:", apiError);
        setError('Gagal terhubung ke server. Menampilkan data offline.');
        // Fallback to local/dummy data if API fails
        const localPhoto = localStorage.getItem(`profile_photo_${user.id}`);
        setData({
          profile: {
            id: user.id,
            fullName: user.fullName || 'Siswa Demo',
            studentId: user.studentId || '1234567890',
            profilePhoto: localPhoto || undefined,
            class: { name: '10A', academicYear: '2024/2025' }
          },
          xp: {
            totalXp: 350,
            currentLevel: 3,
            levelName: 'Cendekiawan',
            nextLevelXp: 500,
            progressToNextLevel: 70
          },
          stats: {
            averageGrade: 88,
            attendancePercentage: 95,
            completedAssignments: 9,
            totalAssignments: 10,
            classRank: 3,
            totalClassmates: 28
          },
          badges: [
            { id: '1', name: 'Rajin Belajar', icon: '📚', earnedAt: '2024-06-15' },
            { id: '2', name: 'Absensi Sempurna', icon: '✅', earnedAt: '2024-06-10' }
          ],
          achievements: [],
          recentGrades: []
        });
      }

    } catch (e) {
      const err = e as Error;
      console.error("Dashboard Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, data, error]);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setRefreshingLeaderboard(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/gamification/leaderboard/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setLeaderboardData(result.data.slice(0, 5)); // Top 5 students
        }
      } else {
        // Fallback data jika API gagal
        setLeaderboardData([
          { id: '1', fullName: 'saha we saah', totalXp: 210, level: 1, rank: 2 },
          { id: '2', fullName: 'juhn doeee', totalXp: 100, level: 1, rank: 1 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Fallback data
      setLeaderboardData([
        { id: '1', fullName: 'saha we saah', totalXp: 210, level: 1, rank: 2 },
        { id: '2', fullName: 'juhn doeee', totalXp: 100, level: 1, rank: 1 }
      ]);
    } finally {
      setRefreshingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchLeaderboardData();
  }, [fetchDashboardData, fetchLeaderboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Spinner 
            size="lg" 
            color="white" 
            variant="wave"
            classNames={{
              wrapper: "w-16 h-16 mb-4"
            }}
          />
          <p className="text-white/80 text-lg">Memuat dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <Button
            color="primary"
            variant="shadow"
            onPress={() => fetchDashboardData()}
            isLoading={refreshing}
            startContent={<RefreshCcw className="w-4 h-4" />}
          >
            Coba Lagi
          </Button>
        </motion.div>
      </div>
    );
  }

  // Defensive rendering - provide defaults for missing data
  const safeData = {
    profile: {
      id: data?.profile?.id || '',
      fullName: data?.profile?.fullName || 'Siswa',
      studentId: data?.profile?.studentId || '...',
      profilePhoto: data?.profile?.profilePhoto || '/placeholder.svg',
      class: {
        name: data?.profile?.class?.name || 'Kelas tidak diketahui',
        academicYear: data?.profile?.class?.academicYear || ''
      }
    },
    xp: {
      totalXp: data?.xp?.totalXp || 0,
      currentLevel: data?.xp?.currentLevel || 1,
      levelName: data?.xp?.levelName || 'Pemula',
      nextLevelXp: data?.xp?.nextLevelXp || 100,
      progressToNextLevel: data?.xp?.progressToNextLevel || 0
    },
    stats: {
      averageGrade: data?.stats?.averageGrade || 0,
      attendancePercentage: data?.stats?.attendancePercentage || 0,
      completedAssignments: data?.stats?.completedAssignments || 0,
      totalAssignments: data?.stats?.totalAssignments || 0,
      classRank: data?.stats?.classRank || 0,
      totalClassmates: data?.stats?.totalClassmates || 0
    },
    badges: data?.badges || [],
    achievements: data?.achievements || [],
    recentGrades: data?.recentGrades || []
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800">
      {/* Mobile Navigation Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Dashboard</h1>
              <p className="text-white/60 text-xs">Selamat datang kembali!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="text-white"
              onPress={() => fetchDashboardData()}
              isLoading={refreshing}
              aria-label="Perbarui data dashboard"
            >
              {refreshing ? (
                <Spinner size="sm" color="white" variant="wave" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="text-white"
              onPress={() => navigate('/student/notifications')}
              aria-label="Lihat notifikasi"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="text-white"
              onPress={async () => {
                await logout();
                navigate('/login');
              }}
              aria-label="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-2 sm:px-4 pb-20 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-0"
        >
          <Card 
            className="bg-gradient-to-r from-[#3a1c71] via-[#d76d77] to-[#ffaf7b] shadow-lg hover:shadow-xl hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 w-full"
            isPressable
            onPress={() => navigate('/student/profile')}
          >
            <CardBody className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-6">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div className="relative">
                    <ProfilePhotoButton
                      studentId={safeData.profile.id}
                      studentName={safeData.profile.fullName}
                      currentPhoto={safeData.profile.profilePhoto}
                      variant="avatar-overlay"
                      size="lg"
                      onPhotoUpdated={() => {
                        // Add small delay to ensure backend has processed the upload
                        setTimeout(() => {
                          fetchDashboardData(true);
                        }, 500);
                      }}
                    />
                    {/* Notification Badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                  </div>
                </div>
                
                {/* Main Info Section */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-1 sm:gap-3 mb-2">
                    <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl truncate">{safeData.profile.fullName}</h2>
                    <span className="text-white/80 text-lg sm:text-xl">✓</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                    <Chip 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold border-0 w-fit mx-auto sm:mx-0"
                      size="sm"
                      aria-label={`Level saat ini: ${safeData.xp.levelName}`}
                    >
                      {safeData.xp.levelName}
                    </Chip>
                    <span className="text-white/60 text-sm sm:text-base">
                      Ranking #{safeData.stats.classRank || "?"} di {safeData.profile.class.name}
                    </span>
                  </div>
                  
                  <p className="text-white/70 text-sm sm:text-base">
                    Pemula yang semangat, gas terus! 🌟
                  </p>
                </div>
                
                {/* Stat Cards Section */}
                <div className="flex gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
                  {/* XP Card */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center min-w-[70px] sm:min-w-[85px] border border-white/20 hover:bg-black/40 transition-all duration-300">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-base sm:text-lg drop-shadow-lg">{safeData.xp.totalXp}</p>
                    <p className="text-yellow-200 text-xs sm:text-sm font-medium">Total XP</p>
                  </div>
                  
                  {/* Trophy Card */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center min-w-[70px] sm:min-w-[85px] border border-white/20 hover:bg-black/40 transition-all duration-300">
                    <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-base sm:text-lg drop-shadow-lg">{safeData.badges.length}</p>
                    <p className="text-yellow-200 text-xs sm:text-sm font-medium">Trofi</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Progress & Achievement + Hall of Fame Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Progress & Achievement Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-[#ffd700]" />
              <h3 className="text-[#ffd700] font-bold text-base sm:text-lg uppercase">Progress & Achievement</h3>
            </div>
            
            {/* XP and Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Total Experience Card */}
              <Card className="bg-[#3d206b] border-0 shadow-[0_4px_24px_rgba(0,0,0,0.16)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:scale-[1.02] transition-all duration-300">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Crown className="w-6 h-6 text-[#ffd700]" />
                  </div>
                  <div>
                    <h4 className="text-[#ffd700] font-bold text-sm sm:text-base mb-1">Total Experience</h4>
                    <p className="text-[#e0e0e0] text-xs sm:text-sm mb-3">XP yang sudah dikumpulkan</p>
                    <p className="text-[#ffd700] font-bold text-2xl sm:text-3xl">{safeData.xp.totalXp}</p>
                    <p className="text-[#ffd700] text-sm font-medium">Poin XP</p>
                  </div>
                </CardBody>
              </Card>

              {/* Current Level Card */}
              <Card className="bg-[#3d206b] border-0 shadow-[0_4px_24px_rgba(0,0,0,0.16)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:scale-[1.02] transition-all duration-300">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Sprout className="w-6 h-6 text-[#ffd700]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base mb-1">Level Sekarang</h4>
                    <p className="text-[#e0e0e0] text-xs sm:text-sm mb-3">{safeData.xp.levelName}</p>
                    <p className="text-white font-bold text-2xl sm:text-3xl">{safeData.xp.currentLevel}</p>
                    <p className="text-[#e0e0e0] text-sm">Level</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <h5 className="text-white font-medium text-sm mb-2">Progress ke Level Selanjutnya</h5>
              <div className="bg-[#2c1452] rounded-lg h-3 overflow-hidden">
                <div 
                  className="bg-[#ffd700] h-full rounded-lg transition-all duration-500"
                  style={{ width: `${safeData.xp.progressToNextLevel}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#e0e0e0] text-xs">{safeData.xp.progressToNextLevel}% selesai</span>
                <span className="text-[#ffd700] text-xs font-medium">{safeData.xp.nextLevelXp} XP</span>
              </div>
            </div>
          </div>

          {/* Hall of Fame Panel */}
          <div className="space-y-4">
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-[#ffd700]" />
              <h3 className="text-[#ffd700] font-bold text-base sm:text-lg">Hall of Fame</h3>
              <Crown className="w-4 h-4 text-[#ffd700]" />
            </div>

            {/* Leaderboard Card */}
            <Card className="bg-[#3d206b] border-0 shadow-[0_4px_24px_rgba(0,0,0,0.16)]">
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-3">
                  {leaderboardData.map((student, index) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-[#2c1452] rounded-lg">
                      <Medal className={`w-6 h-6 ${index === 0 ? 'text-[#ffd700]' : 'text-[#e0e0e0]'}`} />
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{student.fullName}</p>
                        <p className="text-[#e0e0e0] text-xs">{student.totalXp} XP • Lv.{student.level}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-[#ffd700]" />
                        <span className="text-[#ffd700] text-sm font-bold">{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refresh Button */}
                <Button 
                  className="w-full mt-4 bg-white text-[#3d206b] font-medium hover:bg-gray-100"
                  startContent={<RefreshCcw className="w-4 h-4" />}
                  onPress={() => fetchLeaderboardData()}
                  isLoading={refreshingLeaderboard}
                >
                  Refresh Data
                </Button>
              </CardBody>
            </Card>
          </div>
        </motion.div>

        {/* Enhanced Challenges Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#ffd700]" />
            <h3 className="text-[#ffd700] font-bold text-base sm:text-lg uppercase">Challenge & Misi</h3>
          </div>
          
          <div className="bg-[#3d206b] rounded-lg p-4 sm:p-6 border-0 shadow-[0_4px_24px_rgba(0,0,0,0.16)]">
            <StudentChallengeView 
              showOnlyMyChallenges={true}
              compact={true}
              maxItems={3}
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
        >
          {/* Average Grade */}
          <Card 
            className="bg-white/5 backdrop-blur-xl border border-blue-500/20 cursor-pointer hover:bg-white/10 transition-colors"
            isPressable
            onPress={() => navigate('/student/grades')}
          >
            <CardBody className="p-2 sm:p-3 md:p-4 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 md:mb-3">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-blue-400" />
              </div>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-white">{safeData.stats.averageGrade}</p>
              <p className="text-white/60 text-[10px] sm:text-xs md:text-sm">Rata-rata Nilai</p>
            </CardBody>
          </Card>

          {/* Attendance */}
          <Card 
            className="bg-white/5 backdrop-blur-xl border border-green-500/20 cursor-pointer hover:bg-white/10 transition-colors"
            isPressable
            onPress={() => navigate('/student/attendance')}
          >
            <CardBody className="p-2 sm:p-3 md:p-4 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 md:mb-3">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-green-400" />
              </div>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-white">{safeData.stats.attendancePercentage}%</p>
              <p className="text-white/60 text-[10px] sm:text-xs md:text-sm">Kehadiran</p>
            </CardBody>
          </Card>

          {/* Assignments */}
          <Card 
            className="bg-white/5 backdrop-blur-xl border border-purple-500/20 cursor-pointer hover:bg-white/10 transition-colors"
            isPressable
            onPress={() => navigate('/student/assignments')}
          >
            <CardBody className="p-2 sm:p-3 md:p-4 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 md:mb-3">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-purple-400" />
              </div>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-white">
                {safeData.stats.completedAssignments}/{safeData.stats.totalAssignments}
              </p>
              <p className="text-white/60 text-[10px] sm:text-xs md:text-sm">Tugas Selesai</p>
            </CardBody>
          </Card>

          {/* Class Rank */}
          <Card 
            className="bg-white/5 backdrop-blur-xl border border-orange-500/20 cursor-pointer hover:bg-white/10 transition-colors"
            isPressable
            onPress={() => navigate('/student/classmates')}
          >
            <CardBody className="p-2 sm:p-3 md:p-4 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 md:mb-3">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-orange-400" />
              </div>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-white">#{safeData.stats.classRank || "?"}</p>
              <p className="text-white/60 text-[10px] sm:text-xs md:text-sm">Ranking Kelas</p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden sm:block"
        >
          <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              className="h-12 sm:h-16 bg-blue-500 hover:bg-blue-600 text-white font-medium sm:font-semibold text-xs sm:text-sm"
              startContent={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              onPress={() => navigate('/student/grades')}
            >
              Lihat Nilai
            </Button>
            
            <Button
              className="h-12 sm:h-16 bg-green-500 hover:bg-green-600 text-white font-medium sm:font-semibold text-xs sm:text-sm"
              startContent={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              onPress={() => navigate('/student/attendance')}
            >
              Absensi
            </Button>
            
            <Button
              className="h-12 sm:h-16 bg-purple-500 hover:bg-purple-600 text-white font-medium sm:font-semibold text-xs sm:text-sm"
              startContent={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              onPress={() => navigate('/student/classmates')}
            >
              Teman Kelas
            </Button>
            
            <Button
              className="h-12 sm:h-16 bg-orange-500 hover:bg-orange-600 text-white font-medium sm:font-semibold text-xs sm:text-sm"
              startContent={<Award className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              onPress={() => navigate('/student/achievements')}
            >
              Pencapaian
            </Button>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Pencapaian Terbaru</h3>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardBody className="p-3 sm:p-4">
              {safeData.achievements.length > 0 ? (
                safeData.achievements.slice(0, 3).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-white/10 last:border-b-0"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs sm:text-sm truncate">{achievement.title}</p>
                      <p className="text-white/60 text-[10px] sm:text-xs truncate">{achievement.description}</p>
                    </div>
                    <Badge color="warning" variant="flat" size="sm" className="flex-shrink-0">
                      +{achievement.xpReward} XP
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/60 text-center py-3 sm:py-4 text-xs sm:text-sm">Belum ada pencapaian</p>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10 md:hidden"
      >
        <div className="flex items-center justify-around py-3 px-4">
          <Button
            isIconOnly
            variant="ghost"
            className="text-white data-[hover=true]:bg-white/10"
            onPress={() => navigate('/student/dashboard')}
            aria-label="Dashboard"
          >
            <Home className="w-5 h-5" />
          </Button>
          
          <Button
            isIconOnly
            variant="ghost"
            className="text-white/60 data-[hover=true]:bg-white/10"
            onPress={() => navigate('/student/grades')}
            aria-label="Nilai"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
          
          <Button
            isIconOnly
            variant="ghost"
            className="text-white/60 data-[hover=true]:bg-white/10"
            onPress={() => navigate('/student/attendance')}
            aria-label="Absensi"
          >
            <Calendar className="w-5 h-5" />
          </Button>
          
          <Button
            isIconOnly
            variant="ghost"
            className="text-white/60 data-[hover=true]:bg-white/10"
            onPress={() => navigate('/student/achievements')}
            aria-label="Pencapaian"
          >
            <Trophy className="w-5 h-5" />
          </Button>
          
          <Button
            isIconOnly
            variant="ghost"
            className="text-white/60 data-[hover=true]:bg-white/10"
            onPress={() => navigate('/student/settings')}
            aria-label="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
