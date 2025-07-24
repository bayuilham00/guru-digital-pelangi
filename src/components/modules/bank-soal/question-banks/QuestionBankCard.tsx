import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Calendar, Users, MoreVertical, Eye, Edit, Trash2, Download, Clock, Target, FileText } from 'lucide-react';
import { QuestionBank } from '@/types/bankSoal';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface QuestionBankCardProps {
  bank: QuestionBank;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const QuestionBankCard: React.FC<QuestionBankCardProps> = ({
  bank,
  onView,
  onEdit,
  onDelete,
  onExport
}) => {
  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: id 
      });
    } catch {
      return 'Tidak diketahui';
    }
  };

  const getSubjectColor = (subjectName: string) => {
    const colors = {
      'Matematika': 'bg-blue-100 text-blue-800',
      'Bahasa Indonesia': 'bg-green-100 text-green-800',
      'Bahasa Inggris': 'bg-purple-100 text-purple-800',
      'IPA': 'bg-orange-100 text-orange-800',
      'IPS': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[subjectName as keyof typeof colors] || colors.default;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {bank.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {bank.description || 'Tidak ada deskripsi'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                Lihat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" onClick={onView}>
        {/* Subject & Grade */}
        <div className="flex items-center gap-2">
          <Badge className={getSubjectColor(bank.subject?.name || '')}>
            {bank.subject?.name || 'Tidak ada mata pelajaran'}
          </Badge>
          {bank.gradeLevel && (
            <Badge variant="outline">
              Kelas {bank.gradeLevel}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{bank.questionCount || 0}</p>
              <p className="text-xs text-gray-500">Soal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{bank.usageCount || 0}</p>
              <p className="text-xs text-gray-500">Digunakan</p>
            </div>
          </div>
        </div>

        {/* Question Types Distribution */}
        {bank.questionTypes && bank.questionTypes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Jenis Soal:</p>
            <div className="flex flex-wrap gap-1">
              {bank.questionTypes.map((type, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {type === 'MULTIPLE_CHOICE' ? 'PG' :
                   type === 'MULTIPLE_CHOICE_COMPLEX' ? 'PG Kompleks' :
                   type === 'TRUE_FALSE' ? 'B/S' :
                   type === 'FILL_BLANK' ? 'Isian' :
                   type === 'ESSAY' ? 'Esai' : 'Lainnya'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Distribution */}
        {bank.difficultyDistribution && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Tingkat Kesulitan:</p>
            <div className="flex items-center gap-1">
              {bank.difficultyDistribution.easy > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{bank.difficultyDistribution.easy}</span>
                </div>
              )}
              {bank.difficultyDistribution.medium > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{bank.difficultyDistribution.medium}</span>
                </div>
              )}
              {bank.difficultyDistribution.hard > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{bank.difficultyDistribution.hard}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Diperbarui {formatDate(bank.updatedAt)}</span>
          </div>
          {bank.isPublic && (
            <Badge variant="outline" className="text-xs">
              Publik
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionBankCard;
