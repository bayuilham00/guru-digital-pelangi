// Student Classmates Page - Halaman Teman Kelas
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Badge, Spinner, Avatar, Input } from '@heroui/react';
import { ArrowLeft, Search, Users, Trophy, Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { studentService } from '../services/studentService';
import { Classmate } from '../services/types';

export const StudentClassmates: React.FC = () => {
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rank' | 'xp'>('rank');
  const { user } = useAuthStore();

  const fetchClassmates = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User ID tidak ditemukan');
        return;
      }

      // Use real API
      const response = await studentService.getClassmates(user.id);
      
      if (response.success) {
        setClassmates(response.data);
      } else {
        console.error('Failed to fetch classmates:', response.error);
        setClassmates([]);
      }
      
    } catch (error) {
      console.error('Error fetching classmates:', error);
      setClassmates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchClassmates();
  }, [fetchClassmates]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-white/60';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getLevelColor = (level: number) => {
    if (level >= 4) return 'text-purple-400';
    if (level >= 3) return 'text-blue-400';
    if (level >= 2) return 'text-green-400';
    return 'text-gray-400';
  };

  // Filter and sort classmates
  const filteredAndSortedClassmates = classmates
    .filter(classmate => 
      classmate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classmate.studentId.includes(searchQuery)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'xp':
          return b.totalXp - a.totalXp;
        case 'rank':
        default:
          return a.rank - b.rank;
      }
    });

  const currentUser = classmates.find(c => c.id === user?.id);

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
          <p className="text-white/80 text-lg">Memuat teman kelas...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            isIconOnly
            variant="light"
            className="text-white"
            onPress={() => window.history.back()}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-white font-bold text-2xl">Teman Kelas</h1>
            <p className="text-white/60 text-sm">Lihat ranking dan informasi teman sekelas</p>
          </div>
        </motion.div>

        {/* Stats Summary */}
        {currentUser && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={currentUser.profilePhoto || '/placeholder.svg'}
                    className="w-16 h-16"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{currentUser.fullName}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${getRankColor(currentUser.rank)}`} />
                        <span className="text-white/80 text-sm">
                          Peringkat {getRankIcon(currentUser.rank)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${getLevelColor(currentUser.level)}`} />
                        <span className="text-white/80 text-sm">
                          {currentUser.totalXp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardBody className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Cari nama atau NISN..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<Search className="w-4 h-4 text-white/60" />}
                  className="flex-1"
                  classNames={{
                    input: "text-white placeholder:text-white/60",
                    inputWrapper: "bg-white/10 border border-white/20"
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={sortBy === 'rank' ? 'solid' : 'bordered'}
                    color="primary"
                    onPress={() => setSortBy('rank')}
                  >
                    Ranking
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'xp' ? 'solid' : 'bordered'}
                    color="primary"
                    onPress={() => setSortBy('xp')}
                  >
                    XP
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === 'name' ? 'solid' : 'bordered'}
                    color="primary"
                    onPress={() => setSortBy('name')}
                  >
                    Nama
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Classmates List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredAndSortedClassmates.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardBody className="p-8 text-center">
                <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  Tidak Ada Teman Kelas
                </h3>
                <p className="text-white/60">
                  {searchQuery ? 'Tidak ada teman kelas yang sesuai dengan pencarian.' : 'Belum ada teman kelas yang terdaftar.'}
                </p>
              </CardBody>
            </Card>
          ) : (
            filteredAndSortedClassmates.map((classmate, index) => (
              <motion.div
                key={classmate.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="text-center min-w-[60px]">
                        <div className={`text-2xl font-bold ${getRankColor(classmate.rank)}`}>
                          {getRankIcon(classmate.rank)}
                        </div>
                        <span className="text-white/60 text-xs">Rank</span>
                      </div>

                      {/* Avatar and Info */}
                      <Avatar
                        src={classmate.profilePhoto || '/placeholder.svg'}
                        className="w-12 h-12"
                      />
                      
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{classmate.fullName}</h4>
                        <p className="text-white/60 text-sm">NISN: {classmate.studentId}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${getLevelColor(classmate.level)}`} />
                            <span className="text-white/80 text-xs">
                              Level {classmate.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-blue-400" />
                            <span className="text-white/80 text-xs">
                              {classmate.totalXp} XP
                            </span>
                          </div>
                          <Badge
                            size="sm"
                            className="bg-green-500/20 text-green-400"
                          >
                            Rata-rata: {(classmate.averageGrade || 0).toFixed(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-white/60 hover:text-white"
                          aria-label="Kirim pesan"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardBody className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <style>{`
                  @media (max-width: 767px) {
                    .classmates-stats {
                      gap: 15px;
                    }
                    .classmates-stats .text-xl {
                      font-size: 1.125rem;
                    }
                  }
                `}</style>
                <div>
                  <div className="text-white font-bold text-xl">{classmates.length}</div>
                  <div className="text-white/60 text-sm">Total Siswa</div>
                </div>
                <div>
                  <div className="text-white font-bold text-xl">
                    {Math.round(classmates.reduce((sum, c) => sum + c.averageGrade, 0) / classmates.length) || 0}
                  </div>
                  <div className="text-white/60 text-sm">Rata-rata Kelas</div>
                </div>
                <div>
                  <div className="text-white font-bold text-xl">
                    {Math.round(classmates.reduce((sum, c) => sum + c.totalXp, 0) / classmates.length) || 0}
                  </div>
                  <div className="text-white/60 text-sm">Rata-rata XP</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
