import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import ClassManager from './modules/class/ClassManager';
import StudentManager from './modules/student/StudentManager';
import AttendanceManager from './modules/attendance/AttendanceManager';
import GradeManager from './modules/grade/GradeManager';
import GamificationTabs from './modules/gamification/GamificationTabs';
import AssignmentManager from './modules/assignment/AssignmentManager';
import SettingsManager from './SettingsManager';
import BankSoalDashboard from './modules/bank-soal/BankSoalDashboard';
import { useIsMobile } from '../hooks/use-mobile';
import { Question, QuestionBank } from '../types/bankSoal';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleCreateQuestion = () => {
    navigate('/bank-soal/questions/create');
  };

  const handleCreateQuestionBank = () => {
    navigate('/bank-soal/question-banks/create');
  };

  const handleEditQuestion = (question: Question) => {
    navigate(`/bank-soal/questions/${question.id}/edit`);
  };

  const handleEditQuestionBank = (questionBank: QuestionBank) => {
    navigate(`/bank-soal/question-banks/${questionBank.id}/edit`);
  };

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return <DashboardContent setActiveMenu={setActiveMenu} />;
      case 'kelas':
        return <ClassManager />;
      case 'siswa':
        return <StudentManager />;
      case 'presensi':
        return <AttendanceManager />;
      case 'nilai':
        return <GradeManager />;
      case 'tugas':
        return <AssignmentManager />;
      case 'rpp':
        return (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">RPP/Modul Ajar</h3>
            <p className="text-gray-600">Fitur RPP akan segera hadir</p>
          </div>
        );
      case 'bank-soal':
        return (
          <BankSoalDashboard
            onCreateQuestion={handleCreateQuestion}
            onCreateQuestionBank={handleCreateQuestionBank}
            onEditQuestion={handleEditQuestion}
            onEditQuestionBank={handleEditQuestionBank}
          />
        );
      case 'gamifikasi':
        return <GamificationTabs />;
      case 'planner':
        return (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Teacher Planner</h3>
            <p className="text-gray-600 mb-4">Fitur Teacher Planner telah dipindahkan ke halaman terpisah</p>
            <button 
              onClick={() => window.location.href = '/teacher-planner'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Buka Teacher Planner
            </button>
          </div>
        );
      case 'pengaturan':
        return <SettingsManager />;
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className={`min-h-screen overflow-auto transition-all duration-300 ${
        isMobile ? 'ml-0 pt-16' : 'ml-72'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
