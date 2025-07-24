import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, BookOpen, Users, Clock, Trash2, Copy, FileText, Edit, Eye, MoreVertical, Globe, Lock } from 'lucide-react';
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
import { templateService, type Template } from '@/services/templateService';
import { subjectsService, type Subject } from '@/services/subjectsService';
import TemplateDetail from '@/components/modules/teacher-planner/templates/TemplateDetail';
import TemplateEdit from '@/components/modules/teacher-planner/templates/TemplateEdit';

type ViewMode = 'list' | 'detail' | 'edit';

interface TemplatesListProps {
  onTemplateSelect?: (template: Template) => void;
  onTemplateCreate?: () => void;
  onTemplateEdit?: (template: Template) => void;
  onTemplateDelete?: (templateId: string) => void;
}

export const TemplatesList: React.FC<TemplatesListProps> = ({
  onTemplateSelect,
  onTemplateCreate,
  onTemplateEdit,
  onTemplateDelete
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Reference data
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Bulk operations state
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const subjectResponse = await subjectsService.getSubjects();
        if (subjectResponse.success) {
          setSubjects(subjectResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };

    loadReferenceData();
  }, []);

  // Load templates with filters
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
        isPublic: publicFilter !== 'all' ? publicFilter === 'public' : undefined,
        sortBy: sortBy === 'date' ? 'createdAt' : sortBy,
        sortOrder: sortOrder
      };

      console.log('🔍 Loading templates with filters:', filters);

      const response = await templateService.getTemplates(filters);

      if (response.success) {
        setTemplates(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalTemplates(response.pagination?.total || 0);
        console.log('✅ Templates loaded:', response.data?.length, 'total:', response.pagination?.total);
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal memuat daftar template",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, subjectFilter, publicFilter, sortBy, sortOrder, toast]);

  // Load templates when filters change
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle template delete
  const handleTemplateDelete = async (templateId: string) => {
    try {
      const response = await templateService.deleteTemplate(templateId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Template berhasil dihapus",
        });
        loadTemplates();
        onTemplateDelete?.(templateId);
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menghapus template",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus template",
        variant: "destructive"
      });
    }
  };

  // Handle template duplicate
  const handleTemplateDuplicate = async (templateId: string) => {
    try {
      const response = await templateService.duplicateTemplate(templateId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Template berhasil diduplikasi",
        });
        loadTemplates();
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menduplikasi template",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Gagal menduplikasi template",
        variant: "destructive"
      });
    }
  };

  // Handle view mode changes
  const handleTemplateView = (template: Template) => {
    setSelectedTemplateId(template.id);
    setViewMode('detail');
    onTemplateSelect?.(template);
  };

  const handleTemplateEditMode = (template: Template) => {
    setSelectedTemplateId(template.id);
    setViewMode('edit');
    onTemplateEdit?.(template);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTemplateId(null);
    loadTemplates();
  };

  const handleTemplateSaved = (template: Template) => {
    setViewMode('detail');
    loadTemplates();
  };

  const handleTemplateDeleted = (templateId: string) => {
    setViewMode('list');
    setSelectedTemplateId(null);
    onTemplateDelete?.(templateId);
    loadTemplates();
  };

  // Bulk operations handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(templates.map(template => template.id));
    } else {
      setSelectedTemplates([]);
    }
  };

  const handleSelectTemplate = (templateId: string, checked: boolean) => {
    if (checked) {
      setSelectedTemplates(prev => [...prev, templateId]);
    } else {
      setSelectedTemplates(prev => prev.filter(id => id !== templateId));
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await templateService.bulkDeleteTemplates(selectedTemplates);
      if (response.success) {
        toast({
          title: "Success",
          description: `${response.data?.deletedCount || selectedTemplates.length} template berhasil dihapus`,
        });
        setSelectedTemplates([]);
        loadTemplates();
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal menghapus template",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus template",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  // Update showBulkActions when selectedTemplates changes
  useEffect(() => {
    setShowBulkActions(selectedTemplates.length > 0);
  }, [selectedTemplates]);

  // Render based on view mode
  if (viewMode === 'detail' && selectedTemplateId) {
    return (
      <TemplateDetail
        templateId={selectedTemplateId}
        onBack={handleBackToList}
        onEdit={handleTemplateEditMode}
        onDelete={handleTemplateDeleted}
        onDuplicate={handleTemplateDuplicate}
      />
    );
  }

  if (viewMode === 'edit' && selectedTemplateId) {
    return (
      <TemplateEdit
        templateId={selectedTemplateId}
        onBack={handleBackToList}
        onSave={handleTemplateSaved}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Pembelajaran</h2>
          <p className="text-gray-600">
            Kelola template rencana pembelajaran ({totalTemplates} template)
            {selectedTemplates.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • {selectedTemplates.length} dipilih
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
                  Aksi Bulk ({selectedTemplates.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
          <Button onClick={onTemplateCreate} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Buat Template Baru</span>
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
              placeholder="Cari template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Public Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Akses</label>
              <Select value={publicFilter} onValueChange={setPublicFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Template</SelectItem>
                  <SelectItem value="public">Template Publik</SelectItem>
                  <SelectItem value="private">Template Pribadi</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
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
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada template
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || subjectFilter !== 'all' || publicFilter !== 'all'
                ? 'Tidak ada template yang sesuai dengan filter yang dipilih.'
                : 'Anda belum membuat template pembelajaran. Mulai dengan membuat template pertama Anda.'
              }
            </p>
            <Button onClick={onTemplateCreate} className="inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Buat Template Baru</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length > 0 && (
            <div className="col-span-full mb-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  id="select-all"
                  checked={selectedTemplates.length === templates.length && templates.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Pilih Semua ({templates.length})
                </label>
              </div>
            </div>
          )}
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {template.subject?.name || 'Mata Pelajaran Tidak Diketahui'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={template.isPublic ? "default" : "secondary"} className="text-xs">
                      {template.isPublic ? (
                        <><Globe className="h-3 w-3 mr-1" />Publik</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" />Pribadi</>
                      )}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTemplateView(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTemplateEditMode(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTemplateDuplicate(template.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplikasi
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleTemplateDelete(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{template.estimatedDuration || 90} menit</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{template.createdByUser?.fullName || 'Tidak diketahui'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateView(template)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Lihat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateEditMode(template)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages} ({totalTemplates} total)
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus {selectedTemplates.length} template. 
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
