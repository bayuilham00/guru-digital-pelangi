// Test database save for AI template generation
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testDatabaseSave() {
  console.log('🔍 Testing database save for AI template...\n');

  try {
    // Step 1: Check if we can connect to database
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Step 2: Find a subject
    console.log('\n2️⃣ Finding available subjects...');
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true, code: true },
      take: 5
    });
    
    console.log('📝 Available subjects:', subjects);
    
    if (subjects.length === 0) {
      throw new Error('No subjects found in database');
    }

    const firstSubject = subjects[0];
    console.log('📚 Using subject:', firstSubject);

    // Step 3: Find a user to use as creator
    console.log('\n3️⃣ Finding available users...');
    const users = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'GURU'] } },
      select: { id: true, fullName: true, role: true },
      take: 5
    });
    
    console.log('👥 Available users:', users);
    
    if (users.length === 0) {
      throw new Error('No users found in database');
    }

    const firstUser = users[0];
    console.log('👤 Using user:', firstUser);

    // Step 4: Try to save a minimal template
    console.log('\n4️⃣ Attempting to save template...');
    
    const templateData = {
      name: 'Test AI Template',
      description: 'Template created for database test',
      subjectId: firstSubject.id,
      createdBy: firstUser.id,
      estimatedDuration: 90,
      isPublic: false,
      learningObjectives: ['Test objective 1', 'Test objective 2'],
      templateStructure: {
        introduction: 'Test introduction',
        mainActivity: 'Test main activity',
        conclusion: 'Test conclusion',
        assessment: {
          type: 'formative',
          criteria: 'Test criteria'
        },
        resources: ['Resource 1', 'Resource 2']
      },
      difficultyLevel: 'INTERMEDIATE',
      gradeLevel: '7-9'
    };

    console.log('💾 Template data to save:', JSON.stringify(templateData, null, 2));

    const savedTemplate = await prisma.lessonTemplate.create({
      data: templateData,
      include: {
        subject: {
          select: { id: true, name: true, code: true }
        },
        createdByUser: {
          select: { id: true, fullName: true }
        }
      }
    });

    console.log('\n✅ Template saved successfully!');
    console.log('📝 Saved template:', {
      id: savedTemplate.id,
      name: savedTemplate.name,
      subject: savedTemplate.subject,
      createdByUser: savedTemplate.createdByUser,
      estimatedDuration: savedTemplate.estimatedDuration,
      difficultyLevel: savedTemplate.difficultyLevel
    });

    // Step 5: Clean up - delete the test template
    console.log('\n5️⃣ Cleaning up test data...');
    await prisma.lessonTemplate.delete({
      where: { id: savedTemplate.id }
    });
    console.log('✅ Test template deleted');

  } catch (error) {
    console.error('\n❌ Database save test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);

    // Additional error details for Prisma errors
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
    }
    if (error.meta) {
      console.error('Prisma Error Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the test
testDatabaseSave().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
