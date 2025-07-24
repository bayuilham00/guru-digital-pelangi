// Test file for Bank Soal API integration
// Run this to verify all API endpoints are working correctly

const BASE_URL = 'http://localhost:5000';

// Test login credentials
const TEST_LOGIN = {
  identifier: 'admin@pelangi.sch.id',
  password: 'admin123'
};

let AUTH_TOKEN = null;

// Get authentication token
const getAuthToken = async () => {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  
  console.log('🔐 Getting authentication token...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_LOGIN)
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    AUTH_TOKEN = data.token;
    console.log('✅ Authentication successful');
    return AUTH_TOKEN;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error);
    return { error };
  }
};

// Test data
const testQuestionData = {
  questionText: "Siapa presiden pertama Indonesia?",
  questionType: "MULTIPLE_CHOICE",
  difficulty: "EASY",
  subjectId: "1", // Assuming subject ID 1 exists
  gradeLevel: "12",
  correctAnswer: "A",
  explanation: "Ir. Soekarno adalah presiden pertama Indonesia",
  points: 10,
  timeLimit: 120,
  tags: ["sejarah", "indonesia", "presiden"],
  isPublic: true,
  options: [
    { text: "Ir. Soekarno", isCorrect: true },
    { text: "Soeharto", isCorrect: false },
    { text: "B.J. Habibie", isCorrect: false },
    { text: "Abdurrahman Wahid", isCorrect: false }
  ]
};

const testQuestionBankData = {
  title: "Bank Soal Sejarah Indonesia",
  description: "Koleksi soal sejarah Indonesia untuk kelas 12",
  subjectId: "1",
  isPublic: true,
  tags: ["sejarah", "indonesia", "kelas12"]
};

const testTopicData = {
  name: "Kemerdekaan Indonesia",
  description: "Topik tentang kemerdekaan Indonesia",
  subjectId: "1"
};

// Test functions
const testGetQuestions = () => apiCall('/api/bank-soal/questions');

const testGetQuestionById = (id) => apiCall(`/api/bank-soal/questions/${id}`);

const testCreateQuestion = () => apiCall('/api/bank-soal/questions', {
  method: 'POST',
  body: JSON.stringify(testQuestionData)
});

const testUpdateQuestion = (id) => apiCall(`/api/bank-soal/questions/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    ...testQuestionData,
    questionText: "Siapa presiden pertama Indonesia? (Updated)"
  })
});

const testDeleteQuestion = (id) => apiCall(`/api/bank-soal/questions/${id}`, {
  method: 'DELETE'
});

const testGetQuestionBanks = () => apiCall('/api/bank-soal/banks');

const testCreateQuestionBank = () => apiCall('/api/bank-soal/banks', {
  method: 'POST',
  body: JSON.stringify(testQuestionBankData)
});

const testGetQuestionBankById = (id) => apiCall(`/api/bank-soal/banks/${id}`);

const testUpdateQuestionBank = (id) => apiCall(`/api/bank-soal/banks/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    ...testQuestionBankData,
    title: "Bank Soal Sejarah Indonesia (Updated)"
  })
});

const testDeleteQuestionBank = (id) => apiCall(`/api/bank-soal/banks/${id}`, {
  method: 'DELETE'
});

const testAddQuestionToBank = (bankId, questionId) => apiCall(`/api/bank-soal/banks/${bankId}/questions`, {
  method: 'POST',
  body: JSON.stringify({
    questionId: questionId,
    orderIndex: 1
  })
});

const testRemoveQuestionFromBank = (bankId, questionId) => apiCall(`/api/bank-soal/banks/${bankId}/questions/${questionId}`, {
  method: 'DELETE'
});

const testGetTopics = () => apiCall('/api/bank-soal/topics');

const testCreateTopic = () => apiCall('/api/bank-soal/topics', {
  method: 'POST',
  body: JSON.stringify(testTopicData)
});

