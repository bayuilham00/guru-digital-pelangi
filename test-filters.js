// Test filter subject functionality
const API_BASE = 'http://localhost:5000/api';

async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'admin@pelangi.sch.id',
        password: 'admin123'
      })
    });

    const data = await response.json();
    if (data.success) {
      return data.data.token;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function testFilters() {
  console.log('🔍 Testing Filters...');

  try {
    const token = await login();
    console.log('✅ Login successful');

    // Get subjects first
    const subjectsResponse = await fetch(`${API_BASE}/subjects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const subjectsData = await subjectsResponse.json();
    console.log('📚 Found subjects:', subjectsData.data.length);
    const testSubject = subjectsData.data[0];
    console.log('🎯 Testing with subject:', testSubject.name, '(ID:', testSubject.id + ')');

    // Test 1: All plans
    console.log('\n1️⃣ Testing all plans...');
    const allResponse = await fetch(`${API_BASE}/teacher-planner/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const allData = await allResponse.json();
    console.log('All plans:', allData.data.length, 'total:', allData.pagination.total);

    // Test 2: Filter by subject
    console.log('\n2️⃣ Testing subject filter...');
    const subjectResponse = await fetch(`${API_BASE}/teacher-planner/plans?subjectId=${testSubject.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const subjectData = await subjectResponse.json();
    console.log('Filtered by subject:', subjectData.data.length, 'plans');
    subjectData.data.forEach((plan, i) => {
      console.log(`  Plan ${i+1}: ${plan.title} - Subject: ${plan.subject?.name}`);
    });

    // Test 3: Sort by title
    console.log('\n3️⃣ Testing sort by title...');
    const sortResponse = await fetch(`${API_BASE}/teacher-planner/plans?sortBy=title&sortOrder=asc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const sortData = await sortResponse.json();
    console.log('Sorted by title (A-Z):');
    sortData.data.slice(0, 5).forEach((plan, i) => {
      console.log(`  ${i+1}. ${plan.title}`);
    });

    // Test 4: Pagination
    console.log('\n4️⃣ Testing pagination...');
    const pageResponse = await fetch(`${API_BASE}/teacher-planner/plans?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const pageData = await pageResponse.json();
    console.log('Page 1 (limit 5):', pageData.data.length, 'plans');
    console.log('Pagination:', pageData.pagination);

    console.log('\n✅ All filter tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFilters();
