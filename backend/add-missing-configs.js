// Quick script to add missing configuration fields
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_CONFIGS = [
  {
    key: 'SCHOOL_ADDRESS',
    value: 'Jl. Pendidikan No. 123, Kecamatan Buay Rawan, Kabupaten Way Kanan, Lampung',
    description: 'School address',
    category: 'school'
  },
  {
    key: 'SCHOOL_PHONE',
    value: '(0721) 123-4567',
    description: 'School phone number',
    category: 'school'
  },
  {
    key: 'SCHOOL_EMAIL',
    value: 'info@smpn01buayrawan.sch.id',
    description: 'School email address',
    category: 'school'
  },
  {
    key: 'PRINCIPAL_NAME',
    value: 'Dr. Ahmad Syarifudin, M.Pd',
    description: 'Principal name',
    category: 'school'
  },
  {
    key: 'PRINCIPAL_NIP',
    value: '197801012005011002',
    description: 'Principal NIP (ID number)',
    category: 'school'
  }
];

async function addMissingConfigs() {
  console.log('🔧 Adding missing configuration fields...\n');
  
  try {
    for (const config of NEW_CONFIGS) {
      const existing = await prisma.config.findUnique({
        where: { key: config.key }
      });
      
      if (existing) {
        if (!existing.value || existing.value.trim() === '') {
          // Update empty value
          await prisma.config.update({
            where: { key: config.key },
            data: { 
              value: config.value,
              updatedAt: new Date()
            }
          });
          console.log(`✅ Updated ${config.key}: "${config.value}"`);
        } else {
          console.log(`✓ ${config.key} already has value: "${existing.value}"`);
        }
      } else {
        // Create new config
        await prisma.config.create({
          data: {
            key: config.key,
            value: config.value,
            description: config.description,
            category: config.category,
            isActive: true
          }
        });
        console.log(`➕ Created ${config.key}: "${config.value}"`);
      }
    }
    
    console.log('\n🎉 Configuration update completed!');
    console.log('📋 You can now see all fields in the frontend.\n');
    
  } catch (error) {
    console.error('❌ Error updating configurations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingConfigs();
