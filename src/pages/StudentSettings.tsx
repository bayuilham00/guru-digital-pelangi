// Student Settings Page - Halaman Pengaturan Siswa
import React, { useState } from 'react';
import { Card, CardBody, Button, Switch, Input, Select, SelectItem } from '@heroui/react';
import { ArrowLeft, Bell, Lock, Eye, Moon, Globe, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export const StudentSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    assignments: true,
    grades: true,
    attendance: false,
    announcements: true
  });

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { logout } = useAuthStore();

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password harus minimal 6 karakter');
      return;
    }

    // In a real app, you would call an API to change the password
    console.log('Changing password...');
    alert('Password berhasil diubah');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
    }
  };

  const settingSections = [
    {
      title: 'Notifikasi',
      icon: Bell,
      items: [
        {
          key: 'assignments',
          label: 'Tugas Baru',
          description: 'Dapatkan notifikasi ketika ada tugas baru',
          value: notifications.assignments,
          onChange: (value: boolean) => handleNotificationChange('assignments', value)
        },
        {
          key: 'grades',
          label: 'Nilai',
          description: 'Dapatkan notifikasi ketika ada nilai baru',
          value: notifications.grades,
          onChange: (value: boolean) => handleNotificationChange('grades', value)
        },
        {
          key: 'attendance',
          label: 'Absensi',
          description: 'Pengingat untuk melakukan absensi',
          value: notifications.attendance,
          onChange: (value: boolean) => handleNotificationChange('attendance', value)
        },
        {
          key: 'announcements',
          label: 'Pengumuman',
          description: 'Dapatkan notifikasi pengumuman sekolah',
          value: notifications.announcements,
          onChange: (value: boolean) => handleNotificationChange('announcements', value)
        }
      ]
    },
    {
      title: 'Tampilan',
      icon: Eye,
      items: [
        {
          key: 'darkMode',
          label: 'Mode Gelap',
          description: 'Gunakan tema gelap untuk tampilan yang lebih nyaman',
          value: darkMode,
          onChange: setDarkMode
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            isIconOnly
            variant="ghost"
            className="text-white hover:bg-white/10"
            onPress={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
            <p className="text-white/60">Kelola preferensi dan pengaturan akun Anda</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Settings Sections */}
          {settingSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <SectionIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-white text-lg font-semibold">{section.title}</h3>
                    </div>

                    <div className="space-y-4">
                      {section.items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                        >
                          <div>
                            <h4 className="text-white font-medium">{item.label}</h4>
                            <p className="text-white/60 text-sm">{item.description}</p>
                          </div>
                          <Switch
                            isSelected={item.value}
                            onValueChange={item.onChange}
                            color="primary"
                          />
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}

          {/* Language Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Bahasa</h3>
                </div>

                <div className="max-w-md">
                  <Select
                    label="Pilih Bahasa"
                    selectedKeys={[language]}
                    onSelectionChange={(keys) => setLanguage(Array.from(keys)[0] as string)}
                    className="bg-white/5"
                  >
                    <SelectItem key="id" value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem key="en" value="en">English</SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Keamanan</h3>
                </div>

                <div className="space-y-4 max-w-md">
                  <Input
                    type="password"
                    label="Password Lama"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-white/5"
                  />
                  <Input
                    type="password"
                    label="Password Baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/5"
                  />
                  <Input
                    type="password"
                    label="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5"
                  />
                  <Button
                    color="primary"
                    onPress={handlePasswordChange}
                    startContent={<Lock className="w-4 h-4" />}
                    disabled={!oldPassword || !newPassword || !confirmPassword}
                  >
                    Ubah Password
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Logout Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-2">Keluar</h3>
                    <p className="text-white/60">Keluar dari akun Anda</p>
                  </div>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={handleLogout}
                    startContent={<LogOut className="w-4 h-4" />}
                  >
                    Keluar
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
