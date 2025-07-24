// Test: Verify saved AI template can be retrieved
import { PrismaClient } from '@prisma/client';

async function testRetrieveTemplate() {
  console.log('🔍 Testing template retrieval...');
  
  const prisma = new PrismaClient();
  
  try {
    // Get the most recent template
    const template = await prisma.lessonTemplate.findFirst({
      where: {
        name: {
          contains: 'AI Generated'
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
    
    if (template) {
      console.log('✅ Template retrieved successfully');
      console.log(`📝 ID: ${template.id}`);
      console.log(`📝 Name: ${template.name}`);
      console.log(`📝 Subject: ${template.subject.name}`);
      console.log(`📝 Created by: ${template.createdByUser.fullName}`);
      console.log(`📝 Duration: ${template.estimatedDuration} minutes`);
      console.log(`📝 Difficulty: ${template.difficultyLevel}`);
      console.log(`📝 Learning objectives: ${template.learningObjectives.length}`);
      console.log(`📝 Usage count: ${template.usageCount}`);
      console.log(`📝 Created at: ${template.createdAt}`);
      
      // Verify template structure
      if (template.templateStructure) {
        console.log('📝 Template structure complete:');
        console.log(`   - Introduction: ${!!template.templateStructure.introduction}`);
        console.log(`   - Main Activity: ${!!template.templateStructure.mainActivity}`);
        console.log(`   - Conclusion: ${!!template.templateStructure.conclusion}`);
        console.log(`   - Assessment: ${!!template.templateStructure.assessment}`);
        console.log(`   - Resources: ${template.templateStructure.resources?.length || 0}`);
      }
    } else {
      console.log('❌ No AI generated template found');
    }
  } catch (error) {
    console.error('❌ Error retrieving template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRetrieveTemplate();
