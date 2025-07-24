import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Avatar, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from '@heroui/react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Edit, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu, isOpen, onToggle }) => {
  const { user, logout } = useAuthStore();
  const { updateUser } = useAuthStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isOpen: isLogoutOpen, onOpen: onLogoutOpen, onOpenChange: onLogoutOpenChange } = useDisclosure();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure();

  // Accordion state for menu groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['akademik']));

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    nip: user?.nip || '',
    phone: user?.phone || '',
    newPassword: ''
  });

  // Loading state for profile update
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        nip: user.nip || '',
        phone: user.phone || '',
        newPassword: ''
      });
    }
  }, [user]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && isMobile) {
        onToggle();
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile, onToggle]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    console.log('Updating profile:', profileForm);
    console.log('Current user:', user);
    
    setIsUpdatingProfile(true);
    
    try {
      const result = await authService.updateProfile({
        fullName: profileForm.fullName,
        email: profileForm.email,
        nip: profileForm.nip,
        phone: profileForm.phone,
        newPassword: profileForm.newPassword
      });
      
      console.log('Profile update result:', result);
      
      if (result.success) {
        // Update user state in auth store
        if (result.data) {
          updateUser(result.data);
          console.log('Profile updated successfully, new user data:', result.data);
        }
        
        alert('Profile berhasil diupdate!');
        onProfileOpenChange();
      } else {
        alert('Error: ' + (result.error || 'Gagal update profile'));
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error: Gagal update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const openProfileModal = () => {
    console.log('Opening profile modal, user:', user);
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      nip: user?.nip || '',
      phone: user?.phone || '',
      newPassword: ''
    });
    onProfileOpen();
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getUserInitial = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    if (user?.name) {
      return user.name;
    }
    return 'User';
  };

  // Grouped menu structure
  const menuGroups = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '🏠',
      type: 'single',
      items: [{
        id: 'dashboard',
        name: 'Dashboard',
        icon: '🏠',
        color: 'primary'
      }]
    },
    {
      id: 'akademik',
      name: 'Akademik',
      icon: '📚',
      type: 'group',
      items: [
        { id: 'kelas', name: 'Kelas', icon: '📚', color: 'secondary' },
        { id: 'siswa', name: 'Siswa', icon: '👥', color: 'success' },
        { id: 'presensi', name: 'Presensi', icon: '✅', color: 'warning' }
      ]
    },
    {
      id: 'pembelajaran',
      name: 'Pembelajaran',
      icon: '📝',
      type: 'group',
      items: [
        { id: 'tugas', name: 'Tugas', icon: '📝', color: 'danger' },
        { id: 'nilai', name: 'Nilai', icon: '📊', color: 'primary' },
        { id: 'gamifikasi', name: 'Gamifikasi', icon: '🎮', color: 'secondary' },
        { id: 'bank-soal', name: 'Bank Soal', icon: '🎯', color: 'danger' }
      ]
    },
    {
      id: 'tools',
      name: 'Tools',
      icon: '�️',
      type: 'group',
      items: [
        { id: 'planner', name: 'Teacher Planner', icon: '📅', color: 'success' },
        { id: 'jurnal', name: 'Jurnal', icon: '📖', color: 'secondary' },
        { id: 'rpp', name: 'RPP & Modul', icon: '📋', color: 'warning' }
      ]
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: '⚙️',
      type: 'group',
      adminOnly: true,
      items: [
        { id: 'pengaturan', name: 'Pengaturan', icon: '⚙️', color: 'warning' }
      ]
    }
  ];

  // Mobile Drawer Component
  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <Button
          isIconOnly
          variant="flat"
          className="fixed top-4 left-4 z-[60] md:hidden bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50"
          onPress={onToggle}
          size="sm"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={onToggle}
                aria-hidden="true"
              />
              
              {/* Mobile Drawer */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white shadow-2xl z-50 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
              >
                {renderSidebarContent()}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="w-72 h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white shadow-2xl flex flex-col fixed left-0 top-0 z-30"
    >
      {renderSidebarContent()}
    </motion.div>
  );

  // Shared Sidebar Content
  function renderSidebarContent() {
    return (
      <>
        {/* Header */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Kelas Guru
              </h2>
              <p className="text-gray-300 text-sm">Sistem Administrasi Pembelajaran</p>
            </div>
            {isMobile && (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={onToggle}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Menu - Accordion Style */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto" role="navigation">
          <div className="space-y-1">
            {menuGroups
              .filter(group => !group.adminOnly || user?.role === 'ADMIN')
              .map((group) => (
                <div key={group.id} className="mb-1">
                  {group.type === 'single' ? (
                    // Single menu item (Dashboard)
                    <Button
                      variant={activeMenu === group.items[0].id ? "solid" : "light"}
                      color={activeMenu === group.items[0].id ? (group.items[0].color as "primary" | "secondary" | "success" | "warning" | "danger") : "default"}
                      className={`w-full justify-start h-10 transition-all duration-200 ${
                        activeMenu === group.items[0].id
                          ? 'shadow-lg transform scale-[1.02]'
                          : 'hover:bg-white/10 hover:scale-[1.01]'
                      }`}
                      startContent={<span className="text-lg">{group.items[0].icon}</span>}
                      onPress={() => {
                        setActiveMenu(group.items[0].id);
                        if (isMobile) onToggle();
                      }}
                      aria-current={activeMenu === group.items[0].id ? "page" : undefined}
                    >
                      <span className="font-medium text-sm">{group.items[0].name}</span>
                    </Button>
                  ) : (
                    // Group with accordion
                    <>
                      {/* Group Header */}
                      <Button
                        variant="light"
                        className="w-full justify-between h-10 hover:bg-white/10 mb-1"
                        startContent={
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{group.icon}</span>
                            <span className="font-medium text-sm">{group.name}</span>
                          </div>
                        }
                        endContent={
                          <motion.div
                            animate={{ rotate: expandedGroups.has(group.id) ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        }
                        onPress={() => toggleGroup(group.id)}
                      />
                      
                      {/* Group Items */}
                      <AnimatePresence initial={false}>
                        {expandedGroups.has(group.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 space-y-1 pb-1">
                              {group.items.map((item) => (
                                <Button
                                  key={item.id}
                                  variant={activeMenu === item.id ? "solid" : "light"}
                                  color={activeMenu === item.id ? (item.color as "primary" | "secondary" | "success" | "warning" | "danger") : "default"}
                                  className={`w-full justify-start h-9 transition-all duration-200 ${
                                    activeMenu === item.id
                                      ? 'shadow-lg transform scale-[1.02]'
                                      : 'hover:bg-white/10 hover:scale-[1.01]'
                                  }`}
                                  startContent={<span className="text-base">{item.icon}</span>}
                                  onPress={() => {
                                    if (item.id === 'planner') {
                                      // Navigate to Teacher Planner page
                                      navigate('/teacher-planner');
                                    } else if (item.id === 'presensi') {
                                      // Navigate to appropriate attendance page based on role
                                      if (user?.role === 'ADMIN') {
                                        // Admin goes to admin attendance management
                                        setActiveMenu('presensi'); // Keep using existing AttendanceManager component
                                      } else if (user?.role === 'GURU') {
                                        // Teacher goes to teacher attendance entry
                                        navigate('/teacher-attendance');
                                      } else {
                                        // Default fallback
                                        setActiveMenu(item.id);
                                      }
                                    } else {
                                      setActiveMenu(item.id);
                                    }
                                    if (isMobile) onToggle();
                                  }}
                                  aria-current={activeMenu === item.id ? "page" : undefined}
                                  size="sm"
                                >
                                  <span className="font-medium text-xs">{item.name}</span>
                                </Button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
          </div>
        </nav>

        {/* Bottom Section - User Profile + Logout - Fixed at bottom */}
        <div className="p-6 pt-4 space-y-3 flex-shrink-0 mt-auto">
          {/* User Profile Section */}
          <Card 
            className="bg-white/10 backdrop-blur-lg cursor-pointer hover:bg-white/20 transition-colors" 
            onClick={() => {
              console.log('Profile card clicked!');
              openProfileModal();
            }}
            isPressable
          >
            <CardBody className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar
                  name={getUserInitial()}
                  className="bg-gradient-to-r from-blue-400 to-purple-400 text-white font-semibold"
                  size="sm"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">
                    {getUserName()}
                  </p>
                  <p className="text-gray-300 text-xs capitalize">
                    {user?.role?.toLowerCase() || 'user'}
                  </p>
                </div>
                <Edit className="w-4 h-4 text-gray-300" />
              </div>
            </CardBody>
          </Card>

          {/* Logout Button */}
          <Button
            color="danger"
            variant="flat"
            className="w-full justify-start h-11 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-500/30"
            startContent={<LogOut className="w-4 h-4" />}
            onPress={onLogoutOpen}
          >
            <span className="font-medium text-sm">Keluar</span>
          </Button>
        </div>

        {/* Logout Confirmation Modal */}
        <Modal isOpen={isLogoutOpen} onOpenChange={onLogoutOpenChange} placement="center">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>Konfirmasi Keluar</span>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <p className="text-gray-600">
                    Apakah Anda yakin ingin keluar dari sistem?
                    Anda akan diarahkan kembali ke halaman login.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="default"
                    variant="light"
                    onPress={onClose}
                  >
                    Batal
                  </Button>
                  <Button
                    color="danger"
                    onPress={() => {
                      onClose();
                      handleLogout();
                    }}
                    startContent={<LogOut className="w-4 h-4" />}
                  >
                    Ya, Keluar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Profile Edit Modal */}
        <Modal isOpen={isProfileOpen} onOpenChange={onProfileOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span>Edit Profil</span>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Nama Lengkap"
                      placeholder="Masukkan nama lengkap"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Masukkan email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="NIP"
                        placeholder="Masukkan NIP"
                        value={profileForm.nip}
                        onChange={(e) => setProfileForm({...profileForm, nip: e.target.value})}
                      />
                      <Input
                        label="Kontak"
                        placeholder="Masukkan nomor kontak"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      />
                    </div>
                    <Input
                      label="Password Baru"
                      type="password"
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                      description="Kosongkan jika tidak ingin mengubah password"
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="default"
                    variant="light"
                    onPress={onClose}
                  >
                    Batal
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleUpdateProfile}
                    startContent={<User className="w-4 h-4" />}
                  >
                    Simpan Perubahan
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }
};

export default Sidebar;
