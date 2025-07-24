import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Calendar, BookOpen, Users, Clock, Trash2, Copy, FileText, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { teacherPlannerService, type TeacherPlan } from '@/services/teacherPlannerService';
import { classService } from '@/services/classService';
import { type Class } from '@/services/types';
import { subjectsService, type Subject } from '@/services/subjectsService';
import { PlanCard } from '../common/PlanCard';
import { PlanDetail } from './PlanDetail';
import { PlanEdit } from './PlanEdit';

type ViewMode = 'list' | 'detail' | 'edit';

interface PlansListProps {
  onPlanSelect?: (plan: TeacherPlan) => void;
  onPlanCreate?: () => void;
  onPlanEdit?: (plan: TeacherPlan) => void;
  onPlanDelete?: (planId: string) => void;
}

export const PlansList: React.FC<PlansListProps> = ({
  onPlanSelect,
  onPlanCreate,
  onPlanEdit,
  onPlanDelete
}) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<TeacherPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Reference data
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Bulk operations state
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'status' | 'duplicate' | 'export' | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>('PUBLISHED');

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [classResponse, subjectResponse] = await Promise.all([
          classService.getClasses(),
          subjectsService.getSubjects()
        ]);

        if (classResponse.success) {
          setClasses(classResponse.data || []);
        }
        if (subjectResponse.success) {
          setSubjects(subjectResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };

    loadReferenceData();
  }, []);

  // Load plans with filters
  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
        classId: classFilter !== 'all' ? classFilter : undefined,
        sortBy: sortBy === 'date' ? 'scheduledDate' : sortBy, // Fix sort field mapping
        sortOrder: sortOrder
      };

      console.log('🔍 Loading plans with filters:', filters);

      const response = await teacherPlannerService.getPlans(filters);

      if (response.success) {
        setPlans(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalPlans(response.pagination?.total || 0);
        console.log('✅ Plans loaded:', response.data?.length, 'total:', response.pagination?.total);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal memuat daftar rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, subjectFilter, classFilter, sortBy, sortOrder, toast]);

  // Load plans when filters change
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Handle search with debounce - only reset page when search term changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Reset to page 1 when search term changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle plan delete
  const handlePlanDelete = async (planId: string) => {
    try {
      const response = await teacherPlannerService.deletePlan(planId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Rencana pembelajaran berhasil dihapus",
        });
        loadPlans(); // Refresh the list
        onPlanDelete?.(planId);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal menghapus rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus rencana pembelajaran",
        variant: "destructive"
      });
    }
  };

  // Handle view mode changes
  const handlePlanView = (plan: TeacherPlan) => {
    setSelectedPlanId(plan.id);
    setViewMode('detail');
    onPlanSelect?.(plan);
  };

  const handlePlanEditMode = (plan: TeacherPlan) => {
    setSelectedPlanId(plan.id);
    setViewMode('edit');
    onPlanEdit?.(plan);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPlanId(null);
    loadPlans(); // Refresh the list
  };

  const handlePlanSaved = (plan: TeacherPlan) => {
    setViewMode('detail');
    // Refresh the plans list
    loadPlans();
  };

  const handlePlanDeleted = (planId: string) => {
    setViewMode('list');
    setSelectedPlanId(null);
    onPlanDelete?.(planId);
    // Refresh the plans list
    loadPlans();
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary';
      case 'PUBLISHED':
        return 'default';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'PUBLISHED':
        return 'Dipublikasi';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Bulk operations handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlans(plans.map(plan => plan.id));
    } else {
      setSelectedPlans([]);
    }
  };

  const handleSelectPlan = (planId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlans(prev => [...prev, planId]);
    } else {
      setSelectedPlans(prev => prev.filter(id => id !== planId));
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await teacherPlannerService.bulkDeletePlans(selectedPlans);
      if (response.success) {
        toast({
          title: "Success",
          description: `${response.data?.deletedCount || selectedPlans.length} rencana berhasil dihapus`,
        });
        setSelectedPlans([]);
        loadPlans();
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal menghapus rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkUpdateStatus = async () => {
    setIsProcessing(true);
    try {
      const response = await teacherPlannerService.bulkUpdateStatus(selectedPlans, bulkStatus);
      if (response.success) {
        toast({
          title: "Success",
          description: `${response.data?.updatedCount || selectedPlans.length} rencana berhasil diubah statusnya`,
        });
        setSelectedPlans([]);
        loadPlans();
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal mengubah status rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDuplicate = async () => {
    setIsProcessing(true);
    try {
      const response = await teacherPlannerService.bulkDuplicatePlans(selectedPlans);
      if (response.success) {
        toast({
          title: "Success",
          description: `${response.data?.duplicatedCount || selectedPlans.length} rencana berhasil diduplikasi`,
        });
        setSelectedPlans([]);
        loadPlans();
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal menduplikasi rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menduplikasi rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async (format: 'json' | 'csv' = 'json') => {
    setIsProcessing(true);
    try {
      const response = await teacherPlannerService.bulkExportPlans(selectedPlans, format);
      if (response.success) {
        if (format === 'csv') {
          toast({
            title: "Success",
            description: "File CSV berhasil diunduh",
          });
        } else {
          // For JSON, create download link
          const dataStr = JSON.stringify(response.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `teacher-plans-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Success",
            description: "File JSON berhasil diunduh",
          });
        }
        setSelectedPlans([]);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal mengekspor rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengekspor rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update showBulkActions when selectedPlans changes
  useEffect(() => {
    setShowBulkActions(selectedPlans.length > 0);
  }, [selectedPlans]);

  // Render based on view mode
  if (viewMode === 'detail' && selectedPlanId) {
    return (
      <PlanDetail
        planId={selectedPlanId}
        onBack={handleBackToList}
        onEdit={handlePlanEditMode}
        onDelete={handlePlanDeleted}
        onDuplicate={handlePlanView}
      />
    );
  }

  if (viewMode === 'edit' && selectedPlanId) {
    return (
      <PlanEdit
        planId={selectedPlanId}
        onBack={handleBackToList}
        onSave={handlePlanSaved}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar Rencana Pembelajaran</h2>
          <p className="text-gray-600">
            Kelola semua rencana pembelajaran Anda ({totalPlans} rencana)
            {selectedPlans.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • {selectedPlans.length} dipilih
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {showBulkActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isProcessing}>
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Aksi Bulk ({selectedPlans.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setBulkAction('status');
                }}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Ubah Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDuplicate} disabled={isProcessing}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplikasi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkExport('json')} disabled={isProcessing}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkExport('csv')} disabled={isProcessing}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  disabled={isProcessing}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={onPlanCreate} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Buat Rencana Baru</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Pencarian</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari rencana pembelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Dipublikasi</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Kelas</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-1">Urutkan</label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Terbaru</SelectItem>
                  <SelectItem value="date-asc">Terlama</SelectItem>
                  <SelectItem value="title-asc">Judul A-Z</SelectItem>
                  <SelectItem value="title-desc">Judul Z-A</SelectItem>
                  <SelectItem value="status-asc">Status A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada rencana pembelajaran
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all' || classFilter !== 'all'
                ? 'Tidak ada rencana pembelajaran yang sesuai dengan filter yang dipilih.'
                : 'Anda belum membuat rencana pembelajaran. Mulai dengan membuat rencana pertama Anda.'
              }
            </p>
            <Button onClick={onPlanCreate} className="inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Buat Rencana Baru</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.length > 0 && (
            <div className="col-span-full mb-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  id="select-all"
                  checked={selectedPlans.length === plans.length && plans.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Pilih Semua ({plans.length})
                </label>
              </div>
            </div>
          )}
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlans.includes(plan.id)}
              onSelect={(checked) => handleSelectPlan(plan.id, checked)}
              onView={() => handlePlanView(plan)}
              onEdit={() => handlePlanEditMode(plan)}
              onDelete={() => handlePlanDelete(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages} ({totalPlans} total)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      disabled={isLoading}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                Selanjutnya
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Status Update Dialog */}
      {bulkAction === 'status' && (
        <AlertDialog open={true} onOpenChange={() => setBulkAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ubah Status Rencana Pembelajaran</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan mengubah status {selectedPlans.length} rencana pembelajaran.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">Status Baru:</label>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Dipublikasi</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBulkAction(null)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkUpdateStatus} disabled={isProcessing}>
                {isProcessing ? 'Memproses...' : 'Ubah Status'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rencana Pembelajaran</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus {selectedPlans.length} rencana pembelajaran. 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Menghapus...' : 'Hapus Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
