// Gamification Dashboard Component for Guru Digital Pelangi
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Chip,
  Avatar,
  Spinner,
  Input
} from '@heroui/react';
import { 
  Trophy, 
  Star, 
  Award, 
  Users,
  Crown,
  Medal,
  Zap,
  Search,
  Filter
} from 'lucide-react';

import { gamificationService } from '../../../services/gamificationService';
import { getLevelColor } from '../../../utils/levelUtils';

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

interface GamificationStats {
  totalStudents: number;
  totalBadges: number;
  averageXp: number;
  topStudent: string;
}

const GamificationDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<{column: string, direction: 'ascending' | 'descending'}>({ column: 'rank', direction: 'ascending' });
  const [stats, setStats] = useState<GamificationStats>({
    totalStudents: 0,
    totalBadges: 0,
    averageXp: 0,
    topStudent: '-'
  });

  // Load leaderboard data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all students leaderboard data
      const response = await gamificationService.getAllStudentsLeaderboard();
      
      if (response.success && response.data) {
        const studentsData = response.data;
        
        // Calculate stats
        const totalStudents = studentsData.length;
        const totalBadges = studentsData.reduce((sum, student) => sum + student.badgeCount, 0);
        const averageXp = totalStudents > 0 ? Math.round(studentsData.reduce((sum, student) => sum + student.totalXp, 0) / totalStudents) : 0;
        const topStudent = studentsData.length > 0 ? studentsData[0].fullName : '-';
        
        setStats({
          totalStudents,
          totalBadges,
          averageXp,
          topStudent
        });
        
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort students data
  const sortedStudents = React.useMemo(() => {
    return [...students].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof LeaderboardStudent];
      const second = b[sortDescriptor.column as keyof LeaderboardStudent];
      
      // Special handling for numeric fields
      if (typeof first === 'number' && typeof second === 'number') {
        let cmp = first < second ? -1 : 1;
        if (sortDescriptor.direction === 'descending') {
          cmp *= -1;
        }
        return cmp;
      }
      
      // String comparison
      let cmp = (first?.toString() || '') < (second?.toString() || '') ? -1 : 1;
      if (sortDescriptor.direction === 'descending') {
        cmp *= -1;
      }
      return cmp;
    });
  }, [students, sortDescriptor]);

  const filteredItems = React.useMemo(() => {
    if (!searchValue) return sortedStudents;
    
    return sortedStudents.filter((student) =>
      student.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.className.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [sortedStudents, searchValue]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'warning'; // Gold
      case 2:
        return 'default'; // Silver
      case 3:
        return 'secondary'; // Bronze
      default:
        return 'primary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Gamifikasi</h1>
                  <p className="text-gray-600">Leaderboard seluruh siswa di sistem</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip color="success" variant="flat" startContent={<Star className="w-4 h-4" />}>
                  Sistem Aktif
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Siswa */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500">Terdaftar di sistem</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Badge */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Badge</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalBadges}</p>
                  <p className="text-xs text-gray-500">Badge diperoleh</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Rata-rata Poin */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata Poin</p>
                  <p className="text-2xl font-bold text-green-600">{stats.averageXp}</p>
                  <p className="text-xs text-gray-500">XP per siswa</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Siswa Poin Tertinggi */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Poin Tertinggi</p>
                  <p className="text-lg font-bold text-yellow-600 truncate">
                    {stats.topStudent}
                  </p>
                  <p className="text-xs text-gray-500">Juara keseluruhan</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Leaderboard Seluruh Siswa
              </h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Cari siswa..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  className="w-64"
                  size="sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table
              aria-label="Leaderboard table with sorting"
              classNames={{
                table: "min-h-[400px]",
              }}
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => setSortDescriptor(descriptor as {column: string, direction: 'ascending' | 'descending'})}
            >
              <TableHeader>
                <TableColumn key="rank" allowsSorting>
                  RANK
                </TableColumn>
                <TableColumn key="fullName" allowsSorting>
                  SISWA
                </TableColumn>
                <TableColumn key="className" allowsSorting>
                  KELAS
                </TableColumn>
                <TableColumn key="totalXp" allowsSorting>
                  TOTAL POIN
                </TableColumn>
                <TableColumn key="badgeCount" allowsSorting>
                  BADGE
                </TableColumn>
                <TableColumn key="level" allowsSorting>
                  LEVEL
                </TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isLoading}
                items={filteredItems}
                loadingContent={<Spinner label="Memuat data..." />}
              >
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(item.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={getInitials(item.fullName)}
                          size="sm"
                          color={getRankColor(item.rank)}
                        />
                        <div>
                          <div className="font-medium">{item.fullName}</div>
                          <div className="text-xs text-gray-500">{item.studentId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip color="primary" variant="flat" size="sm">
                        {item.className}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{item.totalXp.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{item.badgeCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getLevelColor(item.levelName)}
                        variant="flat"
                        size="sm"
                        aria-label={`Level ${item.level}: ${item.levelName}`}
                      >
                        Lv.{item.level} {item.levelName}
                      </Chip>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default GamificationDashboard;
