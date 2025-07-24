import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ 
  difficulty, 
  size = 'md',
  variant = 'default'
}) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': 
        return {
          label: 'Mudah',
          className: 'bg-green-100 text-green-800 border-green-200',
          color: 'green'
        };
      case 'MEDIUM': 
        return {
          label: 'Sedang',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          color: 'yellow'
        };
      case 'HARD': 
        return {
          label: 'Sulit',
          className: 'bg-red-100 text-red-800 border-red-200',
          color: 'red'
        };
      default: 
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          color: 'gray'
        };
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-1.5';
      default: return 'text-xs px-2.5 py-1';
    }
  };

  const config = getDifficultyConfig(difficulty);
  const sizeClass = getSizeClass(size);

  return (
    <Badge 
      variant={variant}
      className={`${config.className} ${sizeClass} font-medium`}
    >
      {config.label}
    </Badge>
  );
};

export default DifficultyBadge;
