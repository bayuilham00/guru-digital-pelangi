import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Filter, Grid, List, RefreshCw, FileText } from 'lucide-react';
import { Question, QuestionFilters, PaginationParams } from '@/types/bankSoal';
import QuestionCard from './QuestionCard';
import QuestionFilter from '../shared/QuestionFilter';
import EmptyState from '@/components/common/EmptyState';

interface QuestionListProps {
  questions: Question[];
  isLoading: boolean;
  error?: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  filters: QuestionFilters;
  onFiltersChange: (filters: QuestionFilters) => void;
  onPaginationChange: (params: PaginationParams) => void;
  onQuestionEdit: (question: Question) => void;
  onQuestionDelete: (questionId: string) => void;
  onQuestionPreview: (question: Question) => void;
  onQuestionSelect?: (question: Question) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
  // Selection mode for question bank builder
  selectionMode?: boolean;
  selectedQuestions?: Question[];
  onSelectionChange?: (questions: Question[]) => void;
  // View options
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  isLoading,
  error,
  totalCount,
  currentPage,
  pageSize,
  filters,
  onFiltersChange,
  onPaginationChange,
  onQuestionEdit,
  onQuestionDelete,
  onQuestionPreview,
  onQuestionSelect,
  onCreateNew,
  onRefresh,
  selectionMode = false,
  selectedQuestions = [],
  onSelectionChange,
  viewMode = 'grid',
  showFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({
          ...filters,
          search: searchTerm
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFiltersChange]);

  const handleQuestionSelect = (question: Question) => {
    if (selectionMode && onSelectionChange) {
      const isSelected = selectedQuestions.some(q => q.id === question.id);
      if (isSelected) {
        onSelectionChange(selectedQuestions.filter(q => q.id !== question.id));
      } else {
        onSelectionChange([...selectedQuestions, question]);
      }
    } else if (onQuestionSelect) {
      onQuestionSelect(question);
    }
  };

  const isQuestionSelected = (questionId: string) => {
    return selectedQuestions.some(q => q.id === questionId);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-gray-700">
          Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} dari {totalCount} soal
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange({ page: currentPage - 1, pageSize })}
            disabled={currentPage <= 1}
          >
            Sebelumnya
          </Button>
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange({ page: currentPage + 1, pageSize })}
            disabled={currentPage >= totalPages}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    );
  };

  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.subjectId) activeFilters.push('Mata Pelajaran');
    if (filters.topicId) activeFilters.push('Topik');
    if (filters.difficulty) activeFilters.push('Tingkat Kesulitan');
    if (filters.questionType) activeFilters.push('Jenis Soal');
    if (filters.gradeLevel) activeFilters.push('Kelas');
    if (filters.isPublic !== undefined) activeFilters.push('Visibilitas');

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-600">Filter aktif:</span>
        {activeFilters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {filter}
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
          className="text-xs h-6 px-2"
        >
          Hapus semua
        </Button>
      </div>
    );
  };

  const renderQuestionGrid = () => {
    if (isLoading) {
      return (
        <div className={`grid ${currentViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (totalCount === 0 && !isLoading) {
      return (
        <EmptyState
          icon={FileText}
          title="Bank Soal Masih Kosong"
          description="Buat soal pertamamu"
          actionLabel="Buat Soal Baru"
          onAction={onCreateNew}
        />
      );
    }

    if (questions.length === 0 && !isLoading) {
      return (
        <EmptyState
          icon={Filter}
          title="Tidak Ada Soal yang Sesuai"
          description="Tidak ada soal yang cocok dengan kriteria filter Anda. Coba sesuaikan atau hapus filter."
          actionLabel="Hapus Semua Filter"
          onAction={() => onFiltersChange({})}
        />
      );
    }

    return (
      <div className={`grid ${currentViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onEdit={onQuestionEdit}
            onDelete={onQuestionDelete}
            onPreview={onQuestionPreview}
            onSelect={handleQuestionSelect}
            isSelected={isQuestionSelected(question.id)}
            showActions={!selectionMode}
            compact={currentViewMode === 'list'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bank Soal</h2>
          <p className="text-gray-600">Kelola dan atur soal-soal untuk pembelajaran</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentViewMode(currentViewMode === 'grid' ? 'list' : 'grid')}
          >
            {currentViewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Soal Baru
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari soal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {showFilters && (
              <Button
                variant="outline"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showFilterPanel && (
          <CardContent>
            <QuestionFilter
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CardContent>
        )}
      </Card>

      {/* Active Filters */}
      {renderActiveFilters()}

      {/* Selection Info */}
      {selectionMode && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedQuestions.length} soal terpilih
              </span>
              {selectedQuestions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectionChange?.([])}
                >
                  Hapus Pilihan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Grid */}
      <Card>
        <CardContent className="p-6">
          {renderQuestionGrid()}
        </CardContent>
        {renderPagination()}
      </Card>
    </div>
  );
};

export default QuestionList;
