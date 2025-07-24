// Simple MySQL Connection Test
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testMySQLConnection() {
  try {
    console.log('🔍 Testing MySQL connection...');
    
    // Coba beberapa kemungkinan host
    const hosts = [
      'alpha_guruku',
      'alpha_guruku.com',
      // Ganti dengan IP address VPS Anda jika tahu
      // '123.456.789.012'
    ];

    let connection = null;
    let lastError = null;

    for (const host of hosts) {
      try {
        console.log(`🔍 Trying host: ${host}`);
        connection = await mysql.createConnection({
          host: host,
          port: 3306,
          user: 'blinkihc',
          password: '39255471f76e90383731',
          database: 'guru_digital_pelangi',
          connectTimeout: 10000, // 10 seconds timeout
          acquireTimeout: 10000,
          timeout: 10000
        });
        console.log(`✅ Connected successfully to: ${host}`);
        break;
      } catch (error) {
        console.log(`❌ Failed to connect to ${host}: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    if (!connection) {
      throw lastError || new Error('All connection attempts failed');
    }
    
    console.log('✅ MySQL connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    // Check database
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 Available databases:', databases.map(db => db.Database));
    
    await connection.end();
    console.log('🎉 Connection test completed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Check:');
    console.error('   - VPS MySQL is running');
    console.error('   - Firewall allows port 3306');
    console.error('   - Credentials are correct');
  }
}

testMySQLConnection();
