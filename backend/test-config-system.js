import { PrismaClient } from '@prisma/client';
import { getConfigValue } from './controllers/configController.js';

const prisma = new PrismaClient();

async function testConfigSystem() {
  console.log('🧪 Testing Configuration System...\n');
  
  try {
    // 1. Check if configs exist
    const configs = await prisma.config.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });
    
    console.log(`📊 Found ${configs.length} configurations:`);
    configs.forEach(config => {
      console.log(`  ✓ ${config.key}: "${config.value}" (${config.category})`);
    });
    
    console.log('\n🔧 Testing config value retrieval:');
    
    // 2. Test getConfigValue helper
    const schoolId = await getConfigValue('DEFAULT_SCHOOL_ID');
    console.log(`  - DEFAULT_SCHOOL_ID: ${schoolId || 'null'}`);
    
    const academicYear = await getConfigValue('DEFAULT_ACADEMIC_YEAR');
    console.log(`  - DEFAULT_ACADEMIC_YEAR: ${academicYear || 'null'}`);
    
    const schoolName = await getConfigValue('SCHOOL_NAME');
    console.log(`  - SCHOOL_NAME: ${schoolName || 'null'}`);
    
    const initialized = await getConfigValue('SYSTEM_INITIALIZED');
    console.log(`  - SYSTEM_INITIALIZED: ${initialized || 'null'}`);
    
    // 3. Test creating a class with config values
    console.log('\n🏫 Testing class creation with config values:');
    
    const testClassName = `Test Class ${Date.now()}`;
    
    // Simulate class creation logic
    const defaultSchoolId = await getConfigValue('DEFAULT_SCHOOL_ID');
    const defaultAcademicYear = await getConfigValue('DEFAULT_ACADEMIC_YEAR');
    
    const mockClassData = {
      name: testClassName,
      gradeLevel: 'VIII',
      schoolId: defaultSchoolId || null,
      academicYear: defaultAcademicYear || '2024/2025',
      description: 'Test class for config system'
    };
    
    console.log('  Mock class data:', JSON.stringify(mockClassData, null, 4));
    
    // Don't actually create the class, just show what would happen
    console.log(`  ✓ Class "${testClassName}" would be created with:`);
    console.log(`    - School ID: ${mockClassData.schoolId || 'null'}`);
    console.log(`    - Academic Year: ${mockClassData.academicYear}`);
    
    // 4. Test system status
    console.log('\n📋 System Status:');
    
    const systemInitialized = initialized === 'true';
    console.log(`  - System Initialized: ${systemInitialized ? '✅ YES' : '❌ NO'}`);
    
    if (systemInitialized) {
      console.log(`  - Ready for use: ✅ YES`);
    } else {
      console.log(`  - Ready for use: ⚠️ NO - Run initialization first`);
    }
    
    console.log('\n✅ Configuration system test completed successfully!');
    
    // 5. Show API endpoints available
    console.log('\n🌐 Available API Endpoints:');
    console.log('  GET  /api/config/status        - Check system status');
    console.log('  POST /api/config/initialize    - Initialize system');
    console.log('  GET  /api/config               - Get all configs (requires auth)');
    console.log('  GET  /api/config/:key          - Get specific config (requires auth)');
    console.log('  PUT  /api/config/:key          - Update specific config (requires auth)');
    console.log('  PUT  /api/config               - Update multiple configs (requires auth)');
    
  } catch (error) {
    console.error('❌ Error testing config system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConfigSystem();
