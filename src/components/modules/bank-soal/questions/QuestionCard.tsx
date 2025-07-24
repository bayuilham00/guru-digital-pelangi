import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Eye, MoreVertical, Clock, Target, Tag, User } from 'lucide-react';
import { Question } from '@/types/bankSoal';

interface QuestionCardProps {
  question: Question;
  onEdit?: (question: Question) => void;
  onDelete?: (questionId: string) => void;
  onPreview?: (question: Question) => void;
  onSelect?: (question: Question) => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  onPreview,
  onSelect,
  isSelected = false,
  showActions = true,
  compact = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'Pilihan Ganda';
      case 'MULTIPLE_CHOICE_COMPLEX': return 'Pilihan Ganda Kompleks';
      case 'TRUE_FALSE': return 'Benar/Salah';
      case 'FILL_BLANK': return 'Isi Kosong';
      case 'FILL_IN_BLANK': return 'Isi Kosong';
      case 'ESSAY': return 'Esai';
      case 'MATCHING': return 'Menjodohkan';
      default: return type;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(question)}
    >
      <CardHeader className={`pb-3 ${compact ? 'p-4' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                {question.difficulty === 'EASY' ? 'Mudah' : 
                 question.difficulty === 'MEDIUM' ? 'Sedang' : 'Sulit'}
              </Badge>
              <Badge variant="secondary">
                {getQuestionTypeLabel(question.questionType)}
              </Badge>
              {question.isPublic && (
                <Badge variant="outline" className="text-blue-600">
                  Publik
                </Badge>
              )}
            </div>
            <CardTitle className={`${compact ? 'text-base' : 'text-lg'} font-semibold line-clamp-2`}>
              {truncateText(question.questionText, compact ? 80 : 120)}
            </CardTitle>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onPreview && (
                  <DropdownMenuItem onClick={() => onPreview(question)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Preview
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(question)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(question.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`pt-0 ${compact ? 'p-4 pt-0' : ''}`}>
        <div className="space-y-3">
          {/* Question Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {question.subject && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{question.subject.name}</span>
              </div>
            )}
            {question.topic && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>{question.topic.name}</span>
              </div>
            )}
            {question.gradeLevel && (
              <div className="flex items-center gap-1">
                <span>Kelas {question.gradeLevel}</span>
              </div>
            )}
          </div>

          {/* Question Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{question.points} poin</span>
            </div>
            {question.timeLimit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{question.timeLimit} menit</span>
              </div>
            )}
            {question._count && (
              <div className="flex items-center gap-1">
                <span>Digunakan {question._count.assignmentQuestions || 0}x</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {question.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{question.tags.length - 3} lainnya
                </Badge>
              )}
            </div>
          )}

          {/* Creator Info */}
          {question.createdByUser && (
            <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
              <User className="h-3 w-3" />
              <span>Dibuat oleh: {question.createdByUser.fullName}</span>
              <span className="ml-auto">
                {new Date(question.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
