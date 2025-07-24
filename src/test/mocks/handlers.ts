import { http, HttpResponse } from 'msw';
import type { User, Class, Student, ApiResponse } from '../../types/api';

// Mock data
const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'teacher',
  fullName: 'Test User Full Name'
};

const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2024/2025',
    teacherId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Kelas 8B',
    grade: '8', 
    academicYear: '2024/2025',
    teacherId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    nisn: '1234567890',
    classId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    nisn: '0987654321',
    classId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { identifier: string; password: string };
    
    if (body.identifier === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token'
        }
      } as ApiResponse);
    }
    
    return HttpResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: mockUser
    });
  }),

  // Classes endpoints
  http.get('/api/classes', () => {
    return HttpResponse.json({
      success: true,
      data: mockClasses,
      total: mockClasses.length
    });
  }),

  http.get('/api/classes/:id', ({ params }) => {
    const classId = params.id as string;
    const foundClass = mockClasses.find(c => c.id === classId);
    
    if (!foundClass) {
      return HttpResponse.json({
        success: false,
        message: 'Class not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: foundClass
    });
  }),

  http.get('/api/classes/:id/full', ({ params }) => {
    const classId = params.id as string;
    const foundClass = mockClasses.find(c => c.id === classId);
    
    if (!foundClass) {
      return HttpResponse.json({
        success: false,
        message: 'Class not found'
      }, { status: 404 });
    }

    const classStudents = mockStudents.filter(s => s.classId === classId);

    return HttpResponse.json({
      success: true,
      data: {
        ...foundClass,
        students: classStudents,
        studentCount: classStudents.length,
        subjects: [],
        teachers: []
      }
    });
  }),

  http.post('/api/classes', async ({ request }) => {
    const body = await request.json() as Partial<Class>;
    
    const newClass: Class = {
      id: (mockClasses.length + 1).toString(),
      name: body.name || '',
      grade: body.grade || '',
      academicYear: body.academicYear || '2024/2025',
      teacherId: body.teacherId || '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockClasses.push(newClass);

    return HttpResponse.json({
      success: true,
      data: newClass
    }, { status: 201 });
  }),

  http.put('/api/classes/:id', async ({ params, request }) => {
    const classId = params.id as string;
    const body = await request.json() as Partial<Class>;
    const classIndex = mockClasses.findIndex(c => c.id === classId);
    
    if (classIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Class not found'
      }, { status: 404 });
    }

    mockClasses[classIndex] = {
      ...mockClasses[classIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: mockClasses[classIndex]
    });
  }),

  http.delete('/api/classes/:id', ({ params }) => {
    const classId = params.id as string;
    const classIndex = mockClasses.findIndex(c => c.id === classId);
    
    if (classIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Class not found'
      }, { status: 404 });
    }

    mockClasses.splice(classIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Class deleted successfully'
    });
  }),

  // Students endpoints
  http.get('/api/students', () => {
    return HttpResponse.json({
      success: true,
      data: mockStudents,
      total: mockStudents.length
    });
  }),

  http.get('/api/students/:id', ({ params }) => {
    const studentId = params.id as string;
    const foundStudent = mockStudents.find(s => s.id === studentId);
    
    if (!foundStudent) {
      return HttpResponse.json({
        success: false,
        message: 'Student not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: foundStudent
    });
  }),

  http.post('/api/students', async ({ request }) => {
    const body = await request.json() as Partial<Student>;
    
    const newStudent: Student = {
      id: (mockStudents.length + 1).toString(),
      name: body.name || '',
      email: body.email || '',
      nisn: body.nisn || '',
      classId: body.classId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockStudents.push(newStudent);

    return HttpResponse.json({
      success: true,
      data: newStudent
    }, { status: 201 });
  }),

  // Dashboard endpoints
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalClasses: mockClasses.length,
        totalStudents: mockStudents.length,
        totalTeachers: 5,
        attendanceRate: 95.5
      }
    });
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    });
  }),

  // Catch all unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({
      success: false,
      message: `Unhandled request: ${request.method} ${request.url}`
    }, { status: 404 });
  })
];