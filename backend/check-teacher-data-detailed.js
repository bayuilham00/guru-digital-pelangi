import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTeacherData() {
    try {
        const teacherId = "cmd7drq5r000du8n8ym2alv3p";
        
        console.log('Checking teacher data for:', teacherId);
        
        // Check if teacher exists
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { id: true, fullName: true, role: true }
        });
        
        console.log('Teacher data:', teacher);
        
        // Check ClassTeacherSubject assignments
        const teacherSubjects = await prisma.classTeacherSubject.findMany({
            where: { 
                teacherId: teacherId,
                isActive: true
            },
            include: { 
                subject: true,
                class: true
            }
        });
        
        console.log('Teacher subjects assignments:', teacherSubjects);
        
        if (teacherSubjects.length > 0) {
            const subjectIds = teacherSubjects.map(ts => ts.subjectId);
            console.log('Subject IDs:', subjectIds);
            
            // Check assignments for these subjects
            const assignments = await prisma.assignment.findMany({
                where: { subjectId: { in: subjectIds } },
                include: { subject: true }
            });
            
            console.log('Assignments for teacher subjects:', assignments);
        }
        
    } catch (error) {
        console.error('Error checking teacher data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTeacherData();
