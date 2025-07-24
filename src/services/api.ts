
import { toast } from "@/components/ui/use-toast";
import type { 
  User, 
  Kelas, 
  Siswa, 
  Presensi, 
  Tugas, 
  Nilai, 
  Jurnal, 
  DashboardStats, 
  Activity, 
  ApiResponse 
} from "@/types/api";

// Backend API base URL
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api' 
  : 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = localStorage.getItem('auth_token');
      console.log(`API Request to: ${BASE_URL}/${endpoint}`, options);
      
      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: Omit<User, 'id'>): Promise<User> {
    return this.request('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('dashboard/stats');
  }

  async getRecentActivity(): Promise<Activity[]> {
    return this.request('dashboard/activity');
  }

  // Kelas Management
  async getKelas(): Promise<Kelas[]> {
    return this.request('classes');
  }

  async createKelas(kelas: Omit<Kelas, 'id'>): Promise<Kelas> {
    return this.request('classes', {
      method: 'POST',
      body: JSON.stringify(kelas),
    });
  }

  async updateKelas(id: string, kelas: Partial<Kelas>): Promise<Kelas> {
    return this.request(`classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(kelas),
    });
  }

  async deleteKelas(id: string): Promise<void> {
    return this.request(`classes/${id}`, {
      method: 'DELETE',
    });
  }

  // Siswa Management
  async getSiswa(): Promise<Siswa[]> {
    return this.request('students');
  }

  async createSiswa(siswa: Omit<Siswa, 'id'>): Promise<Siswa> {
    return this.request('students', {
      method: 'POST',
      body: JSON.stringify(siswa),
    });
  }

  async updateSiswa(id: string, siswa: Partial<Siswa>): Promise<Siswa> {
    return this.request(`students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(siswa),
    });
  }

  async deleteSiswa(id: string): Promise<void> {
    return this.request(`students/${id}`, {
      method: 'DELETE',
    });
  }

  // Presensi
  async getPresensi(kelas?: string, tanggal?: string): Promise<Presensi[]> {
    const params = new URLSearchParams();
    if (kelas) params.append('classId', kelas);
    if (tanggal) params.append('date', tanggal);
    return this.request(`attendance?${params.toString()}`);
  }

  async markPresensi(presensi: Omit<Presensi, 'id'>): Promise<Presensi> {
    return this.request('attendance', {
      method: 'POST',
      body: JSON.stringify(presensi),
    });
  }

  // Tugas & Nilai
  async getTugas(): Promise<Tugas[]> {
    return this.request('assignments');
  }

  async createTugas(tugas: Omit<Tugas, 'id'>): Promise<Tugas> {
    return this.request('assignments', {
      method: 'POST',
      body: JSON.stringify(tugas),
    });
  }

  async getNilai(tugasId?: string): Promise<Nilai[]> {
    const params = new URLSearchParams();
    if (tugasId) params.append('assignmentId', tugasId);
    return this.request(`grades?${params.toString()}`);
  }

  async submitNilai(nilai: Omit<Nilai, 'id'>): Promise<Nilai> {
    return this.request('grades', {
      method: 'POST',
      body: JSON.stringify(nilai),
    });
  }

  // Jurnal
  async getJurnal(): Promise<Jurnal[]> {
    return this.request('journals');
  }

  async createJurnal(jurnal: Omit<Jurnal, 'id'>): Promise<Jurnal> {
    return this.request('journals', {
      method: 'POST',
      body: JSON.stringify(jurnal),
    });
  }

  async updateJurnal(id: string, jurnal: Partial<Jurnal>): Promise<Jurnal> {
    return this.request(`journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jurnal),
    });
  }
}

export const apiService = new ApiService();
