// Student Profile Page - Halaman Profil Siswa (Read-only untuk siswa)
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Button, Spinner, Avatar } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { studentService } from '../services/studentService';

interface StudentProfile {
  id: string;
  studentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'L' | 'P';
  address?: string;
  asalSekolah?: string;
  kecamatan?: string;
  desaKelurahan?: string;
  parentName?: string;
  parentPhone?: string;
  profilePhoto?: string;
  class?: {
    name: string;
    gradeLevel: string;
  };
}

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchProfilePhoto = useCallback(async (studentId: string) => {
    try {
      const response = await studentService.getProfilePhoto(studentId);
      if (response.success && response.data?.profilePhoto) {
        return response.data.profilePhoto;
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
    return null;
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User ID tidak ditemukan');
        return;
      }

      // Fetch real profile data from API
      const response = await studentService.getStudentProfile(user.id);
      
      if (response.success && response.data) {
        const apiProfile = response.data;
        
        // Map API response to StudentProfile interface
        const mappedProfile: StudentProfile = {
          id: apiProfile.id,
          studentId: apiProfile.studentId,
          fullName: apiProfile.fullName,
          email: apiProfile.email,
          phone: apiProfile.phone,
          dateOfBirth: apiProfile.dateOfBirth,
          gender: apiProfile.gender,
          address: apiProfile.address,
          asalSekolah: apiProfile.asalSekolah,
          kecamatan: apiProfile.kecamatan,
          desaKelurahan: apiProfile.desaKelurahan,
          parentName: apiProfile.parentName,
          parentPhone: apiProfile.parentPhone,
          profilePhoto: null, // Will be fetched separately
          class: apiProfile.class
        };

        // Fetch profile photo separately
        const profilePhoto = await fetchProfilePhoto(apiProfile.id);
        mappedProfile.profilePhoto = profilePhoto;

        setProfile(mappedProfile);
      } else {
        console.error('Failed to fetch profile:', response.error);
        // Fallback to basic user data
        const fallbackProfile: StudentProfile = {
          id: user.id,
          studentId: user.studentId || '',
          fullName: user.fullName || 'Nama Siswa',
          email: user.email,
          phone: '',
          dateOfBirth: '',
          gender: 'L',
          address: '',
          asalSekolah: '',
          kecamatan: '',
          desaKelurahan: '',
          parentName: '',
          parentPhone: '',
          profilePhoto: null,
          class: undefined
        };
        setProfile(fallbackProfile);
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to basic user data on error
      const fallbackProfile: StudentProfile = {
        id: user?.id || '',
        studentId: user?.studentId || '',
        fullName: user?.fullName || 'Nama Siswa',
        email: user?.email,
        phone: '',
        dateOfBirth: '',
        gender: 'L',
        address: '',
        asalSekolah: '',
        kecamatan: '',
        desaKelurahan: '',
        parentName: '',
        parentPhone: '',
        profilePhoto: null,
        class: undefined
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.studentId, user?.fullName, user?.email, fetchProfilePhoto]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <Spinner size="lg" color="white" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Profil Tidak Ditemukan</h1>
          <Button 
            onClick={() => window.history.back()} 
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Kembali
          </Button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-white">Profil Siswa</h1>
            <p className="text-white/60">Lihat informasi profil Anda</p>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardBody className="p-8">
              {/* Profile Photo & Basic Info */}
              <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
                <div className="flex flex-col items-center gap-4 md:flex-shrink-0">
                  <Avatar
                    src={profile.profilePhoto || undefined}
                    className="w-32 h-32"
                    name={profile.fullName}
                    isBordered
                  />
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Nama Lengkap
                      </label>
                      <p className="text-white text-lg font-semibold">{profile.fullName}</p>
                    </div>

                    {/* NISN */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        NISN
                      </label>
                      <p className="text-white text-lg">{profile.studentId}</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Email
                      </label>
                      <p className="text-white">{profile.email || 'Belum diisi'}</p>
                    </div>

                    {/* Nomor HP */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Nomor HP
                      </label>
                      <p className="text-white">{profile.phone || 'Belum diisi'}</p>
                    </div>

                    {/* Tanggal Lahir */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Tanggal Lahir
                      </label>
                      <p className="text-white">
                        {profile.dateOfBirth ? 
                          new Date(profile.dateOfBirth).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'Belum diisi'
                        }
                      </p>
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Jenis Kelamin
                      </label>
                      <p className="text-white">{profile.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                    </div>

                    {/* Kelas */}
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Kelas
                      </label>
                      <p className="text-white text-lg font-semibold">
                        {profile.class ? `${profile.class.name} (Kelas ${profile.class.gradeLevel})` : 'Belum diisi'}
                      </p>
                    </div>

                    {/* Alamat */}
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Alamat
                      </label>
                      <p className="text-white">{profile.address || 'Belum diisi'}</p>
                    </div>

                    {/* Asal Sekolah */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Asal Sekolah
                      </label>
                      <p className="text-white">{profile.asalSekolah || 'Belum diisi'}</p>
                    </div>

                    {/* Kecamatan */}
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Kecamatan
                      </label>
                      <p className="text-white">{profile.kecamatan || 'Belum diisi'}</p>
                    </div>

                    {/* Desa/Kelurahan */}
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm font-medium mb-2">
                        Desa/Kelurahan
                      </label>
                      <p className="text-white">{profile.desaKelurahan || 'Belum diisi'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Orang Tua */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-white text-xl font-semibold mb-6">Informasi Orang Tua</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Orang Tua */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">
                      Nama Orang Tua/Wali
                    </label>
                    <p className="text-white">{profile.parentName || 'Belum diisi'}</p>
                  </div>

                  {/* Nomor HP Orang Tua */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">
                      Nomor HP Orang Tua/Wali
                    </label>
                    <p className="text-white">{profile.parentPhone || 'Belum diisi'}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
