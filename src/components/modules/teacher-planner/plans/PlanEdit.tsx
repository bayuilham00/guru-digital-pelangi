import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { teacherPlannerService, type TeacherPlan, type CreatePlanRequest } from '@/services/teacherPlannerService';
import { LessonPlanForm } from '../planning/LessonPlanForm';

interface PlanEditProps {
  planId: string;
  onBack: () => void;
  onSave: (plan: TeacherPlan) => void;
  onCancel: () => void;
}

export const PlanEdit: React.FC<PlanEditProps> = ({
  planId,
  onBack,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [plan, setPlan] = useState<TeacherPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  // Handle form submission
  const handleSubmit = async (formData: CreatePlanRequest) => {
    if (!plan) return;

    setIsSaving(true);
    try {
      const response = await teacherPlannerService.updatePlan(plan.id, formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Rencana pembelajaran berhasil diperbarui",
        });
        onSave(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal memperbarui rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Convert plan to form data
  const planToFormData = (plan: TeacherPlan): CreatePlanRequest => {
    return {
      title: plan.title,
      description: plan.description || '',
      classId: plan.classId,
      subjectId: plan.subjectId,
      scheduledDate: plan.scheduledDate,
      duration: plan.duration || 90,
      learningObjectives: plan.learningObjectives || [],
      lessonContent: plan.lessonContent,
      assessment: plan.assessment,
      resources: plan.resources || [],
      notes: plan.notes || '',
      status: plan.status
    };
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Rencana Pembelajaran</h1>
            <p className="text-gray-600">Perbarui detail rencana pembelajaran Anda</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
          <Button 
            type="submit" 
            form="lesson-plan-form"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Rencana Pembelajaran: {plan.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonPlanForm
            onSubmit={handleSubmit}
            onCancel={onCancel}
            initialData={planToFormData(plan)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
