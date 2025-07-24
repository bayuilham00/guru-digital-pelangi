// Test badge update and delete operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testBadgeOperations = async () => {
  try {
    console.log('Testing badge operations...');
    
    // First, get existing badges
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      take: 1
    });

    if (badges.length === 0) {
      console.log('No badges found, creating a test badge first...');
      
      const newBadge = await prisma.badge.create({
        data: {
          name: 'Test Badge',
          description: 'A test badge for testing operations',
          icon: '🏆',
          xpReward: 50
        }
      });
      
      console.log('Created test badge:', newBadge);
      
      // Test update
      console.log('\nTesting badge update...');
      const updatedBadge = await prisma.badge.update({
        where: { id: newBadge.id },
        data: {
          name: 'Updated Test Badge',
          description: 'Updated description',
          xpReward: 75
        }
      });
      
      console.log('Updated badge:', updatedBadge);
      
      // Test delete (check usage first)
      console.log('\nTesting badge delete...');
      const badgeUsage = await prisma.studentBadge.count({
        where: { badgeId: newBadge.id }
      });
      
      console.log('Badge usage count:', badgeUsage);
      
      if (badgeUsage === 0) {
        await prisma.badge.delete({
          where: { id: newBadge.id }
        });
        console.log('Badge deleted successfully');
      } else {
        console.log('Badge has usage, skipping delete test');
      }
      
    } else {
      const testBadge = badges[0];
      console.log('Using existing badge for test:', testBadge);
      
      // Test update
      console.log('\nTesting badge update...');
      const updatedBadge = await prisma.badge.update({
        where: { id: testBadge.id },
        data: {
          name: testBadge.name + ' (Updated)',
          description: (testBadge.description || '') + ' - Updated for test'
        }
      });
      
      console.log('Updated badge:', updatedBadge);
      
      // Restore original values
      await prisma.badge.update({
        where: { id: testBadge.id },
        data: {
          name: testBadge.name,
          description: testBadge.description
        }
      });
      
      console.log('Restored original badge values');
    }
    
  } catch (error) {
    console.error('Error in badge operations:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
};

testBadgeOperations();
