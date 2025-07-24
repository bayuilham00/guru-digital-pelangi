// Test badges API endpoint
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testBadges = async () => {
  try {
    console.log('Testing badges query...');
    
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      include: {
        studentBadges: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${badges.length} badges`);
    console.log('Badges:', badges.map(b => ({ id: b.id, name: b.name, icon: b.icon })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testBadges();
