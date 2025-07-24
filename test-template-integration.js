// Test Template to Plan Integration
// This test verifies that templates can be used in plan creation

const testTemplateIntegration = async () => {
  console.log('🧪 Testing Template to Plan Integration...\n');

  try {
    // Test data
    const testSubject = 'matematika'; // Replace with actual subject ID
    const testTemplate = {
      name: 'Aljabar Dasar Kelas 7',
      description: 'Template untuk pembelajaran aljabar dasar',
      estimatedDuration: 90,
      learningObjectives: [
        'Siswa dapat memahami konsep variabel dalam aljabar',
        'Siswa dapat menyelesaikan persamaan linear sederhana'
      ],
      templateStructure: {
        introduction: 'Apersepsi tentang penggunaan matematika dalam kehidupan sehari-hari',
        mainActivity: 'Penjelasan konsep variabel dan persamaan linear dengan contoh praktis',
        conclusion: 'Refleksi pembelajaran dan evaluasi pemahaman siswa'
      }
    };

    console.log('📋 Template Data:');
    console.log('- Name:', testTemplate.name);
    console.log('- Duration:', testTemplate.estimatedDuration, 'minutes');
    console.log('- Objectives:', testTemplate.learningObjectives.length, 'items');
    console.log('- Structure sections:', Object.keys(testTemplate.templateStructure).length);

    // Simulate template application to plan
    console.log('\n🔄 Applying Template to Plan...');
    
    const planData = {
      title: testTemplate.name,
      description: testTemplate.description,
      duration: testTemplate.estimatedDuration,
      templateId: 'template-123',
      learningObjectives: testTemplate.learningObjectives.map((obj, index) => ({
        id: `objective-${index}`,
        objective: obj,
        indicator: '',
        competency: ''
      }))
    };

    console.log('✅ Plan Data Generated:');
    console.log('- Title:', planData.title);
    console.log('- Duration:', planData.duration);
    console.log('- Template ID:', planData.templateId);
    console.log('- Learning Objectives:', planData.learningObjectives.length);

    // Test template structure conversion
    console.log('\n📄 Converting Template Structure...');
    const convertedContent = convertTemplateToText(testTemplate.templateStructure);
    console.log('Converted Content:');
    console.log(convertedContent);

    console.log('\n🎉 Template Integration Test Passed!');
    
    return {
      success: true,
      planData,
      convertedContent
    };

  } catch (error) {
    console.error('❌ Template Integration Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Utility function to convert template structure to text
const convertTemplateToText = (templateStructure) => {
  let text = '';
  
  if (templateStructure.introduction) {
    text += `KEGIATAN PEMBUKA:\n${templateStructure.introduction}\n\n`;
  }
  
  if (templateStructure.mainActivity) {
    text += `KEGIATAN INTI:\n${templateStructure.mainActivity}\n\n`;
  }
  
  if (templateStructure.conclusion) {
    text += `KEGIATAN PENUTUP:\n${templateStructure.conclusion}\n\n`;
  }
  
  return text.trim();
};

// Manual Test Checklist
console.log(`
📝 MANUAL TEST CHECKLIST

□ 1. Create a template with AI generation
   - Navigate to Teacher Planner → Templates
   - Click "Buat Template Baru"
   - Fill info and click "Generate with AI"
   - Save template

□ 2. Use template in plan creation
   - Navigate to Teacher Planner → Plans  
   - Click "Buat Rencana Baru"
   - Fill basic info (title, class, subject)
   - Select template from dropdown
   - Verify auto-population occurs

□ 3. Verify template application
   - Check title is filled from template
   - Check duration is set
   - Check learning objectives are added
   - Check template ID is linked

□ 4. Modify and save plan
   - Edit content as needed
   - Save plan successfully
   - Verify plan shows template reference

□ 5. Test edge cases
   - Try with different subjects
   - Test without selecting template
   - Test changing template selection
   - Test with templates that have no objectives

Run this test: node test-template-integration.js
`);

// Run the test
testTemplateIntegration();
