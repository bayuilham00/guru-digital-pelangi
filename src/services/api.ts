
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

// Google Apps Script Web App URL (to be replaced with actual deployed URL)
const BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      console.log(`API Request to: ${endpoint}`, options);
      
      const response = await fetch(`${BASE_URL}?action=${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    return this.request('login', {
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: Omit<User, 'id'>): Promise<User> {
    return this.request('register', {
      body: JSON.stringify(userData),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('getDashboardStats');
  }

  async getRecentActivity(): Promise<Activity[]> {
    return this.request('getRecentActivity');
  }

  // Kelas Management
  async getKelas(): Promise<Kelas[]> {
    return this.request('getKelas');
  }

  async createKelas(kelas: Omit<Kelas, 'id'>): Promise<Kelas> {
    return this.request('createKelas', {
      body: JSON.stringify(kelas),
    });
  }

  async updateKelas(id: string, kelas: Partial<Kelas>): Promise<Kelas> {
    return this.request('updateKelas', {
      body: JSON.stringify({ id, ...kelas }),
    });
  }

  async deleteKelas(id: string): Promise<void> {
    return this.request('deleteKelas', {
      body: JSON.stringify({ id }),
    });
  }

  // Siswa Management
  async getSiswa(): Promise<Siswa[]> {
    return this.request('getSiswa');
  }

  async createSiswa(siswa: Omit<Siswa, 'id'>): Promise<Siswa> {
    return this.request('createSiswa', {
      body: JSON.stringify(siswa),
    });
  }

  async updateSiswa(id: string, siswa: Partial<Siswa>): Promise<Siswa> {
    return this.request('updateSiswa', {
      body: JSON.stringify({ id, ...siswa }),
    });
  }

  async deleteSiswa(id: string): Promise<void> {
    return this.request('deleteSiswa', {
      body: JSON.stringify({ id }),
    });
  }

  // Presensi
  async getPresensi(kelas?: string, tanggal?: string): Promise<Presensi[]> {
    return this.request('getPresensi', {
      body: JSON.stringify({ kelas, tanggal }),
    });
  }

  async markPresensi(presensi: Omit<Presensi, 'id'>): Promise<Presensi> {
    return this.request('markPresensi', {
      body: JSON.stringify(presensi),
    });
  }

  // Tugas & Nilai
  async getTugas(): Promise<Tugas[]> {
    return this.request('getTugas');
  }

  async createTugas(tugas: Omit<Tugas, 'id'>): Promise<Tugas> {
    return this.request('createTugas', {
      body: JSON.stringify(tugas),
    });
  }

  async getNilai(tugasId?: string): Promise<Nilai[]> {
    return this.request('getNilai', {
      body: JSON.stringify({ tugasId }),
    });
  }

  async submitNilai(nilai: Omit<Nilai, 'id'>): Promise<Nilai> {
    return this.request('submitNilai', {
      body: JSON.stringify(nilai),
    });
  }

  // Jurnal
  async getJurnal(): Promise<Jurnal[]> {
    return this.request('getJurnal');
  }

  async createJurnal(jurnal: Omit<Jurnal, 'id'>): Promise<Jurnal> {
    return this.request('createJurnal', {
      body: JSON.stringify(jurnal),
    });
  }

  async updateJurnal(id: string, jurnal: Partial<Jurnal>): Promise<Jurnal> {
    return this.request('updateJurnal', {
      body: JSON.stringify({ id, ...jurnal }),
    });
  }
}

export const apiService = new ApiService();
