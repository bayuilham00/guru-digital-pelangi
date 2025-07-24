import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teacherPlannerService, type TeacherPlan, type CalendarData, type CreatePlanRequest } from '@/services/teacherPlannerService';
import { useToast } from '@/hooks/use-toast';
import { LessonPlanForm } from '../planning/LessonPlanForm';
import { PlanCard } from '../common/PlanCard';

interface CalendarViewProps {
  onPlanCreate?: (plan: TeacherPlan) => void;
  onPlanUpdate?: (plan: TeacherPlan) => void;
  onPlanDelete?: (planId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onPlanCreate,
  onPlanUpdate,
  onPlanDelete
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  // Get the first and last day of the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Load calendar data
  const loadCalendarData = useCallback(async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await teacherPlannerService.getPlansForMonth(year, month);
      
      if (response.success) {
        setCalendarData(response.data || {});
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal memuat data kalender",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kalender",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, toast]);

  // Load data when month changes
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Get plans for a specific date
  const getPlansForDate = (date: Date): TeacherPlan[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const plans = calendarData[dateKey] || [];
    
    // Apply filters
    let filteredPlans = plans;
    
    if (searchTerm) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filteredPlans = filteredPlans.filter(plan => plan.status === statusFilter);
    }
    
    return filteredPlans;
  };

  // Handle plan creation
  const handlePlanCreate = async (planData: CreatePlanRequest) => {
    try {
      const response = await teacherPlannerService.createPlan(planData);
      if (response.success) {
        toast({
          title: "Sukses",
          description: "Rencana pembelajaran berhasil dibuat",
        });
        setShowCreateForm(false);
        await loadCalendarData();
        onPlanCreate?.(response.data!);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal membuat rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Gagal membuat rencana pembelajaran",
        variant: "destructive"
      });
    }
  };

  // Handle plan update
  const handlePlanUpdate = async (planId: string, planData: Partial<CreatePlanRequest>) => {
    try {
      const response = await teacherPlannerService.updatePlan(planId, planData);
      if (response.success) {
        toast({
          title: "Sukses",
          description: "Rencana pembelajaran berhasil diupdate",
        });
        await loadCalendarData();
        onPlanUpdate?.(response.data!);
      } else {
        toast({
          title: "Error",
          description: response.error || "Gagal mengupdate rencana pembelajaran",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate rencana pembelajaran",
        variant: "destructive"
      });
    }
  };

  // Handle plan deletion
  const handlePlanDelete = async (planId: string) => {
    try {
      const response = await teacherPlannerService.deletePlan(planId);
      if (response.success) {
        toast({
          title: "Sukses",
          description: "Rencana pembelajaran berhasil dihapus",
        });
        await loadCalendarData();
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'PUBLISHED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Planner</h1>
            <p className="text-sm text-gray-600">Kelola rencana pembelajaran Anda</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Rencana
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari rencana pembelajaran..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousMonth}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </Button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy', { locale: id })}
        </h2>
        
        <Button
          variant="outline"
          onClick={goToNextMonth}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Memuat kalender...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date) => {
                const plans = getPlansForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                
                return (
                  <div
                    key={date.toString()}
                    className={`
                      min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors
                      ${!isSameMonth(date, currentDate) ? 'bg-gray-50 opacity-50' : ''}
                      ${isToday(date) ? 'bg-blue-50 border-blue-200' : ''}
                      ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                      hover:bg-gray-50
                    `}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {plans.slice(0, 3).map((plan) => (
                        <div
                          key={plan.id}
                          className={`
                            text-xs px-2 py-1 rounded truncate
                            ${getStatusColor(plan.status)}
                          `}
                          title={plan.title}
                        >
                          {plan.title}
                        </div>
                      ))}
                      
                      {plans.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{plans.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Plans */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Rencana untuk {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getPlansForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Tidak ada rencana pembelajaran untuk tanggal ini</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Rencana
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {getPlansForDate(selectedDate).map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={(planData) => handlePlanUpdate(plan.id, planData)}
                    onDelete={() => handlePlanDelete(plan.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <LessonPlanForm
          onSubmit={handlePlanCreate}
          onCancel={() => setShowCreateForm(false)}
          initialDate={selectedDate || new Date()}
        />
      )}
    </div>
  );
};
