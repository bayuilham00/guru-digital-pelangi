import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { templateService, type Template } from '@/services/templateService';

interface TemplateDetailProps {
  templateId: string;
  onBack: () => void;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (templateId: string) => void;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({
  templateId,
  onBack,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await templateService.getTemplate(templateId);
        if (response.success && response.data) {
          setTemplate(response.data);
        } else {
          toast({
            title: "Error",
            description: "Gagal memuat template",
            variant: "destructive"
          });
          onBack();
        }
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: "Error",
          description: "Gagal memuat template",
          variant: "destructive"
        });
        onBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, toast, onBack]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!template) {
    return <div>Template tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onDuplicate(templateId)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplikasi
          </Button>
          <Button onClick={() => onEdit(template)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(templateId)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{template.description}</p>
          <div className="mt-4">
            <strong>Mata Pelajaran:</strong> {template.subject?.name}
          </div>
          <div>
            <strong>Durasi:</strong> {template.estimatedDuration} menit
          </div>
          <div>
            <strong>Dibuat oleh:</strong> {template.createdByUser?.fullName}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { TemplateDetail };
export default TemplateDetail;