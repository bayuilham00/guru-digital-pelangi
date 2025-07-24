import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Divider,
  Skeleton
} from '@heroui/react';
import { CalendarIcon, TrophyIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { gamificationService } from '../../services/gamificationService';

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED';
  targetType: string;
  participantCount: number;
  myParticipation?: {
    id: string;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
    progress: number;
    completedAt: string | null;
  };
}

interface StudentChallengeViewProps {
  showOnlyMyChallenges?: boolean;
  maxItems?: number;
  compact?: boolean;
}

const StudentChallengeView: React.FC<StudentChallengeViewProps> = ({ 
  showOnlyMyChallenges = false,
  maxItems = 0,
  compact = false 
}) => {
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Load challenges for student
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading challenges for student:', user?.id);
      
      const response = await gamificationService.getStudentChallenges(user?.id || '');
      
      if (response.success) {
        let challengeList = response.data as Challenge[];
        
        // Filter by participation if needed
        if (showOnlyMyChallenges) {
          challengeList = challengeList.filter(challenge => challenge.myParticipation);
        }
        
        // Limit items if specified
        if (maxItems > 0) {
          challengeList = challengeList.slice(0, maxItems);
        }
        
        setChallenges(challengeList);
        console.log('✅ Challenges loaded:', challengeList.length);
      } else {
        console.error('Failed to load challenges:', response.error);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, showOnlyMyChallenges, maxItems]);

  useEffect(() => {
    if (user?.id) {
      loadChallenges();
    }
  }, [user?.id, loadChallenges]);

  // Get status text
  const getStatusText = (challenge: Challenge) => {
    if (!challenge.myParticipation) return 'Belum Bergabung';
    
    switch (challenge.myParticipation.status) {
      case 'COMPLETED':
        return 'Selesai';
      case 'ACTIVE':
        return 'Sedang Berlangsung';
      case 'FAILED':
        return 'Gagal';
      default:
        return 'Belum Bergabung';
    }
  };

  // Get status gradient for chip styling
  const getStatusGradient = (challenge: Challenge) => {
    if (!challenge.myParticipation) return 'bg-gradient-to-br from-gray-500 to-gray-600 border-small border-white/50 shadow-gray-500/30';
    
    switch (challenge.myParticipation.status) {
      case 'COMPLETED':
        return 'bg-gradient-to-br from-green-500 to-emerald-500 border-small border-white/50 shadow-green-500/30';
      case 'ACTIVE':
        return 'bg-gradient-to-br from-blue-500 to-cyan-500 border-small border-white/50 shadow-blue-500/30';
      case 'FAILED':
        return 'bg-gradient-to-br from-red-500 to-pink-500 border-small border-white/50 shadow-red-500/30';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 border-small border-white/50 shadow-gray-500/30';
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string | null): number | null => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Handle challenge detail view
  const handleViewDetail = (challenge: Challenge) => {
    console.log('🔍 Opening challenge detail for:', challenge.title);
    setSelectedChallenge(challenge);
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`space-y-${compact ? '2' : '4'}`}>
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardBody className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <Skeleton className="h-2 w-full rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <TrophyIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            {showOnlyMyChallenges 
              ? 'Kamu belum mengikuti challenge apapun'
              : 'Belum ada challenge tersedia'
            }
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className={`${compact ? 'space-y-3' : 'space-y-4'}`}>
        {challenges.map((challenge) => {
          const daysRemaining = getDaysRemaining(challenge.endDate);
          const isExpired = daysRemaining !== null && daysRemaining < 0;
          
          return (
            <Card 
              key={challenge.id} 
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                compact 
                  ? 'bg-white/5 backdrop-blur-xl border border-blue-500/20' 
                  : 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20'
              } ${isExpired ? 'opacity-75' : ''}`}
            >
              {/* Header dengan Gradient Background seperti card kelas */}
              <div 
                className={`bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 ${compact ? 'p-3' : 'p-4'} text-white cursor-pointer`}
                onClick={() => handleViewDetail(challenge)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold mb-1 text-white`}>
                      {challenge.title}
                    </h3>
                    {!compact && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {challenge.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <Chip
                      classNames={{
                        base: "bg-gradient-to-br from-orange-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
                        content: "drop-shadow shadow-black text-white font-semibold",
                      }}
                      variant="shadow"
                      size={compact ? "sm" : "md"}
                      startContent={<TrophyIcon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                    >
                      {challenge.xpReward} XP
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Body dengan Info Detail */}
              <CardBody 
                className={`${compact ? 'p-3' : 'p-4'} bg-white/5 cursor-pointer`}
                onClick={() => handleViewDetail(challenge)}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className={`flex items-center ${compact ? 'space-x-3' : 'space-x-4'} text-sm text-white/70`}>
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{challenge.participantCount} peserta</span>
                    </div>
                    {!compact && daysRemaining !== null && daysRemaining >= 0 && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{daysRemaining} hari lagi</span>
                      </div>
                    )}
                  </div>
                  <Chip
                    classNames={{
                      base: getStatusGradient(challenge),
                      content: "drop-shadow shadow-black text-white font-medium",
                    }}
                    variant="shadow"
                    size="sm"
                  >
                    {getStatusText(challenge)}
                  </Chip>
                </div>

                {/* Progress Bar untuk Challenge Aktif */}
                {challenge.myParticipation && challenge.myParticipation.status === 'ACTIVE' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-2 text-white/70">
                      <span>Progress Saya</span>
                      <span>{challenge.myParticipation.progress}%</span>
                    </div>
                    <Progress 
                      value={challenge.myParticipation.progress} 
                      color="primary"
                      size={compact ? "sm" : "md"}
                      className="w-full"
                      classNames={{
                        indicator: "bg-gradient-to-r from-blue-500 to-purple-500"
                      }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Challenge Detail Modal - Tanpa daftar siswa */}
      <Modal 
        isOpen={detailModalOpen} 
        onOpenChange={setDetailModalOpen}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">{selectedChallenge?.title}</h2>
            {selectedChallenge && (
              <Chip
                classNames={{
                  base: getStatusGradient(selectedChallenge),
                  content: "drop-shadow shadow-black text-white font-medium",
                }}
                variant="shadow"
                size="sm"
              >
                {getStatusText(selectedChallenge)}
              </Chip>
            )}
          </ModalHeader>
          <ModalBody>
            {selectedChallenge && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi Challenge</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedChallenge.description}</p>
                </div>

                <Divider />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Reward XP</h4>
                    <Chip
                      classNames={{
                        base: "bg-gradient-to-br from-orange-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
                        content: "drop-shadow shadow-black text-white font-semibold",
                      }}
                      variant="shadow"
                      size="lg"
                      startContent={<TrophyIcon className="w-4 h-4" />}
                    >
                      {selectedChallenge.xpReward} XP
                    </Chip>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Total Peserta</h4>
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-lg font-semibold">
                        {selectedChallenge.participantCount} siswa
                      </span>
                    </div>
                  </div>
                </div>

                {selectedChallenge.endDate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Deadline</h4>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5 text-gray-500" />
                      <p className="text-lg">
                        {new Date(selectedChallenge.endDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedChallenge.myParticipation && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center space-x-2">
                        <span>Progress Saya</span>
                        <Chip
                          classNames={{
                            base: getStatusGradient(selectedChallenge),
                            content: "drop-shadow shadow-black text-white font-medium",
                          }}
                          variant="shadow"
                          size="sm"
                        >
                          {getStatusText(selectedChallenge)}
                        </Chip>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Kemajuan</span>
                            <span className="font-bold">{selectedChallenge.myParticipation.progress}%</span>
                          </div>
                          <Progress 
                            value={selectedChallenge.myParticipation.progress} 
                            color={selectedChallenge.myParticipation.status === 'COMPLETED' ? 'success' : 'primary'}
                            size="lg"
                            classNames={{
                              indicator: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                            }}
                          />
                        </div>
                        
                        {selectedChallenge.myParticipation.completedAt && (
                          <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                            <h4 className="font-medium text-sm text-green-800 mb-1">✅ Challenge Selesai</h4>
                            <p className="text-green-700">
                              {new Date(selectedChallenge.myParticipation.completedAt).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        
                        {selectedChallenge.myParticipation.status === 'ACTIVE' && (
                          <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                            <p className="text-blue-800 text-sm">
                              💪 Kamu sedang mengikuti challenge ini! Terus semangat untuk mencapai target.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!selectedChallenge.myParticipation && (
                  <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
                    <p className="text-gray-600">
                      Kamu belum bergabung dengan challenge ini.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Hubungi guru untuk bergabung dengan challenge.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StudentChallengeView;
