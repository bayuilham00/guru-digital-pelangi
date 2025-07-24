import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Badge,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Divider,
  Skeleton
} from '@heroui/react';
import { Calendar, Trophy, Clock, Users } from 'lucide-react';
import { useAuthStore } from '../../../src/stores/authStore';
import { gamificationService } from '../../../src/services/gamificationService';

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
}

const StudentChallengeView: React.FC<StudentChallengeViewProps> = ({ 
  showOnlyMyChallenges = false,
  maxItems = 0 
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
        let challengeData = response.data || [];
        
        // Filter by student participation if needed
        if (showOnlyMyChallenges) {
          challengeData = challengeData.filter((challenge: Challenge) => 
            challenge.myParticipation
          );
        }
        
        // Apply max items limit
        if (maxItems > 0) {
          challengeData = challengeData.slice(0, maxItems);
        }
        
        setChallenges(challengeData);
        console.log(`✅ Loaded ${challengeData.length} challenges for student`);
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

  // Get status color for challenge
  const getStatusColor = (challenge: Challenge) => {
    if (!challenge.myParticipation) return 'default';
    
    switch (challenge.myParticipation.status) {
      case 'COMPLETED':
        return 'success';
      case 'ACTIVE':
        return 'primary';
      case 'FAILED':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (challenge: Challenge) => {
    if (!challenge.myParticipation) return 'Belum Bergabung';
    
    switch (challenge.myParticipation.status) {
      case 'COMPLETED':
        return 'Selesai';
      case 'ACTIVE':
        return 'Sedang Berlangsung';
      case 'FAILED':
        return 'Tidak Selesai';
      default:
        return 'Unknown';
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Handle challenge detail view
  const handleViewDetail = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
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
      <div className="space-y-4">
        {challenges.map((challenge) => {
          const daysRemaining = getDaysRemaining(challenge.endDate);
          const isExpired = daysRemaining !== null && daysRemaining < 0;
          
          return (
            <Card 
              key={challenge.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                isExpired ? 'opacity-75' : ''
              }`}
              onClick={() => handleViewDetail(challenge)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <Chip 
                      color={getStatusColor(challenge)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusText(challenge)}
                    </Chip>
                    {challenge.xpReward > 0 && (
                      <Badge 
                        content={`${challenge.xpReward} XP`}
                        color="warning"
                        variant="flat"
                      >
                        <TrophyIcon className="w-5 h-5" />
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                {/* Progress Bar for Active Challenges */}
                {challenge.myParticipation && challenge.myParticipation.status === 'ACTIVE' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.myParticipation.progress}%</span>
                    </div>
                    <Progress 
                      value={challenge.myParticipation.progress} 
                      color="primary"
                      size="sm"
                    />
                  </div>
                )}

                {/* Challenge Info */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participantCount} peserta</span>
                  </div>
                  
                  {daysRemaining !== null && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className={isExpired ? 'text-red-500' : ''}>
                        {isExpired 
                          ? 'Berakhir'
                          : daysRemaining === 0 
                            ? 'Berakhir hari ini'
                            : `${daysRemaining} hari lagi`
                        }
                      </span>
                    </div>
                  )}
                  
                  {challenge.endDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(challenge.endDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Challenge Detail Modal */}
      <Modal 
        isOpen={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">{selectedChallenge?.title}</h2>
            <Chip 
              color={selectedChallenge ? getStatusColor(selectedChallenge) : 'default'}
              variant="flat"
              size="sm"
            >
              {selectedChallenge ? getStatusText(selectedChallenge) : ''}
            </Chip>
          </ModalHeader>
          <ModalBody className="pb-6">
            {selectedChallenge && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi Challenge</h3>
                  <p className="text-gray-600">{selectedChallenge.description}</p>
                </div>

                <Divider />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-500">Reward XP</h4>
                    <p className="text-lg font-semibold text-warning-600">
                      {selectedChallenge.xpReward} XP
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-500">Total Peserta</h4>
                    <p className="text-lg font-semibold">
                      {selectedChallenge.participantCount} siswa
                    </p>
                  </div>
                </div>

                {selectedChallenge.endDate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500">Deadline</h4>
                    <p className="text-lg">
                      {new Date(selectedChallenge.endDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {selectedChallenge.myParticipation && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="font-semibold mb-3">Progress Saya</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Kemajuan</span>
                            <span>{selectedChallenge.myParticipation.progress}%</span>
                          </div>
                          <Progress 
                            value={selectedChallenge.myParticipation.progress} 
                            color={selectedChallenge.myParticipation.status === 'COMPLETED' ? 'success' : 'primary'}
                            size="md"
                          />
                        </div>
                        
                        {selectedChallenge.myParticipation.completedAt && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-500">Selesai pada</h4>
                            <p>
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
                      </div>
                    </div>
                  </>
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
