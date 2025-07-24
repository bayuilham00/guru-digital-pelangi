import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ClassDetailPage from "./pages/ClassDetailPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentGrades } from "./pages/StudentGrades";
import { StudentAttendance } from "./pages/StudentAttendance";
import { StudentClassmates } from "./pages/StudentClassmates";
import { StudentAchievements } from "./pages/StudentAchievements";
import { StudentAssignments } from "./pages/StudentAssignments";
import { StudentProfile } from "./pages/StudentProfile";
import { StudentSettings } from "./pages/StudentSettings";
import TeacherPlannerPage from "./pages/TeacherPlannerPage";
import { TeacherAttendance } from "./pages/TeacherAttendance";
import BankSoalPage from "./pages/BankSoalPage";
import CreateQuestionPage from "./pages/CreateQuestionPage";
import EditQuestionPage from "./pages/EditQuestionPage";
import QuestionsPage from "./pages/QuestionsPage";
import QuestionBanksPage from "./pages/QuestionBanksPage";
import CreateQuestionBankPage from "./pages/CreateQuestionBankPage";
import EditQuestionBankPage from "./pages/EditQuestionBankPage";
import AssignmentDetailPage from "./components/modules/assignment/AssignmentDetailPage";
import AdminSetupPage from "./pages/AdminSetupPage";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role-based Home Redirect Component
const HomeRedirect = () => {
  const { user } = useAuthStore();
  
  // Redirect based on user role
  if (user?.role === 'SISWA') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  // For admin/teacher, redirect to admin dashboard
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HeroUIProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Setup Route - Public access for initial setup */}
          <Route path="/admin/setup" element={<AdminSetupPage />} />
          
          {/* Admin/Teacher Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Teacher Planner */}
          <Route
            path="/teacher-planner"
            element={
              <ProtectedRoute>
                <TeacherPlannerPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Attendance */}
          <Route
            path="/teacher-attendance"
            element={
              <ProtectedRoute>
                <TeacherAttendance />
              </ProtectedRoute>
            }
          />

          {/* Bank Soal Routes - More specific routes first */}
          <Route
            path="/bank-soal/questions/create"
            element={
              <ProtectedRoute>
                <CreateQuestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-soal/questions/:id/edit"
            element={
              <ProtectedRoute>
                <EditQuestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-soal/questions"
            element={
              <ProtectedRoute>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-soal/question-banks/create"
            element={
              <ProtectedRoute>
                <CreateQuestionBankPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-soal/question-banks/:id/edit"
            element={
              <ProtectedRoute>
                <EditQuestionBankPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-soal/question-banks"
            element={
              <ProtectedRoute>
                <QuestionBanksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-soal"
            element={
              <ProtectedRoute>
                <BankSoalPage />
              </ProtectedRoute>
            }
          />
          
          {/* Student Routes */}
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Student Pages */}
          <Route
            path="/student/grades"
            element={
              <ProtectedRoute>
                <StudentGrades />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/classmates"
            element={
              <ProtectedRoute>
                <StudentClassmates />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/achievements"
            element={
              <ProtectedRoute>
                <StudentAchievements />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute>
                <StudentAssignments />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute>
                <StudentSettings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
                  <div className="text-center">
                    <h1 className="text-white text-2xl font-bold mb-4">Notifikasi</h1>
                    <p className="text-white/60 mb-4">Halaman ini sedang dalam pengembangan</p>
                    <button 
                      onClick={() => window.history.back()} 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Kembali
                    </button>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Assignment Routes */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:assignmentId"
            element={
              <ProtectedRoute>
                <AssignmentDetailPage />
              </ProtectedRoute>
            }
          />
          
          {/* Class Detail Page - Protected Route */}
          <Route
            path="/class/:id"
            element={
              <ProtectedRoute>
                <ClassDetailPage />
              </ProtectedRoute>
            }
          />
          
          {/* Class Detail Page */}
          <Route
            path="/admin/class/:id"
            element={
              <ProtectedRoute>
                <ClassDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={<Navigate to="/dashboard" replace />}
          />
          
          {/* Home redirect based on role */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  </QueryClientProvider>
);

export default App;
