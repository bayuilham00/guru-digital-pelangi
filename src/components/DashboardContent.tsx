import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, Button, Chip, Avatar, Progress, Tooltip } from '@heroui/react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Types
interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  activeAssignments: number;
  averageGrade: number;
}

interface DashboardContentProps {
  setActiveMenu: (menu: string) => void;
}

const DashboardContent = ({ setActiveMenu }: DashboardContentProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    averageGrade: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChart, setSelectedChart] = useState('overview');

  // Chart data - this would normally come from API
  const chartData = {
    overview: [
      { name: 'Jan', kelas: 12, siswa: 350, tugas: 8, nilai: 85 },
      { name: 'Feb', kelas: 15, siswa: 420, tugas: 12, nilai: 87 },
      { name: 'Mar', kelas: 18, siswa: 480, tugas: 15, nilai: 89 },
      { name: 'Apr', kelas: 22, siswa: 560, tugas: 18, nilai: 91 },
      { name: 'Mei', kelas: 25, siswa: 620, tugas: 22, nilai: 88 },
      { name: 'Jun', kelas: 28, siswa: 680, tugas: 25, nilai: 92 }
    ],
    distribution: [
      { name: 'Kelas Aktif', value: stats.totalClasses || 28, color: '#06b6d4' },
      { name: 'Siswa Terdaftar', value: stats.totalStudents || 680, color: '#8b5cf6' },
      { name: 'Tugas Aktif', value: stats.activeAssignments || 25, color: '#10b981' },
      { name: 'Rata-rata Nilai', value: stats.averageGrade || 92, color: '#f59e0b' }
    ],
    performance: [
      { subject: 'Matematika', nilai: 88, siswa: 125 },
      { subject: 'Bahasa Indonesia', nilai: 92, siswa: 130 },
      { subject: 'IPA', nilai: 85, siswa: 120 },
      { subject: 'IPS', nilai: 90, siswa: 115 },
      { subject: 'Bahasa Inggris', nilai: 87, siswa: 110 }
    ]
  };

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  // Update time every second for futuristic feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getUserName = () => {
    if (user?.fullName) {
      return `${user.fullName}`;
    }
    return 'User';
  };

  // Quick Action Shortcuts
  const quickActions = [
    {
      label: 'Kelas',
      icon: '🏫',
      color: 'from-blue-500 to-cyan-500',
      action: () => setActiveMenu('kelas'),
      description: 'Kelola dan atur kelas'
    },
    {
      label: 'Siswa',
      icon: '👥',
      color: 'from-purple-500 to-pink-500',
      action: () => setActiveMenu('siswa'),
      description: 'Kelola data siswa'
    },
    {
      label: 'Bank Soal',
      icon: '📚',
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/bank-soal'),
      description: 'Kelola bank soal'
    },
    {
      label: 'Gamifikasi',
      icon: '🎮',
      color: 'from-pink-500 to-rose-500',
      action: () => setActiveMenu('gamifikasi'),
      description: 'Sistem poin & reward'
    },
    {
      label: 'Presensi',
      icon: '📋',
      color: 'from-orange-500 to-amber-500',
      action: () => setActiveMenu('presensi'),
      description: 'Kelola kehadiran'
    },
    {
      label: 'Pengaturan',
      icon: '⚙️',
      color: 'from-gray-500 to-slate-500',
      action: () => setActiveMenu('pengaturan'),
      description: 'Konfigurasi sistem'
    }
  ];

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load stats
      const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-3 rounded-lg">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart type selector
  const chartTypes = [
    { id: 'overview', name: 'Overview Trend', icon: '📈' },
    { id: 'distribution', name: 'Data Distribution', icon: '🥧' },
    { id: 'performance', name: 'Subject Performance', icon: '📊' }
  ];

  // Render different chart types
  const renderChart = () => {
    switch (selectedChart) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.overview}>
              <defs>
                <linearGradient id="colorKelas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSiswa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="kelas"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorKelas)"
                name="Kelas"
              />
              <Area
                type="monotone"
                dataKey="siswa"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorSiswa)"
                name="Siswa"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.distribution}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="subject" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="nilai" fill="#10b981" name="Rata-rata Nilai" radius={[4, 4, 0, 0]} />
              <Bar dataKey="siswa" fill="#06b6d4" name="Jumlah Siswa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Section with Time */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Selamat Datang, {getUserName()}! 🚀
            </h1>
            <p className="text-slate-300 text-lg">
              {user?.role === 'ADMIN'
                ? 'Command Center - Sistem Digital Pembelajaran'
                : user?.role === 'GURU'
                ? 'Teaching Hub - Platform Edukasi Masa Depan'
                : 'Learning Zone - Eksplorasi Pengetahuan Tanpa Batas'
              }
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
              <CardBody className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-mono text-cyan-400">
                    {currentTime.toLocaleTimeString('id-ID')}
                  </div>
                  <div className="text-sm text-slate-400">
                    {currentTime.toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions Grid - Glassmorphism Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">⚡</span>
            Quick Actions
          </h2>
          
          {/* Responsive Glassmorphism Grid */}
          <div className="quick-actions-grid mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className="group cursor-pointer"
                onClick={action.action}
              >
                <Tooltip content={action.description} placement="bottom" delay={500}>
                  <div className="glassmorphism-card">
                    {/* Floating Icon */}
                    <motion.div 
                      className="floating-icon"
                      whileHover={{ 
                        rotate: [0, -3, 3, 0],
                        scale: 1.15 
                      }}
                      transition={{ 
                        rotate: { duration: 0.6, ease: "easeInOut" },
                        scale: { duration: 0.2, ease: "easeOut" }
                      }}
                    >
                      {action.icon}
                    </motion.div>
                    
                    {/* Label with Enhanced Typography */}
                    <motion.div
                      className="action-label"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ 
                        opacity: 1,
                        y: -1
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {action.label}
                    </motion.div>
                  </div>
                </Tooltip>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">📊</span>
              Analytics Dashboard
            </h2>
            
            {/* Chart Type Selector */}
            <div className="flex gap-2 mt-4 lg:mt-0">
              {chartTypes.map((type) => (
                <Button
                  key={type.id}
                  size="sm"
                  variant={selectedChart === type.id ? "solid" : "bordered"}
                  color={selectedChart === type.id ? "primary" : "default"}
                  className={`${
                    selectedChart === type.id 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                  onPress={() => setSelectedChart(type.id)}
                  startContent={<span>{type.icon}</span>}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart Container */}
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
            <CardBody className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 animate-spin animate-reverse delay-150"></div>
                  </div>
                </div>
              ) : (
                <motion.div
                  key={selectedChart}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {renderChart()}
                </motion.div>
              )}
            </CardBody>
          </Card>

          {/* Quick Stats Cards - Compact Version */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-cyan-500/30">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                      🏫
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalClasses || 28}</p>
                      <p className="text-cyan-300 text-sm">Total Kelas</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                      👥
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalStudents || 680}</p>
                      <p className="text-purple-300 text-sm">Total Siswa</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl">
                      📝
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.activeAssignments || 25}</p>
                      <p className="text-green-300 text-sm">Tugas Aktif</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-xl border border-orange-500/30">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl">
                      📊
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.averageGrade || 92}%</p>
                      <p className="text-orange-300 text-sm">Rata-rata Nilai</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardContent;
