import React from 'react';
import {
  Card,
  CardBody,
  Progress,
  Chip,
  Button
} from '@heroui/react';
import { 
  TrophyIcon, 
  SparklesIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../src/stores/authStore';
import StudentGamificationStats from './StudentGamificationStats';
import StudentChallengeView from './StudentChallengeView';

interface StudentGamificationWidgetProps {
  variant?: 'stats' | 'challenges' | 'compact-stats' | 'recent-challenges';
  showViewMore?: boolean;
  onViewMore?: () => void;
  maxItems?: number;
}

const StudentGamificationWidget: React.FC<StudentGamificationWidgetProps> = ({
  variant = 'compact-stats',
  showViewMore = true,
  onViewMore,
  maxItems = 3
}) => {
  const { user } = useAuthStore();

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore();
    } else {
      // Default action - navigate to dashboard
      window.location.href = '/student/dashboard';
    }
  };

  // Compact Stats Widget - for embedding in other pages
  if (variant === 'compact-stats') {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-sm">Status Gamifikasi</h3>
            </div>
            {showViewMore && (
              <Button 
                size="sm" 
                variant="light" 
                color="primary"
                endContent={<ArrowRightIcon className="w-3 h-3" />}
                onClick={handleViewMore}
              >
                Lihat Detail
              </Button>
            )}
          </div>
          <StudentGamificationStats compact={true} showLeaderboard={false} />
        </CardBody>
      </Card>
    );
  }

  // Full Stats Widget
  if (variant === 'stats') {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Gamifikasi</h3>
            {showViewMore && (
              <Button 
                size="sm" 
                variant="light" 
                color="primary"
                endContent={<ArrowRightIcon className="w-4 h-4" />}
                onClick={handleViewMore}
              >
                Dashboard
              </Button>
            )}
          </div>
          <StudentGamificationStats compact={false} showLeaderboard={true} />
        </CardBody>
      </Card>
    );
  }

  // Recent Challenges Widget
  if (variant === 'recent-challenges') {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-warning-500" />
              <h3 className="text-lg font-semibold">Challenge Terbaru</h3>
            </div>
            {showViewMore && (
              <Button 
                size="sm" 
                variant="light" 
                color="primary"
                endContent={<ArrowRightIcon className="w-4 h-4" />}
                onClick={handleViewMore}
              >
                Lihat Semua
              </Button>
            )}
          </div>
          <StudentChallengeView 
            showOnlyMyChallenges={false}
            maxItems={maxItems}
          />
        </CardBody>
      </Card>
    );
  }

  // Challenges Widget - shows user's challenges
  if (variant === 'challenges') {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-success-500" />
              <h3 className="text-lg font-semibold">Challenge Saya</h3>
            </div>
            {showViewMore && (
              <Button 
                size="sm" 
                variant="light" 
                color="primary"
                endContent={<ArrowRightIcon className="w-4 h-4" />}
                onClick={handleViewMore}
              >
                Lihat Semua
              </Button>
            )}
          </div>
          <StudentChallengeView 
            showOnlyMyChallenges={true}
            maxItems={maxItems}
          />
        </CardBody>
      </Card>
    );
  }

  return null;
};

export default StudentGamificationWidget;
