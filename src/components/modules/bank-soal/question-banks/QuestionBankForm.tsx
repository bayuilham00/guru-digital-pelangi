import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, X, BookOpen, Settings, Users, Globe, Lock } from 'lucide-react';
import { QuestionBank, CreateQuestionBankRequest, UpdateQuestionBankRequest } from '@/types/bankSoal';
import { bankSoalService } from '@/services/bankSoalService';
import { toast } from 'sonner';

interface QuestionBankFormProps {
  bank?: QuestionBank;
  onSave: (bank: QuestionBank) => void;
  onCancel: () => void;
  subjects?: Array<{ id: string; name: string; code: string }>;
}

const QuestionBankForm: React.FC<QuestionBankFormProps> = ({
  bank,
  onSave,
  onCancel,
  subjects = []
}) => {
  const isEditing = !!bank;
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: bank?.name || '',
    description: bank?.description || '',
    subjectId: bank?.subjectId || '',
    gradeLevel: bank?.gradeLevel || '',
    isPublic: bank?.isPublic ?? false,
    allowSharing: bank?.allowSharing ?? true,
    tags: bank?.tags || [],
    category: bank?.category || 'no-category',
    difficulty: bank?.difficulty || 'MIXED'
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof typeof formData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama bank soal wajib diisi';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama bank soal minimal 3 karakter';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi bank soal wajib diisi';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Deskripsi minimal 10 karakter';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Mata pelajaran wajib dipilih';
    }

    if (!formData.gradeLevel) {
      newErrors.gradeLevel = 'Tingkat kelas wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      let savedBank: QuestionBank;
      
      if (isEditing) {
        const updateData: UpdateQuestionBankRequest = {
          name: formData.name,
          description: formData.description,
          subjectId: formData.subjectId,
          gradeLevel: formData.gradeLevel,
          isPublic: formData.isPublic,
          allowSharing: formData.allowSharing,
          tags: formData.tags,
          category: formData.category === 'no-category' ? '' : formData.category,
          difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'
        };
        savedBank = await bankSoalService.updateQuestionBank(bank!.id, updateData);
        toast.success('Bank soal berhasil diperbarui');
      } else {
        const createData: CreateQuestionBankRequest = {
          name: formData.name,
          description: formData.description,
          subjectId: formData.subjectId,
          gradeLevel: formData.gradeLevel,
          isPublic: formData.isPublic,
          allowSharing: formData.allowSharing,
          tags: formData.tags,
          category: formData.category === 'no-category' ? '' : formData.category,
          difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'
        };
        savedBank = await bankSoalService.createQuestionBank(createData);
        toast.success('Bank soal berhasil dibuat');
      }

      setHasUnsavedChanges(false);
      onSave(savedBank);
    } catch (error) {
      toast.error(isEditing ? 'Gagal memperbarui bank soal' : 'Gagal membuat bank soal');
      console.error('Error saving bank:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // Let AlertDialog handle the confirmation
      return;
    }
    onCancel();
  };

  const selectedSubject = subjects.find(s => s.id === formData.subjectId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Bank Soal' : 'Buat Bank Soal Baru'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Perbarui informasi bank soal' : 'Buat bank soal baru untuk mengorganisir soal-soal'}
          </p>
        </div>
        <BookOpen className="h-8 w-8 text-blue-600" />
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informasi Bank Soal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Bank Soal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama bank soal..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Masukkan deskripsi bank soal..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectId">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => handleInputChange('subjectId', value)}
                >
                  <SelectTrigger className={errors.subjectId ? 'border-red-500' : ''}>
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
                {errors.subjectId && (
                  <p className="text-sm text-red-500">{errors.subjectId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeLevel">
                  Tingkat Kelas <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => handleInputChange('gradeLevel', value)}
                >
                  <SelectTrigger className={errors.gradeLevel ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pilih tingkat kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {['7', '8', '9', '10', '11', '12'].map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Kelas {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gradeLevel && (
                  <p className="text-sm text-red-500">{errors.gradeLevel}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">Tanpa Kategori</SelectItem>
                    <SelectItem value="ULANGAN_HARIAN">Ulangan Harian</SelectItem>
                    <SelectItem value="ULANGAN_TENGAH_SEMESTER">Ulangan Tengah Semester</SelectItem>
                    <SelectItem value="ULANGAN_AKHIR_SEMESTER">Ulangan Akhir Semester</SelectItem>
                    <SelectItem value="UJIAN_NASIONAL">Ujian Nasional</SelectItem>
                    <SelectItem value="LATIHAN">Latihan</SelectItem>
                    <SelectItem value="REMEDIAL">Remedial</SelectItem>
                    <SelectItem value="PENGAYAAN">Pengayaan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat kesulitan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIXED">Campuran</SelectItem>
                    <SelectItem value="EASY">Mudah</SelectItem>
                    <SelectItem value="MEDIUM">Sedang</SelectItem>
                    <SelectItem value="HARD">Sulit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tambah tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                Tambah
              </Button>
            </div>
          </div>

          <Separator />

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Pengaturan Visibilitas</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="isPublic" className="font-medium">
                      Bank Soal Publik
                    </Label>
                    <p className="text-sm text-gray-600">
                      Izinkan guru lain untuk melihat dan menggunakan bank soal ini
                    </p>
                  </div>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="allowSharing" className="font-medium">
                      Izinkan Berbagi
                    </Label>
                    <p className="text-sm text-gray-600">
                      Izinkan guru lain untuk membagikan bank soal ini
                    </p>
                  </div>
                </div>
                <Switch
                  id="allowSharing"
                  checked={formData.allowSharing}
                  onCheckedChange={(checked) => handleInputChange('allowSharing', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Mata Pelajaran:</span>
              <span className="font-medium">{selectedSubject?.name || 'Belum dipilih'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tingkat Kelas:</span>
              <span className="font-medium">{formData.gradeLevel ? `Kelas ${formData.gradeLevel}` : 'Belum dipilih'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kategori:</span>
              <span className="font-medium">{formData.category || 'Tanpa kategori'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Visibilitas:</span>
              <div className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
                <span className="font-medium">
                  {formData.isPublic ? 'Publik' : 'Pribadi'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between bg-white p-4 border rounded-lg">
        <div className="text-sm text-gray-600">
          {hasUnsavedChanges && (
            <span className="text-amber-600">* Anda memiliki perubahan yang belum disimpan</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Buang Perubahan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda memiliki perubahan yang belum tersimpan. Apakah Anda yakin ingin membatalkan?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Tetap Edit</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>
                    Buang Perubahan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
          )}
          
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankForm;
