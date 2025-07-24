// Updated: Login page for Guru Digital Pelangi
import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'SISWA') {
        navigate('/student/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSuccess = () => {
    console.log('🔐 LoginPage: Login success, checking user role for navigation...');
    const { user } = useAuthStore.getState();
    
    if (user?.role === 'SISWA') {
      console.log('🔐 LoginPage: User is student, navigating to student dashboard...');
      navigate('/student/dashboard');
    } else {
      console.log('🔐 LoginPage: User is admin/teacher, navigating to admin dashboard...');
      navigate('/dashboard');
    }
  };

  return (
    <LoginForm onSuccess={handleLoginSuccess} />
  );
};

export default LoginPage;
