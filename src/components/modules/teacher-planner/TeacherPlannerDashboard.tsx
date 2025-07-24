import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, Layout, BookOpen, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarView } from './calendar/CalendarView';
import { PlansList } from './plans/PlansList';
import { TemplatesList } from '@/components/modules/teacher-planner/templates/TemplatesList';
import TemplateEdit from '@/components/modules/teacher-planner/templates/TemplateEdit';
import { LessonPlanForm } from './planning/LessonPlanForm';
import { teacherPlannerService, type TeacherPlan, type CreatePlanRequest } from '@/services/teacherPlannerService';
import { type Template } from '@/services/templateService';
import { useToast } from '@/hooks/use-toast';

type View = 'list' | 'create' | 'edit';

export const TeacherPlannerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [view, setView] = useState<View>('list');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [planView, setPlanView] = useState<View>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const handlePlanCreate = () => {
    console.log('Plan create requested');
    setShowPlanForm(true);
  };

  const handlePlanFormSubmit = async (data: CreatePlanRequest) => {
    setIsCreatingPlan(true);
    try {
      const response = await teacherPlannerService.createPlan(data);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Rencana pembelajaran berhasil dibuat",
          variant: "default"
        });
        setShowPlanForm(false);
        // Refresh plans list if we're on the plans tab
        if (activeTab === 'plans') {
          // The PlansList component will handle its own refresh
        }
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal membuat rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handlePlanFormCancel = () => {
    setShowPlanForm(false);
  };

  const handlePlanUpdate = (plan: TeacherPlan) => {
    console.log('Plan updated:', plan);
    // Handle plan update (e.g., refresh data, show notification)
  };

  const handlePlanDelete = (planId: string) => {
    console.log('Plan deleted:', planId);
    // Handle plan deletion (e.g., refresh data, show notification)
  };

  const handleTemplateCreate = () => {
    console.log('Template create requested');
    setSelectedTemplateId(null);
    setView('create');
  };

  const handleTemplateUpdate = (template: Template) => {
    console.log('Template updated:', template);
    setSelectedTemplateId(template.id);
    setView('edit');
  };

  const handleTemplateDelete = (templateId: string) => {
    console.log('Template deleted:', templateId);
    // Handle template deletion
  };

  const handleTemplateSaved = (template: Template) => {
    console.log('Template saved:', template);
    setView('list');
    // Optionally refresh the list
  };

  const handleBack = () => {
    setView('list');
    setSelectedTemplateId(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Planner</h1>
            <p className="text-gray-600">Kelola rencana pembelajaran dengan mudah dan efisien</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('/')} aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Kalender</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Rencana</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Template</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analitik</span>
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-0">
          <CalendarView
            onPlanCreate={(plan) => handlePlanUpdate(plan)}
            onPlanUpdate={handlePlanUpdate}
            onPlanDelete={handlePlanDelete}
          />
        </TabsContent>

        {/* Plans List View */}
        <TabsContent value="plans" className="space-y-6">
          <PlansList
            onPlanSelect={handlePlanUpdate}
            onPlanCreate={handlePlanCreate}
            onPlanEdit={handlePlanUpdate}
            onPlanDelete={handlePlanDelete}
          />
        </TabsContent>

        {/* Templates View */}
        <TabsContent value="templates" className="space-y-6">
          {view === 'list' && (
            <TemplatesList
              onTemplateSelect={handleTemplateUpdate}
              onTemplateCreate={handleTemplateCreate}
              onTemplateEdit={handleTemplateUpdate}
              onTemplateDelete={handleTemplateDelete}
            />
          )}
          {view === 'create' && (
            <TemplateEdit
              onBack={handleBack}
              onSave={handleTemplateSaved}
            />
          )}
          {view === 'edit' && selectedTemplateId && (
            <TemplateEdit
              templateId={selectedTemplateId}
              onBack={handleBack}
              onSave={handleTemplateSaved}
            />
          )}
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analitik & Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Fitur analitik sedang dalam pengembangan</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Creation Form */}
      {showPlanForm && (
        <LessonPlanForm
          onSubmit={handlePlanFormSubmit}
          onCancel={handlePlanFormCancel}
          initialDate={new Date()}
        />
      )}
    </div>
  );
};
