import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionBankList from '../components/modules/bank-soal/question-banks/QuestionBankList';
import { QuestionBank } from '../types/bankSoal';

const QuestionBanksPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateQuestionBank = () => {
    navigate('/bank-soal/question-banks/create');
  };

  const handleEditQuestionBank = (questionBank: QuestionBank) => {
    navigate(`/bank-soal/question-banks/${questionBank.id}/edit`);
  };

  const handleDeleteQuestionBank = async (questionBankId: string) => {
    // The QuestionBankList component handles deletion internally
    console.log('Delete question bank:', questionBankId);
  };

  const handleViewQuestionBank = (questionBank: QuestionBank) => {
    navigate(`/bank-soal/question-banks/${questionBank.id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Question Banks</h1>
        <p className="text-gray-600 mt-2">Organize your questions into banks</p>
      </div>

      <QuestionBankList
        onCreateNew={handleCreateQuestionBank}
        onEditBank={handleEditQuestionBank}
        onDeleteBank={handleDeleteQuestionBank}
        onViewBank={handleViewQuestionBank}
      />
    </div>
  );
};

export default QuestionBanksPage;
