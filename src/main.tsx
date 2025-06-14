import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'

// We'll load Framer Motion dynamically or use a simpler approach for now
// For now, let's create a simple motion wrapper
const motion = {
  div: ({ children, className, initial, animate, transition, whileHover, whileTap, ...props }: any) => 
    React.createElement('div', { className, ...props }, children),
  button: ({ children, className, initial, animate, transition, whileHover, whileTap, ...props }: any) => 
    React.createElement('button', { className, ...props }, children)
};

const AnimatePresence = ({ children }: any) => React.createElement('div', {}, children);

// Sidebar Component
const Sidebar = ({ activeMenu, setActiveMenu }: { activeMenu: string, setActiveMenu: (menu: string) => void }) => {
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
    <motion.div className="w-72 h-screen sidebar-gradient text-white p-6 shadow-2xl">
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
      <motion.div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
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
        <motion.div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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
        <motion.div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">⚡ Aktivitas Terbaru</h3>
            <span className="text-sm text-gray-500">Update terbaru dari kelas Anda</span>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
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

// Placeholder component for other menus
const PlaceholderContent = ({ title }: { title: string }) => {
  return (
    <div className="p-8 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Halaman Dalam Pengembangan</h3>
      <p className="text-gray-600">Fitur {title} sedang dalam tahap pengembangan</p>
    </div>
  );
};

// Create QueryClient instance
const queryClient = new QueryClient();

// Main App Component with Authentication
const App = () => {
  const [activeMenu, setActiveMenu] = React.useState('dashboard');

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return <PlaceholderContent title={activeMenu} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          <main className="flex-1 overflow-auto">
            <div key={activeMenu}>
              {renderContent()}
            </div>
          </main>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
