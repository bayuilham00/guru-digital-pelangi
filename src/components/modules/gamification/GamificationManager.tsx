// Gamification Management Component with Empty State
import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Chip
} from '@heroui/react';
import { Plus, Search, Trophy, Award, Star } from 'lucide-react';
import EmptyState from '../../common/EmptyState';

interface GameElement {
  id: string;
  name: string;
  type: 'badge' | 'achievement' | 'level';
  points: number;
}

const GamificationManager: React.FC = () => {
  const [gameElements, setGameElements] = useState<GameElement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    // TODO: Implement create game element
    console.log('Create game element');
  };

  const filteredElements = gameElements.filter(element =>
    element.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gamifikasi</h1>
              <p className="text-gray-600">Kelola sistem reward dan achievement siswa</p>
            </div>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleCreate}
          >
            Tambah Element
          </Button>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <Input
              placeholder="Cari element gamifikasi..."
              aria-label="Cari element gamifikasi"
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Chip color="primary" variant="flat">
              {filteredElements.length} Element
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* Game Elements List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Element Gamifikasi</h3>
        </CardHeader>
        <CardBody>
          {filteredElements.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Belum ada element gamifikasi"
              description="Mulai dengan membuat badge, achievement, atau level pertama untuk memotivasi siswa dalam belajar"
              actionLabel="Buat Element Pertama"
              onAction={handleCreate}
              actionColor="primary"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredElements.map((element) => (
                <Card key={element.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      {element.type === 'badge' && <Award className="w-5 h-5 text-yellow-600" />}
                      {element.type === 'achievement' && <Star className="w-5 h-5 text-yellow-600" />}
                      {element.type === 'level' && <Trophy className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{element.name}</h4>
                      <p className="text-sm text-gray-600">{element.points} XP</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default GamificationManager;
