// Test Database Connection Script
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful:', result);
    
    // Check if tables exist
    try {
      const schoolCount = await prisma.school.count();
      console.log(`✅ Schools table exists with ${schoolCount} records`);
    } catch (error) {
      console.log('⚠️  Tables not yet created - need to run migrations');
    }
    
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('💡 Possible solutions:');
      console.error('   - Check if MySQL server is running');
      console.error('   - Verify hostname and port');
      console.error('   - Check firewall settings');
    } else if (error.code === 'P1000') {
      console.error('💡 Authentication failed:');
      console.error('   - Check username and password');
      console.error('   - Verify user permissions');
    } else if (error.code === 'P1003') {
      console.error('💡 Database does not exist:');
      console.error('   - Create database: CREATE DATABASE guru_digital_pelangi;');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
