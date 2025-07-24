import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from '@heroui/react';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Calendar,
  ArrowLeft,
  Medal,
  Crown,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earnedAt?: string;
  isEarned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}



export const StudentAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'Semua', icon: Trophy },
    { id: 'academic', name: 'Akademik', icon: Star },
    { id: 'attendance', name: 'Kehadiran', icon: Calendar },
    { id: 'social', name: 'Sosial', icon: Target }
  ];

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real achievements from API
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`http://localhost:5000/api/students/${user?.id}/achievements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setAchievements(result.data);
          } else {
            // No achievements found - set empty array
            setAchievements([]);
          }
        } else {
          // API failed - set empty array (no sample data)
          setAchievements([]);
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        // Error occurred - set empty array
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAchievements();
    } else {
      setLoading(false);
      setAchievements([]);
    }
  }, [user]);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const earnedAchievements = achievements.filter(a => a.isEarned);
  const totalXp = earnedAchievements.reduce((sum, a) => sum + a.xpReward, 0);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Medal className="w-4 h-4" />;
      case 'rare': return <Star className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'legendary': return <Zap className="w-4 h-4" />;
      default: return <Medal className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Spinner 
            size="lg" 
            color="white" 
            variant="wave"
            classNames={{
              wrapper: "w-16 h-16 mb-4"
            }}
          />
          <p className="text-white/80 text-lg">Memuat pencapaian...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="ghost"
              className="text-white"
              onPress={() => navigate('/student/dashboard')}
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">Pencapaian</h1>
              <p className="text-white/60 text-xs">Kumpulkan semua pencapaian!</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-white font-bold">{earnedAchievements.length}/{achievements.length}</p>
            <p className="text-white/60 text-xs">Terkumpul</p>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardBody className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{earnedAchievements.length}</p>
              <p className="text-white/60 text-sm">Diraih</p>
            </CardBody>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardBody className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalXp}</p>
              <p className="text-white/60 text-sm">Total XP</p>
            </CardBody>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardBody className="p-4 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {achievements.length > 0 ? Math.round((earnedAchievements.length / achievements.length) * 100) : 0}%
              </p>
              <p className="text-white/60 text-sm">Selesai</p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "solid" : "bordered"}
                  color={selectedCategory === category.id ? "primary" : "default"}
                  className={`min-w-fit ${selectedCategory === category.id ? '' : 'bg-white/10 border-white/20 text-white'}`}
                  startContent={<IconComponent className="w-4 h-4" />}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className={`${
                    achievement.isEarned 
                      ? 'bg-white/10 backdrop-blur-xl border border-white/20' 
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 opacity-60'
                  } transition-all duration-300 hover:scale-105`}
                >
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${achievement.isEarned ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-bold text-lg ${achievement.isEarned ? 'text-white' : 'text-white/50'}`}>
                            {achievement.title}
                          </h3>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getRarityColor(achievement.rarity)}`}>
                            {getRarityIcon(achievement.rarity)}
                            <span className="capitalize">{achievement.rarity}</span>
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-3 ${achievement.isEarned ? 'text-white/70' : 'text-white/40'}`}>
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            color="warning" 
                            variant="flat" 
                            size="sm"
                            className={achievement.isEarned ? '' : 'opacity-50'}
                          >
                            +{achievement.xpReward} XP
                          </Badge>
                          
                          {achievement.earnedAt && (
                            <p className="text-xs text-white/50">
                              {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardBody className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Belum Ada Pencapaian</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Kamu belum memiliki pencapaian apapun. Mari tingkatkan kemampuanmu dengan mengerjakan tugas dan aktivitas belajar!
                  </p>
                  <Button
                    color="primary"
                    variant="shadow"
                    size="lg"
                    startContent={<BookOpen className="w-5 h-5" />}
                    onPress={() => navigate('/student/assignments')}
                  >
                    Lihat Tugas
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentAchievements;
