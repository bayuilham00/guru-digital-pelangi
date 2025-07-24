import React, { useState, useEffect } from 'react';
import { Button, Avatar, useDisclosure } from '@heroui/react';
import type { PressEvent } from '@react-types/shared';
import { Camera, Edit3 } from 'lucide-react';
import ProfilePhotoManager from './ProfilePhotoManager';
import { useAuthStore } from '../../stores/authStore';

interface ProfilePhotoButtonProps {
  studentId: string;
  studentName: string;
  currentPhoto?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'avatar-overlay';
  onPhotoUpdated?: () => void;
}

const ProfilePhotoButton: React.FC<ProfilePhotoButtonProps> = ({
  studentId,
  studentName,
  currentPhoto,
  size = 'md',
  variant = 'button',
  onPhotoUpdated
}) => {
  const { user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);

  // Check if user can edit photos (Admin, Guru, or the student themselves)
  const canEdit = user?.role === 'ADMIN' || user?.role === 'GURU' || 
                  (user?.role === 'SISWA' && user?.id === studentId);
  
  // Update local photo state when currentPhoto prop changes
  useEffect(() => {
    setLocalPhotoUrl(currentPhoto || null);
  }, [currentPhoto]);
  
  // Get effective photo URL (API photo or local storage fallback)
  const getEffectivePhotoUrl = () => {
    // First priority: updated photo from state or prop
    if (localPhotoUrl && localPhotoUrl !== '/placeholder.svg') {
      return localPhotoUrl;
    }
    if (currentPhoto && currentPhoto !== '/placeholder.svg') {
      return currentPhoto;
    }
    // Check local storage for profile photo
    const localPhoto = localStorage.getItem(`profile_photo_${studentId}`);
    return localPhoto || '/placeholder.svg';
  };

  const effectivePhotoUrl = getEffectivePhotoUrl();

  const handlePhotoUpdated = () => {
    // Force refresh the photo display
    const localPhoto = localStorage.getItem(`profile_photo_${studentId}`);
    if (localPhoto) {
      setLocalPhotoUrl(localPhoto);
    }
    
    onPhotoUpdated?.();
    onClose();
  };

  const handleCameraClick = () => {
    onOpen();
  };

  if (variant === 'avatar-overlay') {
    return (
      <>
        <div className="relative inline-block">
          <Avatar
            src={effectivePhotoUrl}
            name={studentName}
            className={`
              ${size === 'sm' ? 'w-16 h-16' : ''}
              ${size === 'md' ? 'w-24 h-24' : ''}
              ${size === 'lg' ? 'w-32 h-32' : ''}
            `}
          />
          {canEdit && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="absolute -bottom-1 -right-1 z-10 w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Camera className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <ProfilePhotoManager
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={handlePhotoUpdated}
          studentId={studentId}
          studentName={studentName}
          currentPhoto={effectivePhotoUrl}
          canEdit={canEdit}
        />
      </>
    );
  }

  // Button variant
  return (
    <>
      <Button
        color="primary"
        variant="flat"
        size={size}
        startContent={<Edit3 className="w-4 h-4" />}
        onPress={handleCameraClick}
        isDisabled={!canEdit}
      >
        {effectivePhotoUrl && effectivePhotoUrl !== '/placeholder.svg' ? 'Edit Foto' : 'Tambah Foto'}
      </Button>

      <ProfilePhotoManager
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handlePhotoUpdated}
        studentId={studentId}
        studentName={studentName}
        currentPhoto={effectivePhotoUrl}
        canEdit={canEdit}
      />
    </>
  );
};

export default ProfilePhotoButton;
