const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWQ3ZHJxNXIwMDBkdThuOHltMmFsdjNwIiwiaWF0IjoxNzUyODE5Mzk1LCJleHAiOjE3NTM0MjQxOTV9.92msMkcJWaHn4oCcrkwmm0v6nypIRo3hv82JuH7Blkg";

try {
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);
    
    // Check if expired
    const now = Math.floor(Date.now() / 1000);
    console.log('Current time:', now);
    console.log('Token exp:', decoded.exp);
    console.log('Is expired:', now > decoded.exp);
    
} catch (error) {
    console.error('Error decoding token:', error);
}
