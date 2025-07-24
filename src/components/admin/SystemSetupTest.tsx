import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const SystemSetupTest = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('🔍 TEST COMPONENT: Loading...');
    
    fetch('http://localhost:5000/api/config/status')
      .then(response => response.json())
      .then(result => {
        console.log('📊 TEST COMPONENT: API Response:', result);
        setData(result.data);
      })
      .catch(error => {
        console.error('❌ TEST COMPONENT: Error:', error);
      });
  }, []);

  if (!data) {
    return <div>Loading test component...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-xl font-bold mb-4">🧪 TEST COMPONENT - NEW FIELDS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <strong>School Name:</strong> {data.school_name || 'Empty'}
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg">
          <strong>Academic Year:</strong> {data.default_academic_year || 'Empty'}
        </div>
        
        <div className="p-3 bg-purple-50 rounded-lg">
          <strong>🆕 School Address:</strong> {data.school_address || 'Empty'}
        </div>
        
        <div className="p-3 bg-orange-50 rounded-lg">
          <strong>🆕 School Phone:</strong> {data.school_phone || 'Empty'}
        </div>
        
        <div className="p-3 bg-teal-50 rounded-lg">
          <strong>🆕 School Email:</strong> {data.school_email || 'Empty'}
        </div>
        
        <div className="p-3 bg-indigo-50 rounded-lg">
          <strong>🆕 Principal Name:</strong> {data.principal_name || 'Empty'}
        </div>
        
        <div className="p-3 bg-pink-50 rounded-lg">
          <strong>🆕 Principal NIP:</strong> {data.principal_nip || 'Empty'}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <strong>Raw API Data:</strong>
        <pre className="text-xs mt-2 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SystemSetupTest;
