import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  BookOpen, 
  Plus, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Activity,
  BarChart3,
  PieChart,
  Search,
  Filter
} from 'lucide-react';
import { Question, QuestionBank, QuestionFilters, PaginationParams } from '@/types/bankSoal';
import QuestionList from './questions/QuestionList';
import { bankSoalService } from '@/services/bankSoalService';
import { toast } from 'sonner';

interface BankSoalDashboardProps {
  onCreateQuestion: () => void;
  onCreateQuestionBank: () => void;
  onEditQuestion: (question: Question) => void;
  onEditQuestionBank: (questionBank: QuestionBank) => void;
}

const BankSoalDashboard: React.FC<BankSoalDashboardProps> = ({
  onCreateQuestion,
  onCreateQuestionBank,
  onEditQuestion,
  onEditQuestionBank
}) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [questionFilters, setQuestionFilters] = useState<QuestionFilters>({});
  const [questionPagination, setQuestionPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 12
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalBanks, setTotalBanks] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalBanks: 0,
    questionsByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 },
    questionsByType: {
      MULTIPLE_CHOICE: 0,
      ESSAY: 0,
      TRUE_FALSE: 0,
      FILL_BLANK: 0,
      MATCHING: 0
    },
    recentActivity: []
  });

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoadingQuestions(true);
      setError(null);
      
      const response = await bankSoalService.getQuestions({
        ...questionFilters,
        page: questionPagination.page,
        pageSize: questionPagination.pageSize
      });
      
      if (response && response.success) {
        setQuestions(response.data?.questions || response.data || []);
        setTotalQuestions(response.data?.pagination?.totalCount || response.total || 0);
      } else {
        setError(response?.message || 'Gagal memuat soal');
        setQuestions([]); // Fallback to empty array
        setTotalQuestions(0);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]); // Fallback to empty array
      setTotalQuestions(0);
      if (error instanceof Error && error.message.includes('Sesi Anda telah berakhir')) {
        setError('Sesi Anda telah berakhir. Halaman akan dimuat ulang...');
        // Trigger re-render to let ProtectedRoute handle the redirect
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('Gagal memuat soal. Silakan coba lagi.');
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [questionFilters, questionPagination]);

  const loadQuestionBanks = useCallback(async () => {
    try {
      setIsLoadingBanks(true);
      const response = await bankSoalService.getQuestionBanks({
        page: 1,
        limit: 20
      });
      
      if (response && response.success) {
        setQuestionBanks(response.data?.questionBanks || response.data || []);
        setTotalBanks(response.data?.pagination?.totalCount || response.total || 0);
      } else {
        setQuestionBanks([]);
        setTotalBanks(0);
      }
    } catch (error) {
      console.error('Error loading question banks:', error);
      setQuestionBanks([]);
      setTotalBanks(0);
    } finally {
      setIsLoadingBanks(false);
    }
  }, []);

  // Load initial data - prevent infinite loop
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoadingQuestions(true);
        setIsLoadingBanks(true);
        
        // Load questions
        const questionsResponse = await bankSoalService.getQuestions({
          page: 1,
          limit: 12
        });
        
        if (questionsResponse && questionsResponse.success) {
          setQuestions(questionsResponse.data?.questions || questionsResponse.data || []);
          setTotalQuestions(questionsResponse.data?.pagination?.totalCount || questionsResponse.total || 0);
        }
        
        // Load question banks
        const banksResponse = await bankSoalService.getQuestionBanks({
          page: 1,
          limit: 20
        });
        
        if (banksResponse && banksResponse.success) {
          setQuestionBanks(banksResponse.data?.questionBanks || banksResponse.data || []);
          setTotalBanks(banksResponse.data?.pagination?.totalCount || banksResponse.total || 0);
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoadingQuestions(false);
        setIsLoadingBanks(false);
      }
    };
    
    initData();
  }, []); // Run only once on mount

  // Recalculate stats when data changes
  useEffect(() => {
    setIsLoadingStats(true);
    try {
      setStats({
        totalQuestions: (questions || []).length,
        totalBanks: (questionBanks || []).length,
        questionsByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 },
        questionsByType: {
          MULTIPLE_CHOICE: 0,
          ESSAY: 0,
          TRUE_FALSE: 0,
          FILL_BLANK: 0,
          MATCHING: 0
        },
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, questionBanks.length]); // Only depend on lengths to avoid infinite loop

  // Load questions when filters/pagination change
  useEffect(() => {
    loadQuestions();
  }, [questionFilters, questionPagination.page, questionPagination.pageSize, loadQuestions]); // Include loadQuestions

  const handleQuestionDelete = async (questionId: string) => {
    try {
      const response = await bankSoalService.deleteQuestion(questionId);
      if (response.success) {
        toast.success('Soal berhasil dihapus');
        loadQuestions();
      } else {
        toast.error(response.message || 'Gagal menghapus soal');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Gagal menghapus soal');
    }
  };

  const handleQuestionPreview = (question: Question) => {
    // TODO: Implement question preview modal
    console.log('Preview question:', question);
  };

  const handleRefreshQuestions = () => {
    loadQuestions();
  };

  const renderStatsCards = () => {
    if (isLoadingStats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-6 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Soal</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bank Soal</p>
                <p className="text-2xl font-bold">{totalBanks}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Soal Publik</p>
                <p className="text-2xl font-bold">{(questions || []).filter(q => q.isPublic).length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktivitas Hari Ini</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuestionBanksList = () => {
    if (isLoadingBanks) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if ((questionBanks || []).length === 0) {
      return (
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada Bank Soal</h3>
          <p className="text-gray-600 mb-4">Mulai dengan membuat bank soal pertama Anda</p>
          <Button onClick={onCreateQuestionBank}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Bank Soal
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {questionBanks.map((bank) => (
          <Card key={bank.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {bank.subject?.name || 'Tanpa Mata Pelajaran'}
                    </Badge>
                    {bank.isPublic && (
                      <Badge variant="secondary">Publik</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{bank.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{bank.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditQuestionBank(bank)}
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{bank._count?.questions || 0} soal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(bank.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                {bank.creator && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{bank.creator.fullName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Soal</h1>
          <p className="text-gray-600">Kelola dan atur soal-soal untuk pembelajaran</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCreateQuestionBank}>
            <Plus className="mr-2 h-4 w-4" />
            Bank Soal Baru
          </Button>
          <Button onClick={onCreateQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Soal Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Soal</TabsTrigger>
          <TabsTrigger value="banks">Bank Soal</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <QuestionList
            questions={questions}
            isLoading={isLoadingQuestions}
            error={error}
            totalCount={totalQuestions}
            currentPage={questionPagination.page}
            pageSize={questionPagination.pageSize}
            filters={questionFilters}
            onFiltersChange={setQuestionFilters}
            onPaginationChange={setQuestionPagination}
            onQuestionEdit={onEditQuestion}
            onQuestionDelete={handleQuestionDelete}
            onQuestionPreview={handleQuestionPreview}
            onCreateNew={onCreateQuestion}
            onRefresh={handleRefreshQuestions}
          />
        </TabsContent>

        <TabsContent value="banks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Soal</CardTitle>
            </CardHeader>
            <CardContent>
              {renderQuestionBanksList()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribusi Tingkat Kesulitan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mudah</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {stats.questionsByDifficulty.EASY}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sedang</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {stats.questionsByDifficulty.MEDIUM}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sulit</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {stats.questionsByDifficulty.HARD}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Jenis Soal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pilihan Ganda</span>
                    <Badge variant="outline">
                      {stats.questionsByType.MULTIPLE_CHOICE}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Esai</span>
                    <Badge variant="outline">
                      {stats.questionsByType.ESSAY}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Benar/Salah</span>
                    <Badge variant="outline">
                      {stats.questionsByType.TRUE_FALSE}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankSoalDashboard;
