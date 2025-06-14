
// Google Apps Script Backend for Kelas Guru System
// Deploy this as a Web App with "Execute as: Me" and "Who has access: Anyone"

// Spreadsheet ID - Replace with your Google Sheets ID
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEETS_ID_HERE';

// Get spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Main function to handle HTTP requests
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents || '{}');
    
    console.log('Action:', action, 'Data:', data);
    
    let result;
    
    switch(action) {
      // Authentication
      case 'login':
        result = handleLogin(data);
        break;
      case 'register':
        result = handleRegister(data);
        break;
        
      // Dashboard
      case 'getDashboardStats':
        result = getDashboardStats();
        break;
      case 'getRecentActivity':
        result = getRecentActivity();
        break;
        
      // Kelas Management
      case 'getKelas':
        result = getKelas();
        break;
      case 'createKelas':
        result = createKelas(data);
        break;
      case 'updateKelas':
        result = updateKelas(data);
        break;
      case 'deleteKelas':
        result = deleteKelas(data);
        break;
        
      // Siswa Management
      case 'getSiswa':
        result = getSiswa();
        break;
      case 'createSiswa':
        result = createSiswa(data);
        break;
      case 'updateSiswa':
        result = updateSiswa(data);
        break;
      case 'deleteSiswa':
        result = deleteSiswa(data);
        break;
        
      // Presensi
      case 'getPresensi':
        result = getPresensi(data);
        break;
      case 'markPresensi':
        result = markPresensi(data);
        break;
        
      // Tugas & Nilai
      case 'getTugas':
        result = getTugas();
        break;
      case 'createTugas':
        result = createTugas(data);
        break;
      case 'getNilai':
        result = getNilai(data);
        break;
      case 'submitNilai':
        result = submitNilai(data);
        break;
        
      // Jurnal
      case 'getJurnal':
        result = getJurnal();
        break;
      case 'createJurnal':
        result = createJurnal(data);
        break;
      case 'updateJurnal':
        result = updateJurnal(data);
        break;
        
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Utility function to generate ID
function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

// Authentication functions
function handleLogin(data) {
  const sheet = getSpreadsheet().getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  
  for (let i = 1; i < users.length; i++) {
    const [id, nama, email, role, passwordHash] = users[i];
    if (email === data.email) {
      // In production, use proper password hashing
      const inputHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password).toString();
      if (passwordHash === inputHash) {
        const token = Utilities.getUuid();
        return {
          user: { id, nama, email, role },
          token: token
        };
      }
    }
  }
  throw new Error('Invalid credentials');
}

function handleRegister(data) {
  const sheet = getSpreadsheet().getSheetByName('Users');
  const id = generateId();
  const passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password).toString();
  
  sheet.appendRow([id, data.nama, data.email, data.role, passwordHash]);
  
  return { id, nama: data.nama, email: data.email, role: data.role };
}

// Dashboard functions
function getDashboardStats() {
  const ss = getSpreadsheet();
  
  const kelasSheet = ss.getSheetByName('Kelas');
  const siswaSheet = ss.getSheetByName('Siswa');
  const tugasSheet = ss.getSheetByName('Tugas');
  const nilaiSheet = ss.getSheetByName('Nilai');
  
  const totalKelas = kelasSheet.getLastRow() - 1;
  const totalSiswa = siswaSheet.getLastRow() - 1;
  
  const tugasData = tugasSheet.getDataRange().getValues();
  const tugasAktif = tugasData.filter((row, index) => index > 0 && row[5] === 'aktif').length;
  
  const nilaiData = nilaiSheet.getDataRange().getValues();
  const totalNilai = nilaiData.slice(1).reduce((sum, row) => sum + row[2], 0);
  const rataRataNilai = nilaiData.length > 1 ? (totalNilai / (nilaiData.length - 1)).toFixed(1) : 0;
  
  return {
    totalKelas,
    totalSiswa, 
    tugasAktif,
    rataRataNilai: parseFloat(rataRataNilai)
  };
}

function getRecentActivity() {
  // Mock data for now - in production, track actual activities
  return [
    {
      id: '1',
      type: 'assignment',
      title: 'Tugas Matematika dikumpulkan',
      user: 'Ahmad Pratama',
      time: '2 jam lalu',
      icon: '📝'
    },
    {
      id: '2',
      type: 'quiz',
      title: 'Nilai Quiz Fisika tersedia',
      user: 'Siti Nurhaliza',
      time: '4 jam lalu',
      icon: '🎯'
    },
    {
      id: '3',
      type: 'attendance',
      title: 'Presensi kelas 9A selesai',
      user: 'System',
      time: '1 hari lalu',
      icon: '✅'
    }
  ];
}

// Kelas Management functions
function getKelas() {
  const sheet = getSpreadsheet().getSheetByName('Kelas');
  const data = sheet.getDataRange().getValues();
  
  return data.slice(1).map(row => ({
    id: row[0],
    nama: row[1],
    mataPelajaran: row[2],
    jadwal: row[3],
    jumlahSiswa: row[4],
    status: row[5]
  }));
}

function createKelas(data) {
  const sheet = getSpreadsheet().getSheetByName('Kelas');
  const id = generateId();
  
  sheet.appendRow([id, data.nama, data.mataPelajaran, data.jadwal, data.jumlahSiswa, data.status]);
  
  return { id, ...data };
}

