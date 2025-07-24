// Test authentication and check user role
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔧 Testing authentication...');
    
    // Find an admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });

    if (!adminUser) {
      console.log('❌ No admin user found in database');
      
      // Create admin user
      const hashedPassword = await import('bcryptjs').then(bcrypt => 
        bcrypt.hash('admin123', 10)
      );
      
      const newAdmin = await prisma.user.create({
        data: {
          fullName: 'Admin System',
          email: 'admin@guru.digital',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Created admin user:', newAdmin.email);
      console.log('📧 Email: admin@guru.digital');
      console.log('🔑 Password: admin123');
      
      return;
    }

    console.log('✅ Found admin user:', adminUser);
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';
    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated JWT token for admin:');
    console.log(token);
    console.log('\n📋 Use this token for testing:');
    console.log(`localStorage.setItem('auth_token', '${token}');`);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified, payload:', decoded);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
