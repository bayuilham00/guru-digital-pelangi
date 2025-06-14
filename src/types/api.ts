
// API Types for Google Sheets Backend
export interface User {
  id: string;
  nama: string;
  email: string;
  role: 'admin' | 'guru';
}

export interface Kelas {
  id: string;
  nama: string;
  mataPelajaran: string;
  jadwal: string;
  jumlahSiswa: number;
  status: 'aktif' | 'nonaktif';
}

export interface Siswa {
  id: string;
  nama: string;
  kelas: string;
  nomorInduk: string;
  email: string;
  foto?: string;
}

export interface Presensi {
  id: string;
  tanggal: string;
  kelas: string;
  siswa: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
}

export interface Tugas {
  id: string;
  kelas: string;
  judul: string;
  deskripsi: string;
  deadline: string;
  status: 'aktif' | 'selesai';
}

export interface Nilai {
  id: string;
  siswa: string;
  tugas: string;
  nilai: number;
  tanggal: string;
}

export interface Jurnal {
  id: string;
  tanggal: string;
  kelas: string;
  materi: string;
  kegiatan: string;
  refleksi: string;
}

export interface DashboardStats {
  totalKelas: number;
  totalSiswa: number;
  tugasAktif: number;
  rataRataNilai: number;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  user: string;
  time: string;
  icon: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
