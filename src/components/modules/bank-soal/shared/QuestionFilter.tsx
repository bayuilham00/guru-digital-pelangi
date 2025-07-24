import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Filter } from 'lucide-react';
import { QuestionFilters } from '@/types/bankSoal';

interface QuestionFilterProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: QuestionFilters) => void;
  subjects?: Array<{ id: string; name: string; code: string }>;
  topics?: Array<{ id: string; name: string; subjectId: string }>;
  compact?: boolean;
}

const QuestionFilter: React.FC<QuestionFilterProps> = ({
  filters,
  onFiltersChange,
  subjects = [],
  topics = [],
  compact = false
}) => {
  const [localFilters, setLocalFilters] = useState<QuestionFilters>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof QuestionFilters, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: QuestionFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleClearSpecificFilter = (key: keyof QuestionFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Filter topics based on selected subject
  const filteredTopics = topics.filter(topic => 
    !localFilters.subjectId || topic.subjectId === localFilters.subjectId
  );

  const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
    { value: 'MULTIPLE_CHOICE_COMPLEX', label: 'Pilihan Ganda Kompleks' },
    { value: 'TRUE_FALSE', label: 'Benar/Salah' },
    { value: 'FILL_BLANK', label: 'Isi Kosong' },
    { value: 'FILL_IN_BLANK', label: 'Isi Kosong' },
    { value: 'ESSAY', label: 'Esai' },
    { value: 'MATCHING', label: 'Menjodohkan' }
  ];

  const difficulties = [
    { value: 'EASY', label: 'Mudah' },
    { value: 'MEDIUM', label: 'Sedang' },
    { value: 'HARD', label: 'Sulit' }
  ];

  const gradeLevels = [
    '7', '8', '9', '10', '11', '12'
  ];

  const hasActiveFilters = Object.keys(localFilters).some(key => localFilters[key as keyof QuestionFilters] !== undefined);

  return (
    <div className={`space-y-4 ${compact ? 'space-y-2' : ''}`}>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Filter aktif:</span>
          {Object.entries(localFilters).map(([key, value]) => {
            if (value === undefined || value === null || value === '') return null;
            
            let displayValue = value;
            if (key === 'subjectId') {
              const subject = subjects.find(s => s.id === value);
              displayValue = subject?.name || value;
            } else if (key === 'topicId') {
              const topic = topics.find(t => t.id === value);
              displayValue = topic?.name || value;
            } else if (key === 'difficulty') {
              const difficulty = difficulties.find(d => d.value === value);
              displayValue = difficulty?.label || value;
            } else if (key === 'questionType') {
              const type = questionTypes.find(t => t.value === value);
              displayValue = type?.label || value;
            } else if (key === 'isPublic') {
              displayValue = value ? 'Publik' : 'Privat';
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleClearSpecificFilter(key as keyof QuestionFilters)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-xs"
          >
            Hapus Semua
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
        {/* Subject Filter */}
        <div>
          <Label className="text-sm font-medium">Mata Pelajaran</Label>
          <Select
            value={localFilters.subjectId || 'all-subjects'}
            onValueChange={(value) => handleFilterChange('subjectId', value === 'all-subjects' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semua Mata Pelajaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-subjects">Semua Mata Pelajaran</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic Filter */}
        <div>
          <Label className="text-sm font-medium">Topik</Label>
          <Select
            value={localFilters.topicId || 'all-topics'}
            onValueChange={(value) => handleFilterChange('topicId', value === 'all-topics' ? undefined : value)}
            disabled={!localFilters.subjectId}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semua Topik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-topics">Semua Topik</SelectItem>
              {filteredTopics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <Label className="text-sm font-medium">Tingkat Kesulitan</Label>
          <Select
            value={localFilters.difficulty || 'all-difficulties'}
            onValueChange={(value) => handleFilterChange('difficulty', value === 'all-difficulties' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semua Tingkat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-difficulties">Semua Tingkat</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Type Filter */}
        <div>
          <Label className="text-sm font-medium">Jenis Soal</Label>
          <Select
            value={localFilters.questionType || 'all-types'}
            onValueChange={(value) => handleFilterChange('questionType', value === 'all-types' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">Semua Jenis</SelectItem>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Level Filter */}
        <div>
          <Label className="text-sm font-medium">Kelas</Label>
          <Select
            value={localFilters.gradeLevel || 'all-grades'}
            onValueChange={(value) => handleFilterChange('gradeLevel', value === 'all-grades' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-grades">Semua Kelas</SelectItem>
              {gradeLevels.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Kelas {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Points Range */}
        <div>
          <Label className="text-sm font-medium">Minimum Poin</Label>
          <Input
            type="number"
            placeholder="0"
            value={localFilters.minPoints || ''}
            onChange={(e) => handleFilterChange('minPoints', e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1"
          />
        </div>

        {/* Time Limit Filter */}
        <div>
          <Label className="text-sm font-medium">Batas Waktu (menit)</Label>
          <Input
            type="number"
            placeholder="Semua"
            value={localFilters.timeLimit || ''}
            onChange={(e) => handleFilterChange('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
            className="mt-1"
          />
        </div>

        {/* Public/Private Filter */}
        <div>
          <Label className="text-sm font-medium">Visibilitas</Label>
          <Select
            value={localFilters.isPublic !== undefined ? localFilters.isPublic.toString() : 'all-visibility'}
            onValueChange={(value) => handleFilterChange('isPublic', value === 'all-visibility' ? undefined : value === 'true')}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-visibility">Semua</SelectItem>
              <SelectItem value="true">Publik</SelectItem>
              <SelectItem value="false">Privat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Options */}
      {!compact && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Opsi Lanjutan</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-explanation"
                checked={localFilters.hasExplanation || false}
                onCheckedChange={(checked) => handleFilterChange('hasExplanation', checked)}
              />
              <Label htmlFor="has-explanation" className="text-sm">
                Memiliki Penjelasan
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-time-limit"
                checked={localFilters.hasTimeLimit || false}
                onCheckedChange={(checked) => handleFilterChange('hasTimeLimit', checked)}
              />
              <Label htmlFor="has-time-limit" className="text-sm">
                Memiliki Batas Waktu
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-tags"
                checked={localFilters.hasTags || false}
                onCheckedChange={(checked) => handleFilterChange('hasTags', checked)}
              />
              <Label htmlFor="has-tags" className="text-sm">
                Memiliki Tags
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFilter;
