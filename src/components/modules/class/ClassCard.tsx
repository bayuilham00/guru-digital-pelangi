import React from 'react';
import { Button, Chip } from '@heroui/react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Class } from '../../../services/types';
import { getGradientColor } from './constants';

interface ClassCardProps {
  cls: Class;
  index: number;
  onViewDetail: (id: string) => void;
  onEdit: (cls: Class) => void;
  onDelete: (id: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ cls, index, onViewDetail, onEdit, onDelete }) => {
  return (
    <div 
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 group cursor-pointer"
      onClick={() => onViewDetail(cls.id)}
    >
      {/* Header Card - Dynamic Gradient */}
      <div className={`bg-gradient-to-r ${getGradientColor(index)} p-6 relative overflow-hidden`}>
        <div className="flex justify-between items-start w-full">
          <div>
            <h3 className="text-2xl font-bold mb-1 text-white">{cls.name}</h3>
            <p className="text-white/90 text-sm font-medium">
              {cls.subjectCount && cls.subjectCount > 1 
                ? `${cls.subjectCount} Mata Pelajaran` 
                : (cls.subject?.name || 'Mata Pelajaran')
              }
            </p>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-white/30 rounded"></div>
            <div className="w-4 h-4 bg-white/30 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Teachers */}
        <div className="flex flex-wrap gap-2 mb-3">
          {cls.teachers && cls.teachers.length > 0 ? (
            cls.teachers.slice(0, 2).map((teacher) => (
              <Chip
                key={teacher.id}
                size="sm"
                className="bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {teacher.fullName}
              </Chip>
            ))
          ) : (
            <Chip
              size="sm"
              className="bg-gray-500/20 text-gray-300 border border-gray-500/30"
            >
              Belum ada guru
            </Chip>
          )}
          {cls.teachers && cls.teachers.length > 2 && (
            <Chip
              size="sm"
              className="bg-gray-500/20 text-gray-300 border border-gray-500/30"
            >
              +{cls.teachers.length - 2} lainnya
            </Chip>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{cls.studentCount || 0}</div>
            <div className="text-xs text-gray-300">Siswa</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{cls.subjectCount || 1}</div>
            <div className="text-xs text-gray-300">Mapel</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white">{cls.teachers?.length || 0}</div>
            <div className="text-xs text-gray-300">Guru</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="bordered"
            size="sm"
            startContent={<Users className="w-3 h-3" />}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
            onPress={(e) => {
              e.stopPropagation();
              onViewDetail(cls.id);
            }}
          >
            Detail
          </Button>
          <Button
            variant="bordered"
            size="sm"
            startContent={<Edit className="w-3 h-3" />}
            className="border-white/20 text-white hover:bg-white/10"
            onPress={(e) => {
              e.stopPropagation();
              onEdit(cls);
            }}
          >
            Edit
          </Button>
          <Button
            variant="bordered"
            size="sm"
            startContent={<Trash2 className="w-3 h-3" />}
            className="border-red-400/30 text-red-300 hover:bg-red-500/10"
            onPress={(e) => {
              e.stopPropagation();
              onDelete(cls.id);
            }}
          >
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
