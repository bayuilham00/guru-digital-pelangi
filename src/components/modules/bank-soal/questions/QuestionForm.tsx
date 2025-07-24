import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Eye, X, Plus, Trash2, ArrowUp, ArrowDown, Clock, Target, Tags, HelpCircle } from 'lucide-react';
import { Question, QuestionOption, CreateQuestionRequest, UpdateQuestionRequest } from '@/types/bankSoal';
import { bankSoalService } from '@/services/bankSoalService';
import DifficultyBadge from '../shared/DifficultyBadge';
import MultipleChoiceOptions from './MultipleChoiceOptions';
import EssayQuestionHandler from './EssayQuestionHandler';
import TrueFalseQuestionHandler from './TrueFalseQuestionHandler';
import { toast } from 'sonner';

interface QuestionFormProps {
  question?: Question; // For editing existing question
  onSave: (question: Question) => void;
  onCancel: () => void;
  onPreview?: (question: Partial<Question>) => void;
  subjects?: Array<{ id: string; name: string; code: string }>;
  topics?: Array<{ id: string; name: string; subjectId: string }>;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onSave,
  onCancel,
  onPreview,
  subjects = [],
  topics = []
}) => {
  const isEditing = !!question;
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    questionText: question?.questionText || '',
    questionType: question?.questionType || 'MULTIPLE_CHOICE',
    difficulty: question?.difficulty || 'MEDIUM',
    subjectId: question?.subjectId || '',
    topicId: question?.topicId || 'no-topic',
    gradeLevel: question?.gradeLevel || '',
    correctAnswer: question?.correctAnswer || '',
    explanation: question?.explanation || '',
    points: question?.points || 10,
    timeLimit: question?.timeLimit || 0,
    tags: question?.tags || [],
    isPublic: question?.isPublic ?? false,
    // Additional fields for essay questions
    scoringRubric: '',
    keywords: [] as string[],
    scoringMethod: 'MANUAL'
  });

  // Options for multiple choice questions
  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>(
    question?.options || [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  );

  // Tag input
  const [tagInput, setTagInput] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter topics based on selected subject
  const filteredTopics = topics.filter(topic => 
    !formData.subjectId || topic.subjectId === formData.subjectId
  );

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, options, hasUnsavedChanges]);

  // Load draft from localStorage
  useEffect(() => {
    if (!isEditing) {
      const draft = localStorage.getItem('bankSoal_questionDraft');
      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          setFormData(draftData.formData || formData);
          setOptions(draftData.options || options);
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, []);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveDraft = useCallback(() => {
    if (!isEditing) {
      const draft = {
        formData,
        options,
        timestamp: Date.now()
      };
      localStorage.setItem('bankSoal_questionDraft', JSON.stringify(draft));
    }
  }, [formData, options, isEditing]);

  const clearDraft = () => {
    localStorage.removeItem('bankSoal_questionDraft');
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Real-time validation
    const fieldError = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setOptions(prev => prev.map((option, i) => {
      if (i === index) {
        if (field === 'isCorrect' && value === true) {
          // Only one option can be correct for multiple choice
          return prev.map((opt, idx) => ({
            ...opt,
            isCorrect: idx === index
          }));
        }
        return { ...option, [field]: value };
      }
      return option;
    }));
    setHasUnsavedChanges(true);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions(prev => [...prev, { text: '', isCorrect: false }]);
      setHasUnsavedChanges(true);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
      setHasUnsavedChanges(true);
    }
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < options.length) {
      setOptions(prev => {
        const newOptions = [...prev];
        [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
        return newOptions;
      });
      setHasUnsavedChanges(true);
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

    // Basic validation
    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Teks soal wajib diisi';
    } else if (formData.questionText.length < 10) {
      newErrors.questionText = 'Teks soal minimal 10 karakter';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Mata pelajaran wajib dipilih';
    }

    if (!formData.gradeLevel) {
      newErrors.gradeLevel = 'Tingkat kelas wajib dipilih';
    }

    if (formData.points <= 0) {
      newErrors.points = 'Poin harus lebih dari 0';
    }

    // Question type specific validation
    if (formData.questionType === 'MULTIPLE_CHOICE' || formData.questionType === 'MULTIPLE_CHOICE_COMPLEX') {
      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'Minimal harus ada 2 pilihan jawaban';
      }

      const correctOptions = options.filter(opt => opt.isCorrect && opt.text.trim());
      if (correctOptions.length === 0) {
        newErrors.correctAnswer = 'Harus ada minimal 1 jawaban yang benar';
      }
    }

    if (formData.questionType === 'TRUE_FALSE') {
      if (!formData.correctAnswer) {
        newErrors.correctAnswer = 'Jawaban benar harus dipilih';
      }
    }

    if (formData.questionType === 'ESSAY') {
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = 'Jawaban yang disarankan wajib diisi untuk soal essay';
      }
    }

    if (formData.questionType === 'FILL_BLANK') {
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = 'Jawaban yang benar wajib diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  const validateField = (field: string, value: string | number | boolean | string[]): string => {
    switch (field) {
      case 'questionText':
        if (typeof value === 'string') {
          if (!value.trim()) return 'Teks soal wajib diisi';
          if (value.length < 10) return 'Teks soal minimal 10 karakter';
        }
        break;
      case 'subjectId':
        if (!value) return 'Mata pelajaran wajib dipilih';
        break;
      case 'gradeLevel':
        if (!value) return 'Tingkat kelas wajib dipilih';
        break;
      case 'points':
        if (typeof value === 'number' && value <= 0) return 'Poin harus lebih dari 0';
        break;
      case 'correctAnswer':
        if (typeof value === 'string') {
          if (formData.questionType === 'TRUE_FALSE' && !value) {
            return 'Jawaban benar harus dipilih';
          }
          if (formData.questionType === 'ESSAY' && !value.trim()) {
            return 'Jawaban yang disarankan wajib diisi untuk soal essay';
          }
          if (formData.questionType === 'FILL_BLANK' && !value.trim()) {
            return 'Jawaban yang benar wajib diisi';
          }
        }
        break;
    }
    return '';
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    setIsSaving(true);
    try {
      const questionData: CreateQuestionRequest | UpdateQuestionRequest = {
        questionText: formData.questionText.trim(),
        questionType: formData.questionType as 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_COMPLEX' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY' | 'MATCHING',
        difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        subjectId: formData.subjectId,
        topicId: formData.topicId && formData.topicId !== 'no-topic' ? formData.topicId : undefined,
        gradeLevel: formData.gradeLevel,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation.trim() || undefined,
        points: formData.points,
        timeLimit: formData.timeLimit > 0 ? formData.timeLimit : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isPublic: formData.isPublic,
        options: ['MULTIPLE_CHOICE', 'MULTIPLE_CHOICE_COMPLEX'].includes(formData.questionType) 
          ? options.filter(opt => opt.text.trim()) 
          : undefined
      };

      let response;
      if (isEditing) {
        response = await bankSoalService.updateQuestion(question!.id, questionData as UpdateQuestionRequest);
      } else {
        response = await bankSoalService.createQuestion(questionData as CreateQuestionRequest);
      }

      if (response.success) {
        toast.success(isEditing ? 'Soal berhasil diperbarui' : 'Soal berhasil dibuat');
        clearDraft();
        setHasUnsavedChanges(false);
        onSave(response.data);
      } else {
        toast.error(response.message || 'Gagal menyimpan soal');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Terjadi kesalahan saat menyimpan soal');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const previewData = {
      ...formData,
      options: ['MULTIPLE_CHOICE', 'MULTIPLE_CHOICE_COMPLEX'].includes(formData.questionType) 
        ? options.filter(opt => opt.text.trim()) 
        : undefined
    };
    onPreview?.(previewData);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // Will be handled by AlertDialog
      return;
    }
    clearDraft();
    onCancel();
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="questionText">
          Teks Soal <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="questionText"
          placeholder="Masukkan teks soal..."
          value={formData.questionText}
          onChange={(e) => handleInputChange('questionText', e.target.value)}
          className={`min-h-[120px] ${errors.questionText ? 'border-red-500' : ''}`}
        />
        {errors.questionText && (
          <p className="text-sm text-red-500">{errors.questionText}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="questionType">
            Jenis Soal <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.questionType}
            onValueChange={(value) => handleInputChange('questionType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis soal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
              <SelectItem value="MULTIPLE_CHOICE_COMPLEX">Pilihan Ganda Kompleks</SelectItem>
              <SelectItem value="TRUE_FALSE">Benar/Salah</SelectItem>
              <SelectItem value="FILL_BLANK">Isi Kosong</SelectItem>
              <SelectItem value="ESSAY">Esai</SelectItem>
              <SelectItem value="MATCHING">Menjodohkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">
            Tingkat Kesulitan <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => handleInputChange('difficulty', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tingkat kesulitan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Mudah</SelectItem>
              <SelectItem value="MEDIUM">Sedang</SelectItem>
              <SelectItem value="HARD">Sulit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subjectId">
            Mata Pelajaran <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.subjectId}
            onValueChange={(value) => {
              handleInputChange('subjectId', value);
              handleInputChange('topicId', 'no-topic'); // Reset topic when subject changes
            }}
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
          <Label htmlFor="topicId">Topik (Opsional)</Label>
          <Select
            value={formData.topicId}
            onValueChange={(value) => handleInputChange('topicId', value)}
            disabled={!formData.subjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih topik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-topic">Tanpa Topik</SelectItem>
              {filteredTopics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Soal' : 'Buat Soal Baru'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Perbarui informasi soal' : 'Buat soal baru untuk bank soal'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD'} />
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600">
              Belum Tersimpan
            </Badge>
          )}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Informasi Soal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Dasar</TabsTrigger>
              <TabsTrigger value="answers">Jawaban</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
              <TabsTrigger value="advanced">Lanjutan</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="answers" className="space-y-6">
              {/* Multiple Choice Handler */}
              {(formData.questionType === 'MULTIPLE_CHOICE' || formData.questionType === 'MULTIPLE_CHOICE_COMPLEX') && (
                <MultipleChoiceOptions
                  options={options}
                  onOptionsChange={setOptions}
                  allowMultiple={formData.questionType === 'MULTIPLE_CHOICE_COMPLEX'}
                  readOnly={false}
                />
              )}

              {/* True/False Handler */}
              {formData.questionType === 'TRUE_FALSE' && (
                <TrueFalseQuestionHandler
                  correctAnswer={formData.correctAnswer}
                  explanation={formData.explanation}
                  onCorrectAnswerChange={(answer) => handleInputChange('correctAnswer', answer)}
                  onExplanationChange={(explanation) => handleInputChange('explanation', explanation)}
                  readOnly={false}
                />
              )}

              {/* Essay Handler */}
              {formData.questionType === 'ESSAY' && (
                <EssayQuestionHandler
                  suggestedAnswer={formData.correctAnswer}
                  scoringRubric={formData.scoringRubric || ''}
                  keywordsList={formData.keywords || []}
                  scoringMethod={formData.scoringMethod || 'MANUAL'}
                  onSuggestedAnswerChange={(answer) => handleInputChange('correctAnswer', answer)}
                  onScoringRubricChange={(rubric) => handleInputChange('scoringRubric', rubric)}
                  onKeywordsChange={(keywords) => handleInputChange('keywords', keywords)}
                  onScoringMethodChange={(method) => handleInputChange('scoringMethod', method)}
                  readOnly={false}
                />
              )}

              {/* Fill in the Blank Handler */}
              {formData.questionType === 'FILL_BLANK' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Konfigurasi Soal Isi Kosong</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="correctAnswer">Jawaban yang Benar</Label>
                        <Input
                          id="correctAnswer"
                          value={formData.correctAnswer}
                          onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                          placeholder="Masukkan jawaban yang benar"
                        />
                      </div>
                      <div>
                        <Label htmlFor="explanation">Penjelasan (Opsional)</Label>
                        <Textarea
                          id="explanation"
                          value={formData.explanation}
                          onChange={(e) => handleInputChange('explanation', e.target.value)}
                          placeholder="Penjelasan jawaban..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Matching Handler */}
              {formData.questionType === 'MATCHING' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Konfigurasi Soal Menjodohkan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <p>Fitur soal menjodohkan akan dikembangkan pada fase selanjutnya</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="points" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Poin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                    className={errors.points ? 'border-red-500' : ''}
                  />
                  {errors.points && (
                    <p className="text-sm text-red-500">{errors.points}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Batas Waktu (menit)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="0"
                    max="180"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 0)}
                    placeholder="0 = tanpa batas waktu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Penjelasan Jawaban
                </Label>
                <Textarea
                  id="explanation"
                  placeholder="Masukkan penjelasan jawaban (opsional)..."
                  value={formData.explanation}
                  onChange={(e) => handleInputChange('explanation', e.target.value)}
                  className={`min-h-[100px] ${errors.explanation ? 'border-red-500' : ''}`}
                />
                {errors.explanation && (
                  <p className="text-sm text-red-500">{errors.explanation}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
                <Label htmlFor="isPublic" className="flex items-center gap-2">
                  Soal Publik
                  <span className="text-sm text-gray-500">
                    (dapat dilihat oleh guru lain)
                  </span>
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Tags
                </Label>
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
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between bg-white p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
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
                  <AlertDialogAction onClick={() => { clearDraft(); onCancel(); }}>
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

export default QuestionForm;
