import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionForm from '../components/modules/bank-soal/questions/QuestionForm';
import { Question } from '../types/bankSoal';
import { questionsApi } from '../services/bankSoalService';

const EditQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestion = async () => {
      if (!id) return;
      
      try {
        const response = await questionsApi.getQuestionById(id);
        if (response.success) {
          setQuestion(response.data);
        }
      } catch (error) {
        console.error('Error loading question:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const handleSave = async (updatedQuestion: Question) => {
    try {
      // The form component handles the update internally
      navigate('/bank-soal');
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleCancel = () => {
    navigate('/bank-soal');
  };

  const handlePreview = (questionData: Partial<Question>) => {
    console.log('Preview question:', questionData);
    // TODO: Open preview modal
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

  if (!question) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Question Not Found</h2>
          <p className="text-gray-600 mt-2">The question you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/bank-soal')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Bank Soal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-gray-600 mt-2">Update question details</p>
        </div>
        
        <QuestionForm
          question={question}
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={handlePreview}
        />
      </div>
    </div>
  );
};

export default EditQuestionPage;
