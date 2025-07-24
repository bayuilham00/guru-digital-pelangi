// Check existing users in the system
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const checkUsers = async () => {
  try {
    console.log('Checking existing users in the system...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nip: true,
        fullName: true,
        role: true,
        status: true
      }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.email}) - Role: ${user.role}, Status: ${user.status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

checkUsers();
