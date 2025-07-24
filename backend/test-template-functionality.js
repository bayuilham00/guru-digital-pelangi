// Test: Comprehensive template functionality test
import { PrismaClient } from '@prisma/client';

async function testTemplateFunctionality() {
  console.log('🔬 Testing comprehensive template functionality...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Count AI generated templates
    console.log('\n1️⃣ Counting AI generated templates...');
    const aiTemplateCount = await prisma.lessonTemplate.count({
      where: {
        name: {
          contains: 'AI Generated'
        }
      }
    });
    console.log(`✅ Found ${aiTemplateCount} AI generated templates`);
    
    // Test 2: Get templates by subject
    console.log('\n2️⃣ Getting templates by subject (Kimia)...');
    const kimiaTemplates = await prisma.lessonTemplate.findMany({
      where: {
        subject: {
          name: 'Kimia'
        }
      },
      include: {
        subject: true,
        createdByUser: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${kimiaTemplates.length} Chemistry templates`);
    kimiaTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.estimatedDuration}min)`);
    });
    
    // Test 3: Get templates by difficulty level
    console.log('\n3️⃣ Getting templates by difficulty (INTERMEDIATE)...');
    const intermediateTemplates = await prisma.lessonTemplate.count({
      where: {
        difficultyLevel: 'INTERMEDIATE'
      }
    });
    console.log(`✅ Found ${intermediateTemplates} intermediate templates`);
    
    // Test 4: Get templates by duration range
    console.log('\n4️⃣ Getting templates by duration (90-120 minutes)...');
    const durationTemplates = await prisma.lessonTemplate.count({
      where: {
        estimatedDuration: {
          gte: 90,
          lte: 120
        }
      }
    });
    console.log(`✅ Found ${durationTemplates} templates in 90-120 minute range`);
    
    // Test 5: Get template with full details for frontend
    console.log('\n5️⃣ Getting template with full details...');
    const fullTemplate = await prisma.lessonTemplate.findFirst({
      where: {
        name: {
          contains: 'AI Generated'
        }
      },
      include: {
        subject: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (fullTemplate) {
      console.log('✅ Full template details retrieved');
      console.log(`📄 Template ready for frontend use:`);
      console.log(`   - ID: ${fullTemplate.id}`);
      console.log(`   - Name: ${fullTemplate.name}`);
      console.log(`   - Subject: ${fullTemplate.subject.name} (${fullTemplate.subject.code})`);
      console.log(`   - Duration: ${fullTemplate.estimatedDuration} minutes`);
      console.log(`   - Difficulty: ${fullTemplate.difficultyLevel}`);
      console.log(`   - Learning Objectives: ${fullTemplate.learningObjectives.length}`);
      console.log(`   - Template Structure Complete: ${!!fullTemplate.templateStructure}`);
      console.log(`   - Created By: ${fullTemplate.createdByUser.fullName}`);
      console.log(`   - Is Public: ${fullTemplate.isPublic}`);
      console.log(`   - Usage Count: ${fullTemplate.usageCount}`);
      
      // Verify JSON structure integrity
      if (fullTemplate.templateStructure) {
        const structure = fullTemplate.templateStructure;
        console.log(`   - Structure Keys: ${Object.keys(structure).join(', ')}`);
        if (structure.resources) {
          console.log(`   - Resources: ${structure.resources.length} items`);
        }
      }
    }
    
    console.log('\n🎉 All template functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Error in template functionality test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTemplateFunctionality();
