// Empty State Component - Flexible untuk semua halaman
// Digunakan untuk menampilkan state kosong dengan icon, title, description, dan action button

import React from 'react';
import { Button } from '@heroui/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  iconSize?: number;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionColor = 'primary',
  className = '',
  iconSize = 64,
  showAction = true
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-6 p-4 bg-gray-100 rounded-full">
        <Icon 
          size={iconSize} 
          className="text-gray-400"
        />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {showAction && actionLabel && onAction && (
        <Button
          color={actionColor}
          size="lg"
          onPress={onAction}
          className="font-medium"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
