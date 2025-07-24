import { PrismaClient } from '@prisma/client';
import { seedDefaultConfigs } from '../controllers/configController.js';

const prisma = new PrismaClient();

async function seedConfigs() {
  console.log('🌱 Seeding default configurations...\n');
  
  try {
    await seedDefaultConfigs();
    
    // Check seeded configs
    const configs = await prisma.config.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });
    
    console.log(`\n📊 Total configurations: ${configs.length}`);
    
    configs.forEach(config => {
      console.log(`✓ ${config.key}: "${config.value}" (${config.category})`);
      if (config.description) {
        console.log(`  └─ ${config.description}`);
      }
    });
    
    console.log('\n✅ Configuration seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding configurations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedConfigs();
