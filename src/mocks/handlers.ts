import { http, HttpResponse } from 'msw'

// API base URL - match backend server
const API_BASE = 'http://localhost:5000/api'

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { identifier: string; password: string }
    
    // Mock successful admin login
    if (body.identifier === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '1',
            fullName: 'Test Admin',
            email: 'test@example.com',
            role: 'ADMIN',
            profilePhoto: null
          },
          token: 'mock-jwt-token'
        }
      })
    }

    // Mock successful teacher login
    if (body.identifier === '123456789012345678' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '2',
            fullName: 'Test Teacher',
            nip: '123456789012345678',
            role: 'GURU',
            profilePhoto: null
          },
          token: 'mock-jwt-token-teacher'
        }
      })
    }

    // Mock successful student login
    if (body.identifier === '1234567890' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '3',
            fullName: 'Test Student',
            nisn: '1234567890',
            role: 'SISWA',
            profilePhoto: null
          },
          token: 'mock-jwt-token-student'
        }
      })
    }
    
    // Mock failed login
    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid credentials'
      },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  }),

  // Class endpoints
  http.get(`${API_BASE}/classes`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Kelas 7A',
          grade: '7',
          section: 'A',
          students: 25,
          subjects: ['Matematika', 'IPA', 'Bahasa Indonesia']
        },
        {
          id: '2',
          name: 'Kelas 7B',
          grade: '7',
          section: 'B',
          students: 23,
          subjects: ['Matematika', 'IPA', 'Bahasa Indonesia']
        }
      ]
    })
  }),

  http.get(`${API_BASE}/classes/:classId/full`, ({ params }) => {
    const { classId } = params
    
    return HttpResponse.json({
      success: true,
      data: {
        id: classId,
        name: `Kelas ${classId}A`,
        grade: classId,
        section: 'A',
        students: [
          {
            id: '1',
            fullName: 'Ahmad Budi',
            email: 'ahmad@example.com',
            studentId: 'STD001'
          },
          {
            id: '2',
            fullName: 'Siti Aisyah',
            email: 'siti@example.com',
            studentId: 'STD002'
          }
        ],
        subjects: [
          {
            id: '1',
            name: 'Matematika',
            teacher: 'Pak Joko'
          },
          {
            id: '2',
            name: 'IPA',
            teacher: 'Bu Ani'
          }
        ],
        classTeacherSubjects: []
      }
    })
  }),

  // Student endpoints
  http.get(`${API_BASE}/students`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          fullName: 'Ahmad Budi',
          email: 'ahmad@example.com',
          studentId: 'STD001',
          classId: '1',
          className: 'Kelas 7A'
        },
        {
          id: '2',
          fullName: 'Siti Aisyah',
          email: 'siti@example.com',
          studentId: 'STD002',
          classId: '1',
          className: 'Kelas 7A'
        }
      ]
    })
  }),

  http.post(`${API_BASE}/students`, async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      data: {
        id: '3',
        ...body,
        createdAt: new Date().toISOString()
      }
    })
  }),

  // Dashboard endpoints
  http.get(`${API_BASE}/dashboard/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalStudents: 150,
        totalClasses: 6,
        totalTeachers: 12,
        totalSubjects: 8,
        todayAttendance: 142,
        attendanceRate: 94.7
      }
    })
  }),

  http.get(`${API_BASE}/dashboard/activities`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          type: 'attendance',
          message: 'Presensi Kelas 7A telah diisi',
          timestamp: new Date().toISOString(),
          user: 'Bu Ani'
        },
        {
          id: '2',
          type: 'grade',
          message: 'Nilai Matematika Kelas 7B telah diupdate',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Pak Joko'
        }
      ]
    })
  }),

  // Error handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json(
      { message: 'Mock handler not found' },
      { status: 404 }
    )
  })
]
