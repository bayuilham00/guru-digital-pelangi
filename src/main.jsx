
const { useState, useEffect } = React;
const { motion, AnimatePresence } = Motion;

// Sidebar Component
const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: '🏠',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'kelas', 
      name: 'Kelas', 
      icon: '📚',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    { 
      id: 'siswa', 
      name: 'Siswa', 
      icon: '👥',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      id: 'presensi', 
      name: 'Presensi', 
      icon: '✅',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    { 
      id: 'tugas', 
      name: 'Tugas', 
      icon: '📝',
      gradient: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'nilai', 
      name: 'Nilai', 
      icon: '📊',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'jurnal', 
      name: 'Jurnal', 
      icon: '📖',
      gradient: 'from-pink-500 to-pink-600'
    },
    { 
      id: 'planner', 
      name: 'Teacher Planner', 
      icon: '📅',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'rpp', 
      name: 'RPP & Modul', 
      icon: '📋',
      gradient: 'from-red-500 to-red-600'
    },
    { 
      id: 'bank-soal', 
      name: 'Bank Soal', 
      icon: '🎯',
      gradient: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-72 h-screen sidebar-gradient text-white p-6 shadow-2xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Kelas Guru
        </h2>
        <p className="text-gray-300 text-sm">Sistem Administrasi Pembelajaran</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveMenu(item.id)}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
              activeMenu === item.id 
                ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                : 'hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </motion.button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <div>
              <p className="font-semibold">Devi Saidulloh</p>
              <p className="text-gray-300 text-sm">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const stats = [
    { 
      title: 'Total Kelas', 
      value: '3', 
      subtitle: 'Kelas aktif',
      change: '+2 dari bulan lalu',
      icon: '📚',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Total Siswa', 
      value: '89', 
      subtitle: 'Siswa terdaftar',
      change: '+8 dari bulan lalu',
      icon: '👥',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      title: 'Tugas Aktif', 
      value: '12', 
      subtitle: 'Tugas berlangsung',
      change: '+3 minggu ini',
      icon: '📝',
      gradient: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Rata-rata Nilai', 
      value: '8.5', 
      subtitle: 'Nilai keseluruhan',
      change: '+0.3 dari bulan lalu',
      icon: '📊',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const recentClasses = [
    { id: '9B', subject: 'Bahasa Indonesia (IPS)', time: '07:00-08:30' },
    { id: '9A', subject: 'Administrasi (IPA)', time: '08:30-10:00' },
    { id: '9C', subject: 'IPA', time: '10:15-11:45', status: 'Berlangsung' }
  ];

  const activities = [
    { 
      type: 'assignment',
      title: 'Tugas Matematika dikumpulkan',
      user: 'Ahmad Pratama',
      time: '2 jam lalu',
      icon: '📝'
    },
    { 
      type: 'quiz',
      title: 'Nilai Quiz Fisika tersedia',
      user: 'Siti Nurhaliza',
      time: '4 jam lalu',
      icon: '🎯'
    },
    { 
      type: 'attendance',
      title: 'Presensi kelas 9A selesai',
      user: 'System',
      time: '1 hari lalu',
      icon: '✅'
    },
    { 
      type: 'badge',
      title: 'Badge "Expert Learner" diraih',
      user: 'Budi Santoso',
      time: '2 hari lalu',
      icon: '🏆'
    }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, Devi Saidulloh! 👋</h1>
          <p className="text-blue-100 text-lg">Hari ini adalah kesempatan baru untuk menginspirasi siswa Anda</p>
        </div>
        <div className="absolute top-4 right-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-3xl">📊</span>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-400/20 rounded-full"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">{stat.icon}</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-white/80 mb-2">{stat.subtitle}</p>
              <p className="text-white/60 text-sm">{stat.change}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Classes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Kelas Terbaru</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
              + Tambah Kelas
            </button>
          </div>
          
          <div className="space-y-4">
            {recentClasses.map((kelas, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mr-4">
                  {kelas.id}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{kelas.subject}</h4>
                  <p className="text-gray-600 text-sm">{kelas.time}</p>
                </div>
                {kelas.status && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {kelas.status}
                  </span>
                )}
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">👁️</button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">✏️</button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activities */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">⚡ Aktivitas Terbaru</h3>
            <span className="text-sm text-gray-500">Update terbaru dari kelas Anda</span>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors">
            Lihat Semua Aktivitas
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// Kelas Component
const Kelas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const kelasData = [
    {
      id: '9C',
      subject: 'IPA',
      schedule: '08:25 - 09:45',
      students: 31,
      assignments: 0,
      avgGrade: '-',
      color: 'from-purple-500 to-purple-700',
      status: 'active',
      lastUpdated: 'Dibuat 6 Jun 2025'
    },
    {
      id: 'XI PA1',
      subject: 'Fisika',
      schedule: '07:00-09:00',
      students: 28,
      assignments: 3,
      avgGrade: '8.2',
      color: 'from-cyan-500 to-blue-600',
      status: 'active',
      lastUpdated: 'Dibuat 9 Jun 2025'
    },
    {
      id: '7A',
      subject: 'IPA',
      schedule: '08:25 - 09:45',
      students: 30,
      assignments: 2,
      avgGrade: '7.8',
      color: 'from-blue-500 to-blue-700',
      status: 'active',
      lastUpdated: 'Dibuat 10 Jun 2025'
    },
    {
      id: '9E',
      subject: 'IPA',
      schedule: 'Belum Dijadwalkan',
      students: 0,
      assignments: 0,
      avgGrade: '-',
      color: 'from-orange-500 to-red-500',
      status: 'draft',
      lastUpdated: 'Draft'
    }
  ];

  const filteredKelas = kelasData.filter(kelas => 
    kelas.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kelas.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelas</h1>
          <p className="text-gray-600">Kelola semua kelas Anda dengan mudah</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <span>+</span>
            <span>Buat Kelas</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari kelas, mata pelajaran, atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <span className="text-gray-600 font-medium">{filteredKelas.length} Kelas</span>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredKelas.map((kelas, index) => (
          <motion.div
            key={kelas.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            {/* Header Card */}
            <div className={`bg-gradient-to-br ${kelas.color} p-6 text-white relative overflow-hidden`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{kelas.id}</h3>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {kelas.subject}
                  </span>
                </div>
                <p className="text-white/80">{kelas.schedule}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600">👥</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kelas.students}</p>
                  <p className="text-gray-600 text-xs">Siswa</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600">📝</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kelas.assignments}</p>
                  <p className="text-gray-600 text-xs">Tugas</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600">📊</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kelas.avgGrade}</p>
                  <p className="text-gray-600 text-xs">Rata-rata</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">👁️</button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">✏️</button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  kelas.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  Lihat
                </span>
              </div>

              {/* Last Updated */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-xs flex items-center">
                  <span className="mr-2">📅</span>
                  {kelas.lastUpdated}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Siswa Component
const Siswa = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua Kelas');
  
  const siswaData = [
    {
      id: 1,
      name: 'Aditya Purnama',
      username: 'adityap',
      email: 'aditya@email.com',
      kelas: '9C',
      status: 'active',
      avatar: '👨‍🎓',
      joinDate: '15 Jan 2025',
      lastActivity: '2 jam lalu'
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      username: 'siti',
      email: 'siti@email.com',
      kelas: '7A',
      status: 'active',
      avatar: '👩‍🎓',
      joinDate: '20 Jan 2025',
      lastActivity: '1 hari lalu'
    },
    {
      id: 3,
      name: 'Budi Santoso',
      username: 'budi',
      email: 'budi@email.com',
      kelas: '9E',
      status: 'inactive',
      avatar: '👨‍🎓',
      joinDate: '10 Feb 2025',
      lastActivity: '1 minggu lalu'
    }
  ];

  const kelasOptions = ['Semua Kelas', '9C', '7A', '9E', 'XI PA1'];

  const filteredSiswa = siswaData.filter(siswa => {
    const matchesSearch = siswa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         siswa.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         siswa.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelas = filterKelas === 'Semua Kelas' || siswa.kelas === filterKelas;
    return matchesSearch && matchesKelas;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Siswa</h1>
          <p className="text-gray-600">Kelola semua siswa dan penempatan kelas</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            <span>📊</span>
            <span>Debug Data</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <span>👥</span>
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama, username, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {kelasOptions.map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
            <span className="text-gray-600 font-medium whitespace-nowrap">{filteredSiswa.length} Siswa</span>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SISWA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">USERNAME</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">KELAS</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">BERGABUNG</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSiswa.map((siswa, index) => (
                <motion.tr
                  key={siswa.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                        {siswa.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{siswa.name}</p>
                        <p className="text-gray-600 text-sm">{siswa.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {siswa.username}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      📚 {siswa.kelas}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900 font-medium">{siswa.joinDate}</p>
                      <p className="text-gray-500 text-sm">Terakhir: {siswa.lastActivity}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        👁️
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        ✏️
                      </button>
                      <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        📧
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

// Presensi Component
const Presensi = () => {
  const [selectedDate, setSelectedDate] = useState('2025-06-12');
  const [selectedKelas, setSelectedKelas] = useState('Pilih Kelas...');
  
  const attendanceStats = [
    { 
      title: 'Total Hadir', 
      value: '33', 
      subtitle: 'Semua data',
      icon: '✅',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Sakit', 
      value: '2', 
      subtitle: 'Semua data',
      icon: '💊',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Izin', 
      value: '1', 
      subtitle: 'Semua data',
      icon: '⚠️',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Alfa', 
      value: '1', 
      subtitle: 'Semua data',
      icon: '❌',
      color: 'from-red-500 to-red-600'
    },
    { 
      title: 'Minggu Ini', 
      value: '0', 
      subtitle: 'Semua data',
      icon: '⚡',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Rata-rata Poin', 
      value: '100', 
      subtitle: 'Semua data',
      icon: '🏆',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
            👥
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presensi Siswa</h1>
            <p className="text-gray-600">Kelola kehadiran siswa dengan mudah</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
          <span>📤</span>
          <span>Export</span>
        </button>
      </div>

      {/* Real-time Stats Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Statistik Presensi Real-Time</h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
            <span>🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-blue-600 font-medium">• Total Records: 37</p>
          </div>
          <div className="text-center">
            <p className="text-green-600 font-medium">• Tanggal Recorded: 4 hari</p>
          </div>
          <div className="text-center">
            <p className="text-purple-600 font-medium">• Siswa Tercatat: 9 siswa</p>
          </div>
          <div className="text-center">
            <p className="text-orange-600 font-medium">• Periode: 29 Mei - 07 Jun</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {attendanceStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white text-center`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <h4 className="text-2xl font-bold mb-1">{stat.value}</h4>
              <p className="text-white/80 text-sm">{stat.title}</p>
              <p className="text-white/60 text-xs">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Attendance Controls */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white mb-8">
        <h3 className="text-xl font-bold mb-4">📅 Presensi Harian</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-white/80 text-sm mb-2">Pilih Kelas</label>
            <select 
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50"
            >
              <option value="Pilih Kelas...">Pilih Kelas...</option>
              <option value="9C">9C</option>
              <option value="7A">7A</option>
              <option value="9E">9E</option>
              <option value="XI PA1">XI PA1</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Tanggal</label>
            <div className="flex items-center space-x-2">
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">📅</button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors font-medium">
              Hari Ini
            </button>
            <button className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl transition-colors font-medium">
              Semua Hadir
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Placeholder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Kelas untuk Memulai Presensi</h3>
        <p className="text-gray-600 mb-6">Silahkan pilih kelas terlebih dahulu untuk melihat daftar siswa dan melakukan presensi</p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          Pilih Kelas
        </button>
      </motion.div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'kelas':
        return <Kelas />;
      case 'siswa':
        return <Siswa />;
      case 'presensi':
        return <Presensi />;
      default:
        return (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚧</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Halaman Dalam Pengembangan</h3>
            <p className="text-gray-600">Fitur {activeMenu} sedang dalam tahap pengembangan</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
