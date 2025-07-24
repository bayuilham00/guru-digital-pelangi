import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionBankForm from '../components/modules/bank-soal/question-banks/QuestionBankForm';
import { QuestionBank } from '../types/bankSoal';

const CreateQuestionBankPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = async (questionBank: QuestionBank) => {
    try {
      // The form component handles the creation internally
      navigate('/bank-soal/question-banks');
    } catch (error) {
      console.error('Error creating question bank:', error);
    }
  };

  const handleCancel = () => {
    navigate('/bank-soal/question-banks');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Question Bank</h1>
          <p className="text-gray-600 mt-2">Create a new bank to organize your questions</p>
        </div>
        
        <QuestionBankForm
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateQuestionBankPage;
