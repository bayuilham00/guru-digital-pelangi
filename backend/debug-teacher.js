import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTeacherData() {
    try {
        const teacherId = "cmd7drq5r000du8n8ym2alv3p";
        
        console.log('Checking teacher data for:', teacherId);
        
        // Check if teacher exists
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId }
        });
        
        console.log('Teacher found:', teacher ? 'Yes' : 'No');
        if (teacher) {
            console.log('Teacher role:', teacher.role);
        }
        
        // Check ClassTeacherSubject entries
        const classTeacherSubjects = await prisma.classTeacherSubject.findMany({
            where: {
                teacherId: teacherId
            },
            include: {
                subject: true,
                class: true
            }
        });
        
        console.log('ClassTeacherSubject entries:', classTeacherSubjects.length);
        classTeacherSubjects.forEach((cts, index) => {
            console.log(`${index + 1}. Subject: ${cts.subject.name}, Class: ${cts.class.name}, Active: ${cts.isActive}`);
        });
        
        // Check assignments
        const assignments = await prisma.assignment.findMany({
            where: {
                teacherId: teacherId
            },
            include: {
                subject: true
            }
        });
        
        console.log('Assignments created by teacher:', assignments.length);
        assignments.forEach((assignment, index) => {
            console.log(`${index + 1}. ${assignment.title} - Subject: ${assignment.subject?.name || 'No subject'}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTeacherData();
