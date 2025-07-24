import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    // Test with exact data from login
    const identifier = 'admin@pelangi.sch.id';
    const password = 'admin123';
    
    console.log('Testing login with:', identifier, password);
    
    // Find user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { nip: identifier },
          { email: identifier }
        ]
      }
    });
    
    if (user) {
      console.log('User found:', user.email, user.fullName);
      console.log('User NIP:', user.nip);
      console.log('Stored password hash:', user.password);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password "${password}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    } else {
      console.log('User not found with OR search');
      
      // Try just email
      user = await prisma.user.findFirst({
        where: { email: identifier }
      });
      
      if (user) {
        console.log('User found by email only:', user.email);
      } else {
        console.log('User not found by email either');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