const testGetTopicById = (id) => apiCall(`/api/bank-soal/topics/${id}`);

const testUpdateTopic = (id) => apiCall(`/api/bank-soal/topics/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    ...testTopicData,
    name: "Kemerdekaan Indonesia (Updated)"
  })
});

const testDeleteTopic = (id) => apiCall(`/api/bank-soal/topics/${id}`, {
  method: 'DELETE'
});

// Main test runner
const runTests = async () => {
  console.log('🧪 Starting Bank Soal API Tests...\n');
  
  try {
    // Test Questions API
    console.log('=== TESTING QUESTIONS API ===');
    await testGetQuestions();
    
    const { data: createQuestionResult } = await testCreateQuestion();
    const questionId = createQuestionResult?.data?.id;
    
    if (questionId) {
      await testGetQuestionById(questionId);
      await testUpdateQuestion(questionId);
      // Don't delete yet, we'll use it for question bank tests
    }
    
    // Test Question Banks API
    console.log('\n=== TESTING QUESTION BANKS API ===');
    await testGetQuestionBanks();
    
    const { data: createBankResult } = await testCreateQuestionBank();
    const bankId = createBankResult?.data?.id;
    
    if (bankId) {
      await testGetQuestionBankById(bankId);
      await testUpdateQuestionBank(bankId);
      
      // Test adding/removing questions from bank
      if (questionId) {
        await testAddQuestionToBank(bankId, questionId);
        await testRemoveQuestionFromBank(bankId, questionId);
      }
    }
    
    // Test Topics API
    console.log('\n=== TESTING TOPICS API ===');
    await testGetTopics();
    
    const { data: createTopicResult } = await testCreateTopic();
    const topicId = createTopicResult?.data?.id;
    
    if (topicId) {
      await testGetTopicById(topicId);
      await testUpdateTopic(topicId);
      await testDeleteTopic(topicId);
    }
    
    // Cleanup
    console.log('\n=== CLEANUP ===');
    if (bankId) {
      await testDeleteQuestionBank(bankId);
    }
    if (questionId) {
      await testDeleteQuestion(questionId);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test with filters
const testFilters = async () => {
  console.log('\n=== TESTING FILTERS ===');
  
  // Test question filters
  await apiCall('/api/bank-soal/questions?difficulty=EASY');
  await apiCall('/api/bank-soal/questions?questionType=MULTIPLE_CHOICE');
  await apiCall('/api/bank-soal/questions?subjectId=1');
  await apiCall('/api/bank-soal/questions?isPublic=true');
  await apiCall('/api/bank-soal/questions?search=Indonesia');
  await apiCall('/api/bank-soal/questions?page=1&pageSize=5');
  
  // Test question bank filters
  await apiCall('/api/bank-soal/banks?subjectId=1');
  await apiCall('/api/bank-soal/banks?isPublic=true');
  await apiCall('/api/bank-soal/banks?search=Sejarah');
};

// Test error handling
const testErrorHandling = async () => {
  console.log('\n=== TESTING ERROR HANDLING ===');
  
  // Test invalid IDs
  await apiCall('/api/bank-soal/questions/invalid-id');
  await apiCall('/api/bank-soal/banks/invalid-id');
  await apiCall('/api/bank-soal/topics/invalid-id');
  
  // Test invalid data
  await apiCall('/api/bank-soal/questions', {
    method: 'POST',
    body: JSON.stringify({
      questionText: '', // Invalid - empty text
      questionType: 'INVALID_TYPE', // Invalid type
      difficulty: 'INVALID_DIFFICULTY' // Invalid difficulty
    })
  });
};

// Run all tests
const runAllTests = async () => {
  await runTests();
  await testFilters();
  await testErrorHandling();
  
  console.log('\n🏁 All Bank Soal API tests completed!');
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testFilters,
    testErrorHandling,
    runAllTests,
    apiCall
  };
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
