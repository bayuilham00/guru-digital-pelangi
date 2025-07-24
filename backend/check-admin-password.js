// Check admin password
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@pelangi.sch.id' },
      select: { 
        id: true,
        email: true,
        fullName: true,
        role: true,
        password: true 
      }
    });

    if (user) {
      console.log('✅ Admin user found:');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.fullName);
      console.log('🔑 Role:', user.role);
      console.log('🔒 Password hash:', user.password);
      
      // Try to verify with common passwords
      const bcrypt = await import('bcryptjs');
      const commonPasswords = ['admin123', 'password', '123456', 'admin'];
      
      for (const password of commonPasswords) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log(`✅ Password found: "${password}"`);
          break;
        }
      }
      
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPassword();
