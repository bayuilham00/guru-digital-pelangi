// Example Integration: Adding Gamification Widget to Existing Student Dashboard
import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { TrophyIcon, SparklesIcon } from '@heroicons/react/24/outline';
import StudentGamificationWidget from '../components/student/StudentGamificationWidget';

// Example: Integrating into existing StudentDashboard.tsx
const EnhancedStudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Existing dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - existing content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your existing dashboard components */}
        </div>

        {/* Right column - Enhanced with Gamification */}
        <div className="space-y-6">
          {/* Compact Gamification Stats Widget */}
          <StudentGamificationWidget 
            variant="compact-stats"
            showViewMore={true}
            onViewMore={() => {
              // Navigate to full gamification dashboard
              window.location.href = '/student/gamification-dashboard';
            }}
          />

          {/* Recent Challenges Widget */}
          <StudentGamificationWidget 
            variant="recent-challenges"
            maxItems={3}
            showViewMore={true}
            onViewMore={() => {
              // Navigate to challenges page
              window.location.href = '/student/challenges';
            }}
          />

          {/* Or use individual components for more control */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <TrophyIcon className="w-5 h-5 text-warning-500" />
                <h3 className="font-semibold">My Challenges</h3>
              </div>
            </CardHeader>
            <CardBody>
              {/* This would show only user's active challenges */}
              <StudentChallengeView 
                showOnlyMyChallenges={true}
                maxItems={2}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Example: Quick embed in any student page
const StudentPageWithGamification: React.FC = () => {
  return (
    <div className="p-4">
      {/* Page header */}
      <h1 className="text-2xl font-bold mb-6">Student Assignments</h1>
      
      {/* Sidebar or top widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* Main content */}
          <div>Your assignments content here...</div>
        </div>
        
        <div className="md:col-span-1">
          {/* Gamification sidebar */}
          <StudentGamificationWidget 
            variant="compact-stats"
            showViewMore={true}
          />
        </div>
      </div>
    </div>
  );
};

export { EnhancedStudentDashboard, StudentPageWithGamification };
