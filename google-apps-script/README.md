
# Google Apps Script Setup untuk Kelas Guru System

## Langkah-langkah Setup:

### 1. Buat Google Spreadsheet Baru
1. Buka Google Sheets (sheets.google.com)
2. Buat spreadsheet baru dengan nama "Kelas Guru Database"
3. Catat Spreadsheet ID dari URL (bagian setelah /d/ dan sebelum /edit)

### 2. Setup Sheets dengan Struktur Berikut:

**Sheet "Users"** (A1:E1):
- ID | Nama | Email | Role | PasswordHash

**Sheet "Kelas"** (A1:F1):
- ID | Nama | MataPelajaran | Jadwal | JumlahSiswa | Status

**Sheet "Siswa"** (A1:F1):
- ID | Nama | Kelas | NomorInduk | Email | Foto

**Sheet "Presensi"** (A1:E1):
- ID | Tanggal | Kelas | Siswa | Status

**Sheet "Tugas"** (A1:F1):
- ID | Kelas | Judul | Deskripsi | Deadline | Status

**Sheet "Nilai"** (A1:E1):
- ID | Siswa | Tugas | Nilai | Tanggal

**Sheet "Jurnal"** (A1:F1):
- ID | Tanggal | Kelas | Materi | Kegiatan | Refleksi

### 3. Setup Google Apps Script:
1. Dari Google Sheets, klik Extensions > Apps Script
2. Ganti kode default dengan kode dari file Code.gs
3. Ganti `YOUR_GOOGLE_SHEETS_ID_HERE` dengan Spreadsheet ID Anda
4. Simpan project dengan nama "Kelas Guru API"

### 4. Deploy Web App:
1. Klik "Deploy" > "New deployment"
2. Pilih type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Klik "Deploy"
6. Copy Web App URL yang diberikan

### 5. Update Frontend:
1. Buka file `src/services/api.ts`
2. Ganti `YOUR_SCRIPT_ID` dengan Web App URL Anda

### 6. Test Data (Opsional):
Tambahkan data sample di setiap sheet untuk testing:

**Users Sheet:**
```
admin001 | Devi Saidulloh | devi@example.com | admin | [hash_password]
```

**Kelas Sheet:**
```
kls001 | 9A | Bahasa Indonesia | 07:00-08:30 | 30 | aktif
kls002 | 9B | Matematika | 08:30-10:00 | 28 | aktif
```

### 7. Frontend Configuration:
Setelah deploy, sistem akan otomatis menggunakan Google Sheets sebagai database dan Google Apps Script sebagai backend API.

## Security Notes:
- Password akan di-hash menggunakan SHA-256
- Gunakan HTTPS untuk semua request
- Validasi semua input di backend
- Implement rate limiting jika diperlukan

## Troubleshooting:
- Pastikan Apps Script memiliki permission untuk mengakses Google Sheets
- Check console logs untuk debugging
- Pastikan CORS settings sudah benar
