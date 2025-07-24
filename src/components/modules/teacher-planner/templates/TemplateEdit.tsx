import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import { templateService, type Template } from '@/services/templateService';
import { subjectsService, type Subject } from '@/services/subjectsService';
import { geminiService } from '@/services/geminiService';

interface TemplateEditProps {
  templateId?: string;
  onBack: () => void;
  onSave: (template: Template) => void;
  onCancel?: () => void; // onCancel is now optional
}

const TemplateEdit: React.FC<TemplateEditProps> = ({ templateId, onBack, onSave, onCancel }) => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<Partial<Template>>({
    name: '',
    description: '',
    subjectId: undefined,
    isPublic: false,
    templateStructure: {},
    estimatedDuration: 90,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  const isEditMode = !!templateId;

  const loadTemplate = useCallback(async () => {
    if (!templateId) return;
    setIsLoading(true);
    try {
      const response = await templateService.getTemplate(templateId);
      if (response.success && response.data) {
        setTemplate(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal memuat data template.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat template.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [templateId, toast]);

  const loadSubjects = useCallback(async () => {
    try {
      const response = await subjectsService.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error("Failed to load subjects", error);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
    if (isEditMode) {
      loadTemplate();
    } else {
      setIsLoading(false);
    }
  }, [isEditMode, loadTemplate, loadSubjects]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!template?.name?.trim()) {
      newErrors.name = "Nama template tidak boleh kosong.";
    }
    if (!template?.subjectId) {
      newErrors.subjectId = "Mata pelajaran harus dipilih.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !template) return;

    setIsSaving(true);
    try {
      const response = isEditMode
        ? await templateService.updateTemplate(templateId, template)
        : await templateService.createTemplate(template);

      if (response.success && response.data) {
        toast({
          title: "Sukses",
          description: `Template berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}.`,
        });
        onSave(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || `Gagal ${isEditMode ? 'memperbarui' : 'membuat'} template.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat menyimpan template.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string | boolean) => {
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleAiGenerate = async () => {
    if (!template.subjectId) {
      toast({
        title: 'Info',
        description: 'Pilih mata pelajaran terlebih dahulu untuk hasil yang lebih baik.',
        variant: 'default',
      });
      return;
    }

    const subjectName = subjects.find(s => s.id === template.subjectId)?.name || 'Umum';

    setIsGenerating(true);
    try {
      const response = await geminiService.generateTemplate({
        subject: subjectName,
        topic: template.name || 'Rencana Pembelajaran',
        duration: template.estimatedDuration || 90,
      });

      if (response.content) {
        const generatedContent = {
          generated_by: 'gemini',
          source: 'AI Generation',
          content: response.content,
        };
        setTemplate(prev => ({ ...prev, templateStructure: generatedContent }));
        toast({
          title: 'Sukses',
          description: 'Konten template berhasil dibuat dengan AI.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat konten dengan AI.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{isEditMode ? 'Edit' : 'Buat'} Template Pembelajaran</CardTitle>
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Template</Label>
          <Input
            id="name"
            name="name"
            value={template.name}
            onChange={handleInputChange}
            placeholder="Contoh: Rencana Harian Matematika Bab 1"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            value={template.description || ''}
            onChange={handleInputChange}
            placeholder="Deskripsi singkat tentang template ini"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="subjectId">Mata Pelajaran</Label>
            <Select
              name="subjectId"
              value={template.subjectId || ''}
              onValueChange={(value) => handleSelectChange('subjectId', value)}
            >
              <SelectTrigger className={errors.subjectId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectId && <p className="text-red-500 text-sm">{errors.subjectId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Estimasi Durasi (menit)</Label>
            <Input
              id="estimatedDuration"
              name="estimatedDuration"
              type="number"
              value={template.estimatedDuration || ''}
              onChange={handleInputChange}
              placeholder="Contoh: 90"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="templateStructure">Konten Template</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate with AI
            </Button>
          </div>
          <Textarea
            id="templateStructure"
            name="templateStructure"
            value={
              typeof template.templateStructure === 'string'
                ? template.templateStructure
                : JSON.stringify(template.templateStructure, null, 2)
            }
            onChange={handleInputChange}
            placeholder="Isi konten template, bisa dalam format JSON atau teks biasa. Atau, gunakan AI untuk membuatnya."
            rows={10}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPublic"
            checked={template.isPublic}
            onCheckedChange={(checked) => handleSelectChange('isPublic', !!checked)}
          />
          <Label htmlFor="isPublic" className="cursor-pointer">
            Jadikan template ini publik
          </Label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel || onBack}>
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isEditMode ? 'Simpan Perubahan' : 'Simpan Template'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateEdit;