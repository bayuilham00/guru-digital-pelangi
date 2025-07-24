import React from 'react';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { 
  TrophyIcon, 
  SparklesIcon, 
  FireIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface GamificationData {
  totalXp: number;
  level: number;
  levelName: string;
  rank?: number;
  attendanceStreak?: number;
  assignmentStreak?: number;
}

interface StudentGamificationWidgetProps {
  data: GamificationData | null;
  loading?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const StudentGamificationWidget: React.FC<StudentGamificationWidgetProps> = ({ 
  data, 
  loading = false, 
  compact = false,
  onClick 
}) => {
  // Get level color
  const getLevelColor = (level: number) => {
    if (level >= 8) return 'danger'; // Mythic+
    if (level >= 6) return 'warning'; // Grandmaster+
    if (level >= 4) return 'secondary'; // Ahli+
    if (level >= 2) return 'primary'; // Berkembang+
    return 'default'; // Pemula
  };

  // Get level color gradient for new chip styling
  const getLevelColorGradient = (level: number) => {
    if (level >= 8) return 'from-red-500 to-pink-600'; // Mythic+
    if (level >= 6) return 'from-yellow-500 to-orange-600'; // Grandmaster+
    if (level >= 4) return 'from-purple-500 to-indigo-600'; // Ahli+
    if (level >= 2) return 'from-blue-500 to-cyan-600'; // Berkembang+
    return 'from-gray-500 to-gray-600'; // Pemula
  };

  // Get rank color
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'warning'; // Gold
    if (rank <= 3) return 'default'; // Silver/Bronze
    if (rank <= 10) return 'primary'; // Top 10
    return 'default';
  };

  // Get rank color gradient
  const getRankColorGradient = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-orange-600'; // Gold
    if (rank <= 3) return 'from-gray-400 to-gray-600'; // Silver/Bronze
    if (rank <= 10) return 'from-blue-500 to-cyan-600'; // Top 10
    return 'from-gray-500 to-gray-600';
  };

  if (loading || !data) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardBody className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card 
        className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardBody className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-semibold">{data.levelName}</p>
                <p className="text-xs text-gray-600">{data.totalXp} XP</p>
              </div>
            </div>
            <Chip
              classNames={{
                base: `bg-gradient-to-br ${getLevelColorGradient(data.level)} border-small border-white/50 shadow-lg`,
                content: "drop-shadow shadow-black text-white font-bold",
              }}
              variant="shadow"
              size="sm"
            >
              Lv.{data.level}
            </Chip>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-800">Statistik Game</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Level and XP */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Chip
              classNames={{
                base: `bg-gradient-to-br ${getLevelColorGradient(data.level)} border-small border-white/50 shadow-lg`,
                content: "drop-shadow shadow-black text-white font-bold",
              }}
              variant="shadow"
              size="lg"
              className="mb-2"
            >
              Level {data.level}
            </Chip>
            <p className="text-sm font-medium text-gray-700">{data.levelName}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <TrophyIcon className="w-5 h-5 text-warning-500" />
              <span className="text-xl font-bold text-warning-600">
                {data.totalXp}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total XP</p>
          </div>
        </div>

        {/* Rank */}
        {data.rank && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <ChartBarIcon className="w-5 h-5 text-gray-500" />
              <Chip
                classNames={{
                  base: `bg-gradient-to-br ${getRankColorGradient(data.rank)} border-small border-white/50 shadow-lg`,
                  content: "drop-shadow shadow-black text-white font-bold",
                }}
                variant="shadow"
                size="md"
              >
                Peringkat #{data.rank}
              </Chip>
            </div>
          </div>
        )}

        {/* Streaks */}
        {(data.attendanceStreak || data.assignmentStreak) && (
          <div className="grid grid-cols-2 gap-4">
            {data.attendanceStreak && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <FireIcon className="w-4 h-4 text-danger-500" />
                  <span className="text-lg font-bold text-danger-600">
                    {data.attendanceStreak}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Streak Hadir</p>
              </div>
            )}
            {data.assignmentStreak && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <FireIcon className="w-4 h-4 text-success-500" />
                  <span className="text-lg font-bold text-success-600">
                    {data.assignmentStreak}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Streak Tugas</p>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Klik untuk melihat detail lengkap
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default StudentGamificationWidget;
