import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, Edit, Trash2, Eye, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { type TeacherPlan, type CreatePlanRequest } from '@/services/teacherPlannerService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from '@/components/ui/checkbox';

interface PlanCardProps {
  plan: TeacherPlan;
  onEdit?: (planData: Partial<CreatePlanRequest>) => void;
  onDelete?: () => void;
  onView?: () => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onView,
  isSelected,
  onSelect,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isMobile = useIsMobile();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'PUBLISHED': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-300';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'PUBLISHED': return 'Published';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1.5"
                aria-label={`Select plan ${plan.title}`}
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {plan.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(plan.scheduledDate), 'dd MMM yyyy', { locale: id })}</span>
                </div>
                {plan.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(plan.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(plan.status)}>
            {getStatusLabel(plan.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Class and Subject Info */}
        <div className="flex items-center space-x-4 mb-3 text-sm">
          {plan.class && (
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{plan.class.name}</span>
            </div>
          )}
          {plan.subject && (
            <div className="bg-gray-100 px-2 py-1 rounded text-gray-700">
              {plan.subject.name}
            </div>
          )}
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {plan.description}
          </p>
        )}

        {/* Learning Objectives */}
        {plan.learningObjectives && plan.learningObjectives.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tujuan Pembelajaran:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {plan.learningObjectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <span>{objective.objective}</span>
                </li>
              ))}
              {plan.learningObjectives.length > 2 && (
                <li className="text-gray-500 text-xs">
                  +{plan.learningObjectives.length - 2} tujuan lainnya
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Template Info */}
        {plan.template && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Template:</span> {plan.template.name}
            </p>
          </div>
        )}

        {/* Resources */}
        {plan.resources && plan.resources.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sumber Daya:</h4>
            <div className="flex flex-wrap gap-2">
              {plan.resources.slice(0, 3).map((resource, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {resource.title}
                </Badge>
              ))}
              {plan.resources.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{plan.resources.length - 3} lainnya
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? 'Tutup' : 'Detail'}
            </Button>
            {onView && !isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onView}
              >
                Lihat
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(plan)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus rencana pembelajaran "{plan.title}"? 
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Lesson Content */}
            {plan.lessonContent && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Konten Pembelajaran:</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  {plan.lessonContent.introduction && (
                    <div>
                      <span className="font-medium">Pembukaan:</span> {plan.lessonContent.introduction}
                    </div>
                  )}
                  {plan.lessonContent.mainContent && (
                    <div>
                      <span className="font-medium">Inti:</span> {plan.lessonContent.mainContent}
                    </div>
                  )}
                  {plan.lessonContent.conclusion && (
                    <div>
                      <span className="font-medium">Penutup:</span> {plan.lessonContent.conclusion}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assessment */}
            {plan.assessment && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Penilaian:</h4>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Metode:</span> {plan.assessment.method}</p>
                  <p><span className="font-medium">Tipe:</span> {plan.assessment.type}</p>
                  {plan.assessment.criteria && (
                    <p><span className="font-medium">Kriteria:</span> {plan.assessment.criteria}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {plan.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Catatan:</h4>
                <p className="text-sm text-gray-600">{plan.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>Dibuat: {format(new Date(plan.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}</p>
              <p>Diupdate: {format(new Date(plan.updatedAt), 'dd MMM yyyy HH:mm', { locale: id })}</p>
              {plan.teacher && <p>Guru: {plan.teacher.fullName}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
