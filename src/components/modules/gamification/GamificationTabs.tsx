// Enhanced Gamification System with Tabs - Guru Digital Pelangi
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Chip,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea
} from '@heroui/react';
import { 
  Trophy, 
  Star, 
  Award, 
  Users, 
  Plus, 
  Search, 
  Gift, 
  Target,
  TrendingUp,
  Medal,
  Crown,
  Zap,
  Calendar,
  Edit,
  Trash2,
  Shield,
  Flame
} from 'lucide-react';
import GamificationDashboard from './GamificationDashboard';
import { gamificationService } from '../../../services/gamificationService';
import { apiClient } from '../../../services/apiClient';

// Data akan dimuat dari API

const mockLevels = [
  { level: 1, name: 'Pemula', xpRequired: 0, benefits: 'Akses dasar ke semua fitur' },
  { level: 2, name: 'Berkembang', xpRequired: 100, benefits: 'Akses ke quiz tambahan' },
  { level: 3, name: 'Mahir', xpRequired: 300, benefits: 'Akses ke materi advanced' },
  { level: 4, name: 'Ahli', xpRequired: 600, benefits: 'Akses ke proyek khusus' },
  { level: 5, name: 'Master', xpRequired: 1000, benefits: 'Akses ke semua fitur premium' },
  { level: 6, name: 'Grandmaster', xpRequired: 1500, benefits: 'Akses mentor junior' },
  { level: 7, name: 'Legend', xpRequired: 2000, benefits: 'Akses semua konten eksklusif' },
  { level: 8, name: 'Mythic', xpRequired: 2500, benefits: 'Dapat membuat konten sendiri' },
  { level: 9, name: 'Immortal', xpRequired: 3000, benefits: 'Akses ke program khusus' },
  { level: 10, name: 'Divine', xpRequired: 4000, benefits: 'Status tertinggi dengan semua privilege' },
];

// Challenges akan dimuat dari API

const iconOptions = [
  '🏆', '⭐', '🎯', '🔥', '💎', '👑', '🚀', '⚡', '🌟', '🎖️',
  '🥇', '🥈', '🥉', '🎪', '🎨', '📚', '🔬', '🧮', '🌍', '💡'
];

const GamificationTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('xp');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Data states
  const [students, setStudents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  // Modal states
  const { isOpen: isBadgeModalOpen, onOpen: onBadgeModalOpen, onClose: onBadgeModalClose } = useDisclosure();
  const { isOpen: isChallengeModalOpen, onOpen: onChallengeModalOpen, onClose: onChallengeModalClose } = useDisclosure();
  const { isOpen: isRewardModalOpen, onOpen: onRewardModalOpen, onClose: onRewardModalClose } = useDisclosure();
  const { isOpen: isEditBadgeModalOpen, onOpen: onEditBadgeModalOpen, onClose: onEditBadgeModalClose } = useDisclosure();
  // Enhanced challenge modals
  const { isOpen: isChallengeDetailModalOpen, onOpen: onChallengeDetailModalOpen, onClose: onChallengeDetailModalClose } = useDisclosure();
  const { isOpen: isChallengeEditModalOpen, onOpen: onChallengeEditModalOpen, onClose: onChallengeEditModalClose } = useDisclosure();

  // Form states
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    xpReward: null as number | null,
    icon: '🏆'
  });

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    duration: '',
    targetType: 'ALL_STUDENTS',
    specificClass: '',
    xpReward: null as number | null
  });

  const [rewardForm, setRewardForm] = useState({
    type: 'xp',
    xpAmount: 50,
    badgeId: '',
    description: ''
  });

  // Editing and deleting states
  const [editingBadge, setEditingBadge] = useState(null);
  const [deletingBadgeId, setDeletingBadgeId] = useState(null);
  // Enhanced challenge management states
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [challengeParticipants, setChallengeParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    } else if (activeTab === 'badges') {
      loadBadges();
    } else if (activeTab === 'challenges') {
      loadChallenges();
      loadClasses(); // Load classes when challenges tab is active
    }
  }, [activeTab]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      // Use gamification endpoint to get students with XP data
      const response = await fetch('http://localhost:5000/api/gamification/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setStudents(result.data || []);
      } else {
        console.error('Failed to load students:', response.statusText);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBadges = async () => {
    try {
      console.log('🎖️ Loading badges...');
      const response = await gamificationService.getBadges();
      console.log('🎖️ Badges response:', response);
      
      if (response.success && response.data) {
        console.log(`🎖️ Setting ${response.data.length} badges`);
        setBadges(response.data);
      } else {
        console.error('🎖️ Badges response not successful:', response);
        setBadges([]);
      }
    } catch (error) {
      console.error('🎖️ Error loading badges:', error);
      setBadges([]);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await gamificationService.getChallenges();
      if (response.success && response.data) {
        setChallenges(response.data);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  // Function to load classes from API
  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Classes API response:', result); // Debug log
        
        if (result.success && result.data && result.data.classes) {
          // Transform class data to simple name array
          const classNames = result.data.classes
            .filter(cls => cls && cls.name) // Filter out invalid entries
            .map(cls => cls.name);
          setAvailableClasses(classNames);
        } else if (result.success && Array.isArray(result.data)) {
          // Fallback: jika data langsung berupa array
          const classNames = result.data
            .filter(cls => cls && cls.name) // Filter out invalid entries
            .map(cls => cls.name);
          setAvailableClasses(classNames);
        } else {
          console.error('Invalid classes response structure:', result);
          setAvailableClasses([]);
        }
      } else {
        console.error('Failed to load classes:', response.statusText);
        setAvailableClasses([]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      setAvailableClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Ensure students is always an array with proper safety checks
  const studentsArray = Array.isArray(students) ? students.filter(s => s && s.id) : [];
  const badgesArray = Array.isArray(badges) ? badges.filter(b => b && b.id) : [];
  const challengesArray = Array.isArray(challenges) ? challenges.filter(c => c && c.id) : [];

  // Statistics
  const stats = {
    totalStudents: studentsArray.length,
    totalBadges: badgesArray.length,
    averageScore: 85,
    topStudent: studentsArray.length > 0 ? studentsArray[0] : null
  };

  // Filtered and sorted students with additional safety checks
  const filteredStudents = studentsArray
    .filter((student: any) => {
      if (!student || !student.id) return false;
      const fullName = student.fullName || '';
      const className = student.class?.name || '';
      const searchLower = (searchTerm || '').toLowerCase();
      return fullName.toLowerCase().includes(searchLower) ||
             className.toLowerCase().includes(searchLower);
    })
    .sort((a: any, b: any) => {
      if (!a || !b) return 0;
      if (sortBy === 'name') {
        const nameA = a.fullName || '';
        const nameB = b.fullName || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'xp') {
        const xpA = a.studentXp?.totalXp || 0;
        const xpB = b.studentXp?.totalXp || 0;
        return xpB - xpA;
      }
      return 0;
    });

  const handleCreateBadge = async () => {
    try {
      console.log('Creating badge:', badgeForm);
      const response = await gamificationService.createBadge(badgeForm);
      if (response.success) {
        loadBadges(); // Reload badges
        setBadgeForm({ name: '', description: '', xpReward: null, icon: '🏆' });
        onBadgeModalClose();
        alert('Badge berhasil dibuat!');
      } else {
        alert('Error: ' + (response.error || 'Gagal membuat badge'));
      }
    } catch (error) {
      console.error('Failed to create badge:', error);
      alert('Gagal membuat badge');
    }
  };

  const handleEditBadge = (badge) => {
    setEditingBadge(badge);
    setBadgeForm({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      xpReward: badge.xpReward
    });
    onBadgeModalOpen();
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge) return;

    try {
      const response = await gamificationService.updateBadge(editingBadge.id, badgeForm);
      if (response.success) {
        alert('Badge berhasil diperbarui!');
        setBadgeForm({ name: '', description: '', icon: '🏆', xpReward: 0 });
        setEditingBadge(null);
        onBadgeModalClose();
        loadBadges();
      } else {
        alert('Error: ' + (response.error || 'Gagal memperbarui badge'));
      }
    } catch (error) {
      console.error('Failed to update badge:', error);
      alert('Gagal memperbarui badge');
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus badge ini?')) return;

    try {
      const response = await gamificationService.deleteBadge(badgeId);
      if (response.success) {
        alert('Badge berhasil dihapus!');
        loadBadges();
      } else {
        alert('Error: ' + (response.error || 'Gagal menghapus badge'));
      }
    } catch (error) {
      console.error('Failed to delete badge:', error);
      alert('Gagal menghapus badge');
    }
  };

  const handleCreateChallenge = async () => {
    try {
      console.log('Creating challenge:', challengeForm);
      const response = await gamificationService.createChallenge(challengeForm);
      if (response.success) {
        loadChallenges(); // Reload challenges
        setChallengeForm({ title: '', description: '', duration: '', targetType: 'ALL_STUDENTS', specificClass: '', xpReward: null });
        onChallengeModalClose();
        alert('Challenge berhasil dibuat!');
      } else {
        alert('Error: ' + (response.error || 'Gagal membuat challenge'));
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
      alert('Gagal membuat challenge');
    }
  };

  const handleGiveReward = async () => {
    if (!selectedStudent) {
      alert('Siswa belum dipilih!');
      return;
    }

    try {
      const payload = {
        studentId: selectedStudent.id,
        ...rewardForm,
      };
      // This assumes a new function in your gamificationService
      const response = await gamificationService.giveRewardToStudent(payload);

      if (response.success) {
        alert('Reward berhasil diberikan!');
        setRewardForm({ type: 'xp', xpAmount: 50, badgeId: '', description: '' });
        onRewardModalClose();
        loadStudents(); // Refresh student data to show new XP/badge
      } else {
        alert('Error: ' + (response.error || 'Gagal memberikan reward'));
      }
    } catch (error) {
      console.error('Failed to give reward:', error);
      alert('Gagal memberikan reward');
    }
  };

  // Enhanced challenge management functions
  const handleViewChallengeDetail = async (challenge: any) => {
    setSelectedChallenge(challenge);
    setLoadingParticipants(true);
    try {
      // Load participants for this challenge
      const response = await gamificationService.getChallengeParticipants(challenge.id);
      if (response.success) {
        setChallengeParticipants(response.data || []);
      }
    } catch (error) {
      console.error('Error loading challenge participants:', error);
      setChallengeParticipants([]);
    } finally {
      setLoadingParticipants(false);
      onChallengeDetailModalOpen();
    }
  };

  const handleEditChallenge = (challenge: any) => {
    // Check if challenge has participants
    if (challenge.participantCount > 0) {
      // Show warning that editing is not allowed
      return;
    }
    setSelectedChallenge(challenge);
    setChallengeForm({
      title: challenge.title || '',
      description: challenge.description || '',
      duration: challenge.duration?.toString() || '',
      targetType: challenge.targetType || 'ALL_STUDENTS',
      specificClass: challenge.specificClass || '',
      xpReward: challenge.xpReward || null
    });
    onChallengeEditModalOpen();
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus challenge ini?')) {
      try {
        const response = await gamificationService.deleteChallenge(challengeId);
        if (response.success) {
          await loadChallenges(); // Reload challenges
        }
      } catch (error) {
        console.error('Error deleting challenge:', error);
      }
    }
  };

  // Teacher-managed completion workflow
  const handleMarkAsCompleted = async (participantId: string) => {
    try {
      const response = await gamificationService.markChallengeCompleted(participantId);
      if (response.success) {
        // Reload participants to show updated status
        if (selectedChallenge) {
          await handleViewChallengeDetail(selectedChallenge);
        }
        
        // 🔥 Handle automatic completion detection
        if (response.data?.autoCompleted) {
          // Show automatic completion notification with proper UI
          console.log('🎉 Challenge automatically completed!', response.data);
          
          // Create a more user-friendly confirmation dialog
          const stats = response.data.completionStats;
          const challengeTitle = selectedChallenge?.title || 'Challenge ini';
          const xpReward = selectedChallenge?.xpReward || 0;
          
          const confirmed = window.confirm(`
🎉 SELAMAT! Challenge Otomatis Selesai! 

📋 Challenge: "${challengeTitle}"
👥 Semua ${stats?.total || 0} siswa telah menyelesaikan challenge!

✅ Status: Challenge otomatis diselesaikan
💰 XP Distribution: ${xpReward} XP sudah diberikan ke masing-masing siswa saat mereka menyelesaikan task
📅 Diselesaikan pada: ${new Date().toLocaleDateString('id-ID')}

ℹ️ Catatan: XP sudah didistribusikan secara individual, tidak ada XP tambahan.

Klik OK untuk melihat update status challenge.
          `);
          
          if (confirmed) {
            // Refresh challenges list to show COMPLETED status
            await loadChallenges();
            
            // Refresh challenge detail if still viewing
            if (selectedChallenge) {
              await handleViewChallengeDetail(selectedChallenge);
            }
            
            console.log('✅ Challenge list refreshed after auto-completion');
          }
        } else {
          // Regular completion message
          console.log('Participant marked as completed successfully');
          
          // Show completion stats even if not auto-completed
          if (response.data?.completionStats) {
            const stats = response.data.completionStats;
            const xpReward = selectedChallenge?.xpReward || 0;
            console.log(`📊 Progress: ${stats.completed}/${stats.total} participants completed`);
            console.log(`💰 XP earned by this student: ${xpReward}`);
          }
        }
      }
    } catch (error) {
      console.error('Error marking participant as completed:', error);
    }
  };

  const openRewardModal = (student: any) => {
    if (!student || !student.id) {
      console.error('Invalid student data for reward modal');
      return;
    }
    setSelectedStudent(student);
    // Load badges when opening reward modal
    loadBadges();
    onRewardModalOpen();
  };

  const getLevelColor = (level: number) => {
    const safeLevel = level || 1;
    if (safeLevel >= 9) return 'danger'; // Divine/Immortal
    if (safeLevel >= 7) return 'secondary'; // Legend/Mythic
    if (safeLevel >= 5) return 'warning'; // Master/Grandmaster
    if (safeLevel >= 3) return 'success'; // Mahir/Ahli
    if (safeLevel >= 2) return 'primary'; // Berkembang
    return 'default'; // Pemula
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'S';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sistem Gamifikasi</h1>
                <p className="text-gray-600">Kelola poin, badge, level, dan tantangan siswa</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
        >
          <Tab key="dashboard" title={
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          }>
            <GamificationDashboard />
          </Tab>

          <Tab key="badges" title={
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Badge</span>
            </div>
          }>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Manajemen Badge</h3>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={onBadgeModalOpen}
                >
                  Buat Badge
                </Button>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : badgesArray.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Belum ada badge yang dibuat</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badgesArray.map((badge: any) => {
                      if (!badge || !badge.id) return null;
                      return (
                        <Card key={badge.id} className="border">
                          <CardBody className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-2xl">{badge.icon || '🏆'}</div>
                              <div>
                                <h4 className="font-semibold">{badge.name || 'Unnamed Badge'}</h4>
                                <p className="text-sm text-gray-600">{badge.description || 'No description'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Chip color="warning" variant="flat" size="sm">
                                {badge.xpReward || 0} XP
                              </Chip>
                              <div className="flex gap-1">
                                <Button 
                                  isIconOnly 
                                  size="sm" 
                                  variant="light"
                                  onPress={() => handleEditBadge(badge)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  isIconOnly 
                                  size="sm" 
                                  variant="light" 
                                  color="danger"
                                  onPress={() => handleDeleteBadge(badge.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    }).filter(Boolean)}
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="levels" title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Level</span>
            </div>
          }>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Sistem Level</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {mockLevels.map((level) => (
                    <Card key={level.level} className="border">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                              <span className="text-lg font-bold text-blue-600">
                                {level.level}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{level.name}</h4>
                              <p className="text-sm text-gray-600">{level.benefits}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Chip
                              color={getLevelColor(level.level)}
                              variant="flat"
                              startContent={<Zap className="w-3 h-3" />}
                            >
                              {level.xpRequired} XP
                            </Chip>
                            <div className="mt-2">
                              <Button size="sm" variant="flat">
                                Edit Level
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="challenges" title={
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Challenge</span>
            </div>
          }>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Manajemen Challenge</h3>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={onChallengeModalOpen}
                >
                  Buat Challenge
                </Button>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : challengesArray.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Belum ada challenge yang dibuat</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {challengesArray.map((challenge: any) => {
                      if (!challenge || !challenge.id) return null;
                      
                      // Enhanced challenge information display
                      const getTargetDisplayText = () => {
                        console.log('Challenge target debug:', {
                          targetType: challenge.targetType,
                          targetData: challenge.targetData,
                          specificClass: challenge.specificClass
                        });
                        
                        // Check for SPECIFIC_CLASSES (plural) atau SPECIFIC_CLASS (singular)
                        if ((challenge.targetType === 'SPECIFIC_CLASSES' || challenge.targetType === 'SPECIFIC_CLASS') && 
                            (challenge.targetData || challenge.specificClass)) {
                          try {
                            if (challenge.targetData) {
                              const targetData = typeof challenge.targetData === 'string' 
                                ? JSON.parse(challenge.targetData) 
                                : challenge.targetData;
                              return `Kelas ${targetData.class || targetData.specificClass || 'Unknown'}`;
                            }
                            if (challenge.specificClass) {
                              return `Kelas ${challenge.specificClass}`;
                            }
                          } catch (e) {
                            console.error('Error parsing targetData:', e);
                            if (challenge.specificClass) {
                              return `Kelas ${challenge.specificClass}`;
                            }
                          }
                        }
                        return 'Semua Siswa';
                      };

                      const getStatusColor = () => {
                        if (!challenge.isActive) return 'default';
                        // Check if expired
                        if (challenge.duration && challenge.createdAt) {
                          const createdDate = new Date(challenge.createdAt);
                          const expiryDate = new Date(createdDate.getTime() + (challenge.duration * 24 * 60 * 60 * 1000));
                          const now = new Date();
                          if (now > expiryDate) return 'warning'; // Expired
                        }
                        return 'success'; // Active
                      };

                      const getStatusText = () => {
                        if (!challenge.isActive) return 'Nonaktif';
                        if (challenge.duration && challenge.createdAt) {
                          const createdDate = new Date(challenge.createdAt);
                          const expiryDate = new Date(createdDate.getTime() + (challenge.duration * 24 * 60 * 60 * 1000));
                          const now = new Date();
                          if (now > expiryDate) return 'Berakhir';
                        }
                        return 'Aktif';
                      };

                      return (
                        <Card key={challenge.id} className="border hover:shadow-md transition-all duration-200">
                          <CardBody className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">{challenge.title || 'Untitled Challenge'}</h4>
                                  <Chip
                                    color={getStatusColor()}
                                    size="sm"
                                    variant="flat"
                                  >
                                    {getStatusText()}
                                  </Chip>
                                  {challenge.participantCount > 0 && (
                                    <Chip
                                      color="primary"
                                      size="sm"
                                      variant="dot"
                                    >
                                      {challenge.participantCount} peserta
                                    </Chip>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{challenge.description || 'No description'}</p>
                                
                                {/* Enhanced info grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <div>
                                      <span className="text-gray-500 block text-xs">Durasi</span>
                                      <span className="font-medium">
                                        {challenge.duration ? `${challenge.duration} hari` : 'Tidak terbatas'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" />
                                    <div>
                                      <span className="text-gray-500 block text-xs">Target</span>
                                      <span className="font-medium">{getTargetDisplayText()}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <div>
                                      <span className="text-gray-500 block text-xs">Reward</span>
                                      <span className="font-medium">{challenge.xpReward || 0} XP</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-purple-500" />
                                    <div>
                                      <span className="text-gray-500 block text-xs">Status</span>
                                      <span className="font-medium">
                                        {challenge.participantCount > 0 ? `${challenge.participantCount} bergabung` : 'Belum ada peserta'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Show expiry information if applicable */}
                                {challenge.duration && challenge.createdAt && (
                                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        Berakhir: {new Date(new Date(challenge.createdAt).getTime() + (challenge.duration * 24 * 60 * 60 * 1000)).toLocaleDateString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1 ml-4">
                                <Button 
                                  size="sm" 
                                  variant="flat"
                                  color="primary"
                                  onPress={() => handleViewChallengeDetail(challenge)}
                                  className="min-w-20"
                                >
                                  Detail
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="light"
                                  onPress={() => handleEditChallenge(challenge)}
                                  isDisabled={challenge.participantCount > 0}
                                  className="min-w-20"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="light" 
                                  color="danger"
                                  onPress={() => handleDeleteChallenge(challenge.id)}
                                  className="min-w-20"
                                >
                                  Hapus
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    }).filter(Boolean)}
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="students" title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Siswa</span>
            </div>
          }>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold">Daftar Siswa & Reward</h3>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Cari siswa..."
                      aria-label="Cari siswa berdasarkan nama"
                      startContent={<Search className="w-4 h-4 text-gray-400" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Select
                      placeholder="Urutkan"
                      className="w-40"
                      selectedKeys={[sortBy]}
                      onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                    >
                      <SelectItem key="xp" textValue="Urutkan: XP">Urutkan: XP</SelectItem>
                      <SelectItem key="name" textValue="Urutkan: Nama">Urutkan: Nama</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Table aria-label="Students table">
                  <TableHeader>
                    <TableColumn>SISWA</TableColumn>
                    <TableColumn>KELAS</TableColumn>
                    <TableColumn>XP</TableColumn>
                    <TableColumn>LEVEL</TableColumn>
                    <TableColumn>AKSI</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={
                    isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Belum ada data siswa</p>
                      </div>
                    )
                  }>
                    {filteredStudents.map((student: any) => {
                      if (!student || !student.id) return null;
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={getInitials(student.fullName || 'S')}
                                size="sm"
                                color={getLevelColor(student.studentXp?.level || 1)}
                              />
                              <span className="font-medium">{student.fullName || 'Unknown Student'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip color="primary" variant="flat" size="sm">
                              {student.class?.name || 'Belum ada kelas'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">{student.studentXp?.totalXp || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={getLevelColor(student.studentXp?.level || 1)}
                              variant="flat"
                              size="sm"
                            >
                              Lv.{student.studentXp?.level || 1} {student.studentXp?.levelName || 'Pemula'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              startContent={<Gift className="w-4 h-4" />}
                              onPress={() => openRewardModal(student)}
                            >
                              Reward
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }).filter(Boolean)}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </motion.div>

      {/* Badge Modal */}
      <Modal isOpen={isBadgeModalOpen} onClose={onBadgeModalClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>{editingBadge ? 'Edit Badge' : 'Buat Badge Baru'}</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nama Badge"
                    placeholder="Masukkan nama badge"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                  />
                  <Textarea
                    label="Deskripsi"
                    placeholder="Masukkan deskripsi badge"
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                  />
                  <Input
                    label="XP Reward"
                    type="number"
                    placeholder="Masukkan poin XP"
                    value={badgeForm.xpReward?.toString() || ''}
                    onChange={(e) => setBadgeForm({...badgeForm, xpReward: e.target.value ? parseInt(e.target.value) : null})}
                    endContent={<span className="text-sm text-gray-500">XP</span>}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Pilih Icon</label>
                    <div className="grid grid-cols-10 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`p-2 text-xl border rounded-lg hover:bg-gray-50 ${
                            badgeForm.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setBadgeForm({...badgeForm, icon})}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={editingBadge ? handleUpdateBadge : handleCreateBadge}>
                  {editingBadge ? 'Update Badge' : 'Buat Badge'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Challenge Modal */}
      <Modal isOpen={isChallengeModalOpen} onClose={onChallengeModalClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>Buat Challenge Baru</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Judul Challenge"
                    placeholder="Masukkan judul challenge"
                    value={challengeForm.title}
                    onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                  />
                  <Textarea
                    label="Deskripsi"
                    placeholder="Masukkan deskripsi challenge"
                    value={challengeForm.description}
                    onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                  />
                  <Input
                    label="Durasi (hari)"
                    type="number"
                    placeholder="Masukkan durasi dalam hari"
                    value={challengeForm.duration}
                    onChange={(e) => setChallengeForm({...challengeForm, duration: e.target.value})}
                    endContent={<span className="text-sm text-gray-500">hari</span>}
                  />
                  <Select
                    label="Target Siswa"
                    placeholder="Pilih target siswa"
                    selectedKeys={[challengeForm.targetType]}
                    onSelectionChange={(keys) => {
                      const selectedType = Array.from(keys)[0] as string;
                      setChallengeForm({
                        ...challengeForm, 
                        targetType: selectedType,
                        specificClass: selectedType === 'ALL_STUDENTS' ? '' : challengeForm.specificClass
                      });
                    }}
                  >
                    <SelectItem key="ALL_STUDENTS" textValue="Semua Siswa">Semua Siswa</SelectItem>
                    <SelectItem key="SPECIFIC_CLASSES" textValue="Kelas Tertentu">Kelas Tertentu</SelectItem>
                  </Select>
                  
                  {/* Conditional field for specific class */}
                  {challengeForm.targetType === 'SPECIFIC_CLASSES' && (
                    <Select
                      label="Pilih Kelas Spesifik"
                      placeholder={availableClasses.length > 0 ? "Pilih kelas yang ditargetkan" : "Tidak ada kelas tersedia"}
                      selectedKeys={challengeForm.specificClass ? [challengeForm.specificClass] : []}
                      onSelectionChange={(keys) => setChallengeForm({...challengeForm, specificClass: Array.from(keys)[0] as string})}
                      isLoading={loadingClasses}
                      isDisabled={availableClasses.length === 0}
                    >
                      {availableClasses.length > 0 ? (
                        availableClasses.map((className) => (
                          <SelectItem key={className} textValue={className}>
                            {className}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem key="no-classes" textValue="Tidak ada kelas" isDisabled>
                          Tidak ada kelas tersedia
                        </SelectItem>
                      )}
                    </Select>
                  )}
                  <Input
                    label="XP Reward"
                    type="number"
                    placeholder="Masukkan poin XP"
                    value={challengeForm.xpReward?.toString() || ''}
                    onChange={(e) => setChallengeForm({...challengeForm, xpReward: e.target.value ? parseInt(e.target.value) : null})}
                    endContent={<span className="text-sm text-gray-500">XP</span>}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={handleCreateChallenge}>
                  Buat Challenge
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Reward Modal */}
      <Modal isOpen={isRewardModalOpen} onClose={onRewardModalClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span>Beri Reward</span>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedStudent && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar
                        name={getInitials(selectedStudent.fullName || selectedStudent.name || 'S')}
                        color={getLevelColor(selectedStudent.studentXp?.level || selectedStudent.level || 1)}
                      />
                      <div>
                        <h4 className="font-semibold">{selectedStudent.fullName || selectedStudent.name}</h4>
                        <p className="text-sm text-gray-600">{selectedStudent.class?.name || selectedStudent.class || 'No Class'}</p>
                      </div>
                    </div>

                    <Select
                      label="Jenis Reward"
                      placeholder="Pilih jenis reward"
                      selectedKeys={[rewardForm.type]}
                      onSelectionChange={(keys) => setRewardForm({...rewardForm, type: Array.from(keys)[0] as string})}
                    >
                      <SelectItem key="xp" textValue="Poin XP">Poin XP</SelectItem>
                      <SelectItem key="badge" textValue="Badge">Badge</SelectItem>
                    </Select>

                    {rewardForm.type === 'xp' && (
                      <Input
                        label="Jumlah XP"
                        type="number"
                        placeholder="50"
                        value={rewardForm.xpAmount.toString()}
                        onChange={(e) => setRewardForm({...rewardForm, xpAmount: parseInt(e.target.value) || 50})}
                        endContent={<span className="text-sm text-gray-500">XP</span>}
                      />
                    )}

                    {rewardForm.type === 'badge' && (
                      <Select
                        label="Pilih Badge"
                        placeholder="Pilih badge yang akan diberikan"
                        selectedKeys={rewardForm.badgeId ? [rewardForm.badgeId] : []}
                        onSelectionChange={(keys) => setRewardForm({...rewardForm, badgeId: Array.from(keys)[0] as string})}
                      >
                        {badgesArray.map((badge: any) => {
                          if (!badge || !badge.id) return null;
                          return (
                            <SelectItem key={badge.id} textValue={badge.name || 'Unnamed Badge'}>
                              <div className="flex items-center gap-2">
                                <span>{badge.icon || '🏆'}</span>
                                <span>{badge.name || 'Unnamed Badge'}</span>
                                <Chip size="sm" color="warning" variant="flat">
                                  {badge.xpReward || 0} XP
                                </Chip>
                              </div>
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                      </Select>
                    )}

                    <Textarea
                      label="Keterangan (Opsional)"
                      placeholder="Alasan pemberian reward..."
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="success" onPress={handleGiveReward}>
                  Berikan Reward
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Challenge Detail Modal - Enhanced */}
      <Modal isOpen={isChallengeDetailModalOpen} onClose={onChallengeDetailModalClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>Detail Challenge</span>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedChallenge && (
                  <div className="space-y-6">
                    {/* Challenge Header Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {selectedChallenge.title}
                          </h3>
                          <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>
                          
                          {/* Status and basic info */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <Chip
                              color={selectedChallenge.isActive ? 'success' : 'default'}
                              variant="flat"
                            >
                              {selectedChallenge.isActive ? 'Aktif' : 'Nonaktif'}
                            </Chip>
                            <Chip color="primary" variant="dot">
                              {challengeParticipants.length} peserta terdaftar
                            </Chip>
                            <Chip color="warning" variant="flat">
                              {selectedChallenge.xpReward || 0} XP reward
                            </Chip>
                            <Chip 
                              color={challengeParticipants.filter((p: any) => p.status === 'COMPLETED').length > 0 ? 'success' : 'default'} 
                              variant="dot"
                            >
                              {challengeParticipants.filter((p: any) => p.status === 'COMPLETED').length} selesai
                            </Chip>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border">
                        <CardBody className="text-center p-4">
                          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-700">Durasi</h4>
                          <p className="text-lg font-bold text-blue-600">
                            {selectedChallenge.duration ? `${selectedChallenge.duration} hari` : 'Tidak terbatas'}
                          </p>
                          {selectedChallenge.duration && selectedChallenge.createdAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Berakhir: {new Date(new Date(selectedChallenge.createdAt).getTime() + (selectedChallenge.duration * 24 * 60 * 60 * 1000)).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </CardBody>
                      </Card>

                      <Card className="border">
                        <CardBody className="text-center p-4">
                          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-700">Target</h4>
                          <p className="text-lg font-bold text-green-600">
                            {(() => {
                              if ((selectedChallenge.targetType === 'SPECIFIC_CLASSES' || selectedChallenge.targetType === 'SPECIFIC_CLASS') && 
                                  selectedChallenge.targetData) {
                                const targetData = selectedChallenge.targetData;
                                return `Kelas ${targetData.class || 'Unknown'}`;
                              }
                              return 'Semua Siswa';
                            })()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Auto-enrolled {challengeParticipants.length} siswa
                          </p>
                        </CardBody>
                      </Card>

                      <Card className="border">
                        <CardBody className="text-center p-4">
                          <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-700">Progress</h4>
                          <p className="text-lg font-bold text-purple-600">
                            {challengeParticipants.filter((p: any) => p.status === 'COMPLETED').length} / {challengeParticipants.length}
                          </p>
                          <p className="text-xs text-gray-500">Selesai</p>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Participants Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Daftar Peserta</h4>
                        <Chip size="sm" variant="flat">
                          {challengeParticipants.length} siswa bergabung
                        </Chip>
                      </div>

                      {loadingParticipants ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : challengeParticipants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                          <p>Belum ada siswa yang bergabung</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {challengeParticipants.map((participant: any) => (
                            <Card key={participant.id} className="border">
                              <CardBody className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Avatar 
                                      size="sm" 
                                      name={participant.student?.fullName || participant.student?.name || 'N/A'}
                                      className="flex-shrink-0"
                                    />
                                    <div>
                                      <p className="font-medium">
                                        {participant.student?.fullName || participant.student?.name || 'Unknown Student'}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {participant.student?.class?.name || 'No Class'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Chip
                                      size="sm"
                                      color={participant.status === 'COMPLETED' ? 'success' : 
                                            participant.status === 'ACTIVE' ? 'warning' : 'default'}
                                      variant="flat"
                                    >
                                      {participant.status === 'COMPLETED' ? 'Selesai' :
                                       participant.status === 'ACTIVE' ? 'Berlangsung' : 'Belum Dimulai'}
                                    </Chip>
                                    {participant.status !== 'COMPLETED' && (
                                      <Button
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        onPress={() => handleMarkAsCompleted(participant.id)}
                                      >
                                        Challenge Complete
                                      </Button>
                                    )}
                                    {participant.status === 'COMPLETED' && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Trophy className="w-3 h-3" />
                                        <span>Completed: {new Date(participant.completedAt).toLocaleDateString('id-ID')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Tutup
                </Button>
                {selectedChallenge && selectedChallenge.participantCount === 0 && (
                  <Button 
                    color="primary" 
                    onPress={() => {
                      onClose();
                      handleEditChallenge(selectedChallenge);
                    }}
                  >
                    Edit Challenge
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GamificationTabs;
