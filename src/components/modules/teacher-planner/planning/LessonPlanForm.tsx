import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, BookOpen, Target, FileText, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type CreatePlanRequest, type LearningObjective, type Resource } from '@/services/teacherPlannerService';
import { classService } from '@/services/classService';
import { type Class } from '@/services/types';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface LessonPlanFormProps {
  onSubmit: (data: CreatePlanRequest) => void;
  onCancel: () => void;
  initialDate?: Date;
  initialData?: Partial<CreatePlanRequest>;
}

export const LessonPlanForm: React.FC<LessonPlanFormProps> = ({
  onSubmit,
  onCancel,
  initialDate,
  initialData
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CreatePlanRequest>({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    scheduledDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    duration: 90,
    learningObjectives: [],
    resources: [],
    status: 'DRAFT',
    ...initialData
  });

  // Learning objectives state
  const [objectives, setObjectives] = useState<LearningObjective[]>(
    initialData?.learningObjectives || []
  );
  const [newObjective, setNewObjective] = useState('');

  // Resources state
  const [resources, setResources] = useState<Resource[]>(
    initialData?.resources || []
  );
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'document' as Resource['type'],
    url: '',
    description: ''
  });

  // Load classes and subjects
  useEffect(() => {
    const loadData = async () => {
      try {
        const classResponse = await classService.getClasses();
        if (classResponse.success) {
          setClasses(classResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof CreatePlanRequest, value: string | number | LearningObjective[] | Resource[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add learning objective
  const addObjective = () => {
    if (newObjective.trim()) {
      const objective: LearningObjective = {
        id: Date.now().toString(),
        objective: newObjective.trim(),
        indicator: '',
        competency: ''
      };
      setObjectives(prev => [...prev, objective]);
      setNewObjective('');
    }
  };

  // Remove learning objective
  const removeObjective = (id: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== id));
  };

  // Add resource
  const addResource = () => {
    if (newResource.title.trim()) {
      const resource: Resource = {
        ...newResource,
        title: newResource.title.trim()
      };
      setResources(prev => [...prev, resource]);
      setNewResource({
        title: '',
        type: 'document',
        url: '',
        description: ''
      });
    }
  };

  // Remove resource
  const removeResource = (index: number) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Judul rencana pembelajaran harus diisi",
        variant: "destructive"
      });
      return;
    }

    if (!formData.classId) {
      toast({
        title: "Error",
        description: "Kelas harus dipilih",
        variant: "destructive"
      });
      return;
    }

    if (!formData.subjectId) {
      toast({
        title: "Error",
        description: "Mata pelajaran harus dipilih",
        variant: "destructive"
      });
      return;
    }

    if (!formData.scheduledDate) {
      toast({
        title: "Error",
        description: "Tanggal pelaksanaan harus diisi",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData: CreatePlanRequest = {
        ...formData,
        learningObjectives: objectives,
        resources: resources
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan rencana pembelajaran",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-hidden={false}
        onOpenAutoFocus={(e) => {
          // Prevent auto-focus to avoid aria-hidden conflicts
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Buat Rencana Pembelajaran</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Judul Rencana Pembelajaran *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Masukkan judul rencana pembelajaran"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Deskripsi singkat tentang rencana pembelajaran"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jadwal & Kelas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="classId">Kelas *</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => handleInputChange('classId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.gradeLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subjectId">Mata Pelajaran *</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => handleInputChange('subjectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Durasi (menit)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    min="1"
                    placeholder="90"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Tanggal Pelaksanaan *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Tujuan Pembelajaran</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Tambah tujuan pembelajaran..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button type="button" onClick={addObjective} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {objectives.length > 0 && (
                <div className="space-y-2">
                  {objectives.map((objective) => (
                    <div key={objective.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm">{objective.objective}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjective(objective.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Sumber Daya</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resourceTitle">Judul Sumber Daya</Label>
                  <Input
                    id="resourceTitle"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nama sumber daya..."
                  />
                </div>
                <div>
                  <Label htmlFor="resourceType">Tipe</Label>
                  <Select
                    value={newResource.type}
                    onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value as Resource['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Dokumen</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Gambar</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="resourceUrl">URL (opsional)</Label>
                <Input
                  id="resourceUrl"
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex space-x-2">
                <Input
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi sumber daya..."
                  className="flex-1"
                />
                <Button type="button" onClick={addResource} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {resources.length > 0 && (
                <div className="space-y-2">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{resource.type}</Badge>
                          <span className="text-sm font-medium">{resource.title}</span>
                        </div>
                        {resource.description && (
                          <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                        )}
                        {resource.url && (
                          <p className="text-xs text-blue-600 mt-1">{resource.url}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Catatan tambahan untuk rencana pembelajaran..."
                rows={3}
              />
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Rencana'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