function updateKelas(data) {
  const sheet = getSpreadsheet().getSheetByName('Kelas');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      if (data.nama) values[i][1] = data.nama;
      if (data.mataPelajaran) values[i][2] = data.mataPelajaran;
      if (data.jadwal) values[i][3] = data.jadwal;
      if (data.jumlahSiswa) values[i][4] = data.jumlahSiswa;
      if (data.status) values[i][5] = data.status;
      break;
    }
  }
  
  dataRange.setValues(values);
  return data;
}

function deleteKelas(data) {
  const sheet = getSpreadsheet().getSheetByName('Kelas');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  
  return { success: true };
}

// Siswa Management functions
function getSiswa() {
  const sheet = getSpreadsheet().getSheetByName('Siswa');
  const data = sheet.getDataRange().getValues();
  
  return data.slice(1).map(row => ({
    id: row[0],
    nama: row[1],
    kelas: row[2],
    nomorInduk: row[3],
    email: row[4],
    foto: row[5]
  }));
}

function createSiswa(data) {
  const sheet = getSpreadsheet().getSheetByName('Siswa');
  const id = generateId();
  
  sheet.appendRow([id, data.nama, data.kelas, data.nomorInduk, data.email, data.foto || '']);
  
  return { id, ...data };
}

function updateSiswa(data) {
  const sheet = getSpreadsheet().getSheetByName('Siswa');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      if (data.nama) values[i][1] = data.nama;
      if (data.kelas) values[i][2] = data.kelas;
      if (data.nomorInduk) values[i][3] = data.nomorInduk;
      if (data.email) values[i][4] = data.email;
      if (data.foto) values[i][5] = data.foto;
      break;
    }
  }
  
  dataRange.setValues(values);
  return data;
}

function deleteSiswa(data) {
  const sheet = getSpreadsheet().getSheetByName('Siswa');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  
  return { success: true };
}

// Presensi functions
function getPresensi(data) {
  const sheet = getSpreadsheet().getSheetByName('Presensi');
  const allData = sheet.getDataRange().getValues();
  
  let filteredData = allData.slice(1);
  
  if (data.kelas) {
    filteredData = filteredData.filter(row => row[2] === data.kelas);
  }
  
  if (data.tanggal) {
    filteredData = filteredData.filter(row => row[1] === data.tanggal);
  }
  
  return filteredData.map(row => ({
    id: row[0],
    tanggal: row[1],
    kelas: row[2],
    siswa: row[3],
    status: row[4]
  }));
}

function markPresensi(data) {
  const sheet = getSpreadsheet().getSheetByName('Presensi');
  const id = generateId();
  
  sheet.appendRow([id, data.tanggal, data.kelas, data.siswa, data.status]);
  
  return { id, ...data };
}

// Tugas & Nilai functions
function getTugas() {
  const sheet = getSpreadsheet().getSheetByName('Tugas');
  const data = sheet.getDataRange().getValues();
  
  return data.slice(1).map(row => ({
    id: row[0],
    kelas: row[1],
    judul: row[2],
    deskripsi: row[3],
    deadline: row[4],
    status: row[5]
  }));
}

function createTugas(data) {
  const sheet = getSpreadsheet().getSheetByName('Tugas');
  const id = generateId();
  
  sheet.appendRow([id, data.kelas, data.judul, data.deskripsi, data.deadline, data.status]);
  
  return { id, ...data };
}

function getNilai(data) {
  const sheet = getSpreadsheet().getSheetByName('Nilai');
  const allData = sheet.getDataRange().getValues();
  
  let filteredData = allData.slice(1);
  
  if (data.tugasId) {
    filteredData = filteredData.filter(row => row[2] === data.tugasId);
  }
  
  return filteredData.map(row => ({
    id: row[0],
    siswa: row[1],
    tugas: row[2],
    nilai: row[3],
    tanggal: row[4]
  }));
}

function submitNilai(data) {
  const sheet = getSpreadsheet().getSheetByName('Nilai');
  const id = generateId();
  
  sheet.appendRow([id, data.siswa, data.tugas, data.nilai, data.tanggal]);
  
  return { id, ...data };
}

// Jurnal functions
function getJurnal() {
  const sheet = getSpreadsheet().getSheetByName('Jurnal');
  const data = sheet.getDataRange().getValues();
  
  return data.slice(1).map(row => ({
    id: row[0],
    tanggal: row[1],
    kelas: row[2],
    materi: row[3],
    kegiatan: row[4],
    refleksi: row[5]
  }));
}

function createJurnal(data) {
  const sheet = getSpreadsheet().getSheetByName('Jurnal');
  const id = generateId();
  
  sheet.appendRow([id, data.tanggal, data.kelas, data.materi, data.kegiatan, data.refleksi]);
  
  return { id, ...data };
}

function updateJurnal(data) {
  const sheet = getSpreadsheet().getSheetByName('Jurnal');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      if (data.tanggal) values[i][1] = data.tanggal;
      if (data.kelas) values[i][2] = data.kelas;
      if (data.materi) values[i][3] = data.materi;
      if (data.kegiatan) values[i][4] = data.kegiatan;
      if (data.refleksi) values[i][5] = data.refleksi;
      break;
    }
  }
  
  dataRange.setValues(values);
  return data;
}
