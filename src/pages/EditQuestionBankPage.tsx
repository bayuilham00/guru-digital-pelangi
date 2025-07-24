import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionBankForm from '../components/modules/bank-soal/question-banks/QuestionBankForm';
import { QuestionBank } from '../types/bankSoal';
import { questionBanksApi } from '../services/bankSoalService';

const EditQuestionBankPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestionBank = async () => {
      if (!id) return;
      
      try {
        const response = await questionBanksApi.getQuestionBankById(id);
        if (response.success) {
          setQuestionBank(response.data);
        }
      } catch (error) {
        console.error('Error loading question bank:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionBank();
  }, [id]);

  const handleSave = async (updatedQuestionBank: QuestionBank) => {
    try {
      // The form component handles the update internally
      navigate('/bank-soal/question-banks');
    } catch (error) {
      console.error('Error updating question bank:', error);
    }
  };

  const handleCancel = () => {
    navigate('/bank-soal/question-banks');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!questionBank) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Question Bank Not Found</h2>
          <p className="text-gray-600 mt-2">The question bank you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/bank-soal/question-banks')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Question Banks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Question Bank</h1>
          <p className="text-gray-600 mt-2">Update question bank details</p>
        </div>
        
        <QuestionBankForm
          bank={questionBank}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditQuestionBankPage;
