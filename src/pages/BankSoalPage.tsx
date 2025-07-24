import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankSoalDashboard from '../components/modules/bank-soal/BankSoalDashboard';
import { Question, QuestionBank } from '@/types/bankSoal';

const BankSoalPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCreateQuestion = () => {
    // Navigate to question creation page
    navigate('/bank-soal/questions/create');
  };

  const handleCreateQuestionBank = () => {
    // Navigate to question bank creation page
    navigate('/bank-soal/question-banks/create');
  };

  const handleEditQuestion = (question: Question) => {
    // Navigate to question edit page
    navigate(`/bank-soal/questions/${question.id}/edit`);
  };

  const handleEditQuestionBank = (questionBank: QuestionBank) => {
    // Navigate to question bank edit page
    navigate(`/bank-soal/question-banks/${questionBank.id}/edit`);
  };

  return (
    <div className="container mx-auto p-6">
      <BankSoalDashboard
        onCreateQuestion={handleCreateQuestion}
        onCreateQuestionBank={handleCreateQuestionBank}
        onEditQuestion={handleEditQuestion}
        onEditQuestionBank={handleEditQuestionBank}
      />
    </div>
  );
};

export default BankSoalPage;
