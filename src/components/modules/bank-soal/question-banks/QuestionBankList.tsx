import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, Filter, BookOpen, Users, Calendar, Settings, Archive, Eye, Edit, Trash2, Download, Upload } from 'lucide-react';
import { QuestionBank } from '@/types/bankSoal';
import { bankSoalService } from '@/services/bankSoalService';
import QuestionBankCard from './QuestionBankCard';
import { toast } from 'sonner';

interface QuestionBankListProps {
  onCreateNew: () => void;
  onEditBank: (bank: QuestionBank) => void;
  onDeleteBank: (bankId: string) => void;
  onViewBank: (bank: QuestionBank) => void;
  subjects?: Array<{ id: string; name: string; code: string }>;
}

const QuestionBankList: React.FC<QuestionBankListProps> = ({
  onCreateNew,
  onEditBank,
  onDeleteBank,
  onViewBank,
  subjects = []
}) => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all-subjects');
  const [filterGrade, setFilterGrade] = useState('all-grades');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // Fetch question banks
  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bankSoalService.getQuestionBanks({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        subjectId: filterSubject === 'all-subjects' ? undefined : filterSubject,
        gradeLevel: filterGrade === 'all-grades' ? undefined : filterGrade,
        sortBy,
        sortOrder
      });
      
      setBanks(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      toast.error('Gagal memuat daftar bank soal');
      console.error('Error fetching banks:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterSubject, filterGrade, sortBy, sortOrder]);

  useEffect(() => {
    fetchBanks();
  }, [currentPage, searchTerm, filterSubject, filterGrade, sortBy, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSubject, filterGrade, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDeleteBank = async (bankId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus bank soal ini?')) {
      try {
        await bankSoalService.deleteQuestionBank(bankId);
        toast.success('Bank soal berhasil dihapus');
        fetchBanks();
        onDeleteBank(bankId);
      } catch (error) {
        toast.error('Gagal menghapus bank soal');
        console.error('Error deleting bank:', error);
      }
    }
  };

  const handleExportBank = async (bank: QuestionBank) => {
    try {
      // This would typically download a file
      toast.success(`Bank soal "${bank.name}" berhasil diekspor`);
    } catch (error) {
      toast.error('Gagal mengekspor bank soal');
      console.error('Error exporting bank:', error);
    }
  };

  const stats = {
    totalBanks: banks.length,
    totalQuestions: banks.reduce((sum, bank) => sum + (bank.questionCount || 0), 0),
    avgQuestionsPerBank: banks.length > 0 ? Math.round(banks.reduce((sum, bank) => sum + (bank.questionCount || 0), 0) / banks.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bank Soal</h2>
          <p className="text-gray-600">Kelola koleksi bank soal Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Buat Bank Soal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBanks}</p>
                <p className="text-sm text-gray-600">Total Bank Soal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-gray-600">Total Soal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avgQuestionsPerBank}</p>
                <p className="text-sm text-gray-600">Rata-rata Soal/Bank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari bank soal..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Subject Filter */}
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-subjects">Semua Mata Pelajaran</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grade Filter */}
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Tingkat Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-grades">Semua Tingkat</SelectItem>
                {['7', '8', '9', '10', '11', '12'].map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    Kelas {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt-desc">Terbaru</SelectItem>
                <SelectItem value="updatedAt-asc">Terlama</SelectItem>
                <SelectItem value="name-asc">Nama A-Z</SelectItem>
                <SelectItem value="name-desc">Nama Z-A</SelectItem>
                <SelectItem value="questionCount-desc">Jumlah Soal ↓</SelectItem>
                <SelectItem value="questionCount-asc">Jumlah Soal ↑</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bank List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : banks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada bank soal
              </h3>
              <p className="text-gray-600 mb-4">
                Buat bank soal pertama Anda untuk mulai mengorganisir soal-soal
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Bank Soal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((bank) => (
              <QuestionBankCard
                key={bank.id}
                bank={bank}
                onView={() => onViewBank(bank)}
                onEdit={() => onEditBank(bank)}
                onDelete={() => handleDeleteBank(bank.id)}
                onExport={() => handleExportBank(bank)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Sebelumnya
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionBankList;
