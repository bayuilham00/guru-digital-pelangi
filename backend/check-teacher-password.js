import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkTeacherPassword() {
  console.log('🔍 Checking teacher password...\n');
  
  try {
    const teacher = await prisma.user.findFirst({
      where: { 
        email: 'matematika@smpn01buayrawan.sch.id'
      }
    });
    
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('✅ Teacher found:', teacher.fullName);
    console.log('📧 Email:', teacher.email);
    console.log('🔑 Password hash:', teacher.password);
    
    // Test common passwords
    const testPasswords = ['password123', 'password', '123456', 'guru123', 'admin123'];
    
    console.log('\n🔍 Testing common passwords...');
    for (const pwd of testPasswords) {
      const isMatch = await bcrypt.compare(pwd, teacher.password);
      console.log(`- ${pwd}: ${isMatch ? '✅ MATCH' : '❌ No match'}`);
      
      if (isMatch) {
        console.log(`\n🎉 Password found: ${pwd}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeacherPassword();
