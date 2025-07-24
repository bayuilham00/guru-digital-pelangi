// Manual Login Helper for Bank Soal Testing
// Run this in the browser console on the login page

// Step 1: Auto-fill the login form
function autoFillLoginForm() {
  console.log('🔧 Auto-filling login form...');
  
  // Find the email/identifier input field
  const emailInput = document.querySelector('input[name="identifier"]') || 
                    document.querySelector('input[type="email"]') ||
                    document.querySelector('input[placeholder*="email"]') ||
                    document.querySelector('input[placeholder*="Email"]');
  
  // Find the password input field
  const passwordInput = document.querySelector('input[name="password"]') ||
                       document.querySelector('input[type="password"]');
  
  if (emailInput && passwordInput) {
    emailInput.value = 'admin@pelangi.sch.id';
    passwordInput.value = 'admin123';
    
    // Trigger input events to ensure React state updates
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Form filled with admin credentials');
    console.log('📧 Email:', emailInput.value);
    console.log('🔒 Password:', passwordInput.value);
    
    // Try to find and click the login button
    const loginButton = document.querySelector('button[type="submit"]') ||
                       document.querySelector('button:contains("Login")') ||
                       document.querySelector('button:contains("Masuk")');
    
    if (loginButton) {
      console.log('🔘 Found login button, clicking...');
      loginButton.click();
    } else {
      console.log('⚠️ Please click the login button manually');
    }
  } else {
    console.log('❌ Could not find email or password inputs');
  }
}

// Step 2: Manually set authentication token (if needed)
function setAuthToken() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNqZ2hwbDUwMDAwdTgyc29vOHlsMHR6IiwiaWF0IjoxNzUxNjU1MzQ1LCJleHAiOjE3NTIyNjAxNDV9.oXiQ6Uc2L0x7ePO4FshfvZ3O-MY0D5XpXnlUscP2_gU';
  
  // Set token in localStorage
  localStorage.setItem('authToken', token);
  
  // Set user data in localStorage (if needed)
  const userData = {
    id: "cmcjghpl50000u82soo8yl0tz",
    name: "Admin Utama",
    email: "admin@pelangi.sch.id",
    nip: "ADMIN001",
    role: "ADMIN"
  };
  
  localStorage.setItem('authUser', JSON.stringify(userData));
  
  console.log('✅ Authentication token set in localStorage');
  console.log('👤 User data:', userData);
  
  // Reload the page to apply authentication
  window.location.reload();
}

// Step 3: Check current authentication status
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  
  console.log('🔍 Current authentication status:');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('User:', user ? JSON.parse(user) : 'Missing');
  
  if (token && user) {
    console.log('✅ User is authenticated');
    return true;
  } else {
    console.log('❌ User is not authenticated');
    return false;
  }
}

// Instructions
console.log(`
🚀 Bank Soal Authentication Helper
==================================

1. Auto-fill login form:
   autoFillLoginForm()

2. Check authentication status:
   checkAuthStatus()

3. Manually set auth token (if login fails):
   setAuthToken()

4. Go to Bank Soal:
   window.location.href = '/bank-soal'

Credentials:
📧 Email: admin@pelangi.sch.id
🔒 Password: admin123
`);

// Auto-execute if on login page
if (window.location.pathname.includes('/login')) {
  console.log('🔍 Login page detected, auto-filling form...');
  setTimeout(autoFillLoginForm, 1000);
}
