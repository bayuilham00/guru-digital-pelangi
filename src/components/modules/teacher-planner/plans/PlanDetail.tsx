import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Printer, 
  Clock, 
  Calendar,
  BookOpen,
  Users,
  Target,
  FileText,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { teacherPlannerService, type TeacherPlan } from '@/services/teacherPlannerService';

interface PlanDetailProps {
  planId: string;
  onBack: () => void;
  onEdit: (plan: TeacherPlan) => void;
  onDelete: (planId: string) => void;
  onDuplicate?: (plan: TeacherPlan) => void;
}

export const PlanDetail: React.FC<PlanDetailProps> = ({
  planId,
  onBack,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const { toast } = useToast();
  const [plan, setPlan] = useState<TeacherPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Load plan details
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const response = await teacherPlannerService.getPlanById(planId);
        if (response.success) {
          setPlan(response.data);
        } else {
          toast({
            title: "Error",
            description: response.error || "Gagal memuat detail rencana pembelajaran",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading plan:', error);
        toast({
          title: "Error",
          description: "Gagal memuat detail rencana pembelajaran",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [planId, toast]);

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!plan) return;

    setIsUpdatingStatus(true);
    try {
      const response = await teacherPlannerService.updatePlan(plan.id, { status: newStatus as 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED' });
      if (response.success) {
        setPlan({ ...plan, status: newStatus as 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED' });
        toast({
          title: "Success",
          description: `Status rencana pembelajaran berhasil diubah ke ${getStatusLabel(newStatus)}`,
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal mengubah status rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async () => {
    if (!plan) return;

    setIsDuplicating(true);
    try {
      const duplicateData = {
        title: `${plan.title} (Copy)`,
        description: plan.description,
        classId: plan.classId,
        subjectId: plan.subjectId,
        scheduledDate: format(new Date(), 'yyyy-MM-dd'),
        duration: plan.duration,
        learningObjectives: plan.learningObjectives,
        lessonContent: plan.lessonContent,
        assessment: plan.assessment,
        resources: plan.resources,
        notes: plan.notes,
        status: 'DRAFT' as const
      };

      const response = await teacherPlannerService.createPlan(duplicateData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Rencana pembelajaran berhasil diduplikasi",
        });
        onDuplicate?.(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal menduplikasi rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast({
        title: "Error",
        description: "Gagal menduplikasi rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export
  const handleExport = () => {
    if (!plan) return;

    const exportData = {
      title: plan.title,
      description: plan.description,
      class: plan.class?.name,
      subject: plan.subject?.name,
      scheduledDate: format(new Date(plan.scheduledDate), 'dd MMMM yyyy', { locale: id }),
      duration: plan.duration,
      status: getStatusLabel(plan.status),
      learningObjectives: plan.learningObjectives,
      lessonContent: plan.lessonContent,
      assessment: plan.assessment,
      resources: plan.resources,
      notes: plan.notes,
      createdAt: format(new Date(plan.createdAt), 'dd MMMM yyyy HH:mm', { locale: id }),
      updatedAt: format(new Date(plan.updatedAt), 'dd MMMM yyyy HH:mm', { locale: id })
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rencana-pembelajaran-${plan.title.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Rencana pembelajaran berhasil diekspor",
    });
  };

  // Get status badge variant and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { variant: 'secondary' as const, icon: Circle, label: 'Draft' };
      case 'PUBLISHED':
        return { variant: 'default' as const, icon: CheckCircle, label: 'Dipublikasi' };
      case 'COMPLETED':
        return { variant: 'outline' as const, icon: CheckCircle, label: 'Selesai' };
      case 'CANCELLED':
        return { variant: 'destructive' as const, icon: XCircle, label: 'Dibatalkan' };
      default:
        return { variant: 'secondary' as const, icon: Circle, label: status };
    }
  };

  const getStatusLabel = (status: string) => {
    return getStatusConfig(status).label;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Rencana pembelajaran tidak ditemukan atau gagal dimuat.
        </AlertDescription>
      </Alert>
    );
  }

  const statusConfig = getStatusConfig(plan.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-gray-600">Detail rencana pembelajaran</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
            <StatusIcon className="h-3 w-3" />
            <span>{statusConfig.label}</span>
          </Badge>
          <Select value={plan.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
            <SelectTrigger className="w-32">
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
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={() => onEdit(plan)} className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>{isDuplicating ? 'Menduplikasi...' : 'Duplikasi'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Rencana Pembelajaran</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus rencana pembelajaran "{plan.title}"? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(plan.id)} className="bg-red-600 hover:bg-red-700">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Informasi Dasar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas
              </label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{plan.class?.name || 'Tidak ada kelas'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Pelajaran
              </label>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>{plan.subject?.name || 'Tidak ada mata pelajaran'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Jadwal
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(plan.scheduledDate), 'dd MMMM yyyy', { locale: id })}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durasi
              </label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{plan.duration || 0} menit</span>
              </div>
            </div>
          </div>
          {plan.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{plan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      {plan.learningObjectives && plan.learningObjectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Tujuan Pembelajaran</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">{index + 1}.</span>
                  <span className="text-gray-700">{objective.objective}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      {plan.lessonContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Konten Pembelajaran</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.lessonContent.introduction && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pendahuluan</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{plan.lessonContent.introduction}</p>
              </div>
            )}
            {plan.lessonContent.mainContent && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Inti Pembelajaran</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{plan.lessonContent.mainContent}</p>
              </div>
            )}
            {plan.lessonContent.conclusion && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Penutup</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{plan.lessonContent.conclusion}</p>
              </div>
            )}
            {plan.lessonContent.activities && plan.lessonContent.activities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Aktivitas</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {plan.lessonContent.activities.map((activity, index) => (
                    <li key={index}>
                      {typeof activity === 'string' ? 
                        activity : 
                        typeof activity === 'object' && activity !== null ? 
                          (activity.activity || activity.name || JSON.stringify(activity)) : 
                          String(activity)
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessment */}
      {plan.assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Penilaian</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Penilaian
                </label>
                <Badge variant="outline">{plan.assessment.type}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metode
                </label>
                <span className="text-gray-700">{plan.assessment.method}</span>
              </div>
            </div>
            {plan.assessment.criteria && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kriteria Penilaian
                </label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{plan.assessment.criteria}</p>
              </div>
            )}
            {plan.assessment.rubric && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubrik
                </label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{plan.assessment.rubric}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {plan.resources && plan.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Paperclip className="h-5 w-5" />
              <span>Sumber Daya</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.resources.map((resource, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0">
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    )}
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                      >
                        Lihat Resource →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {plan.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Catatan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{plan.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Dibuat:</span> {format(new Date(plan.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}
            </div>
            <div>
              <span className="font-medium">Diperbarui:</span> {format(new Date(plan.updatedAt), 'dd MMMM yyyy HH:mm', { locale: id })}
            </div>
            {plan.teacher && (
              <div>
                <span className="font-medium">Guru:</span> {plan.teacher.fullName}
              </div>
            )}
            {plan.template && (
              <div>
                <span className="font-medium">Template:</span> {plan.template.name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
