import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionList from '../components/modules/bank-soal/questions/QuestionList';
import { Question, QuestionFilters, PaginationParams } from '../types/bankSoal';
import { questionsApi } from '../services/bankSoalService';

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<QuestionFilters>({});

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await questionsApi.getQuestions({
        ...filters,
        page: currentPage,
        limit: pageSize
      });
      
      if (response.success) {
        setQuestions(response.data);
        setTotalCount(response.total || 0);
        setError(undefined);
      }
    } catch (err) {
      setError('Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCreateQuestion = () => {
    navigate('/bank-soal/questions/create');
  };

  const handleEditQuestion = (question: Question) => {
    navigate(`/bank-soal/questions/${question.id}/edit`);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await questionsApi.deleteQuestion(questionId);
      loadQuestions(); // Reload the list
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handlePreviewQuestion = (question: Question) => {
    // TODO: Open preview modal
    console.log('Preview question:', question);
  };

  const handleFiltersChange = (newFilters: QuestionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePaginationChange = (params: PaginationParams) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.pageSize !== undefined) setPageSize(params.pageSize);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600 mt-2">Manage your question collection</p>
        </div>
      </div>

      <QuestionList
        questions={questions}
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onPaginationChange={handlePaginationChange}
        onQuestionEdit={handleEditQuestion}
        onQuestionDelete={handleDeleteQuestion}
        onQuestionPreview={handlePreviewQuestion}
        onCreateNew={handleCreateQuestion}
        onRefresh={loadQuestions}
        showFilters={true}
        viewMode="grid"
      />
    </div>
  );
};

export default QuestionsPage;
