import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Divider
} from '@heroui/react';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  SparklesIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import StudentGamificationStats from '../components/student/StudentGamificationStats';
import StudentChallengeView from '../components/student/StudentChallengeView';

const StudentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Siswa
          </h1>
          <p className="text-gray-600">
            Pantau progress belajar, XP, dan achievement kamu di sini
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Gamification Stats */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-semibold">Status Gamifikasi</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <StudentGamificationStats compact={false} showLeaderboard={true} />
              </CardBody>
            </Card>

            {/* Quick Achievement Summary */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5 text-warning-500" />
                  <h2 className="text-lg font-semibold">Achievement Terbaru</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="text-center py-4 text-gray-500">
                  <TrophyIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Achievement akan ditampilkan di sini</p>
                  <p className="text-xs">Fitur dalam pengembangan</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Challenges and Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Tabs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-success-500" />
                  <h2 className="text-lg font-semibold">Challenge & Aktivitas</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <Tabs 
                  aria-label="Challenge options"
                  color="primary"
                  variant="underlined"
                  classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary-500",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-primary-600"
                  }}
                >
                  <Tab 
                    key="my-challenges" 
                    title={
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>Challenge Saya</span>
                      </div>
                    }
                  >
                    <div className="pt-4">
                      <StudentChallengeView 
                        showOnlyMyChallenges={true}
                        maxItems={5}
                      />
                    </div>
                  </Tab>
                  <Tab 
                    key="all-challenges" 
                    title={
                      <div className="flex items-center space-x-2">
                        <TrophyIcon className="w-4 h-4" />
                        <span>Semua Challenge</span>
                      </div>
                    }
                  >
                    <div className="pt-4">
                      <StudentChallengeView 
                        showOnlyMyChallenges={false}
                        maxItems={8}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  {/* Sample activity items - will be replaced with real data */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">XP diterima dari challenge</p>
                      <p className="text-xs text-gray-600">+50 XP - 2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Naik ke Level 3</p>
                      <p className="text-xs text-gray-600">Level Mahir - 1 hari yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Challenge baru tersedia</p>
                      <p className="text-xs text-gray-600">Matematika Dasar - 2 hari yang lalu</p>
                    </div>
                  </div>
                </div>
                <Divider className="my-4" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Aktivitas lebih lengkap akan tersedia dalam pembaruan mendatang
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Quick Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Ringkasan Mingguan</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                  <p className="text-sm text-gray-600">Challenge Selesai</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                  <p className="text-sm text-gray-600">XP Minggu Ini</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
                  <p className="text-sm text-gray-600">Badge Diraih</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
                  <p className="text-sm text-gray-600">Hari Streak</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Statistik mingguan akan diperbarui secara otomatis
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
