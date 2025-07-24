// Example integration of Student Gamification Widget into existing StudentDashboard
// This shows how to add gamification components to any existing student page

import React from 'react';
import StudentGamificationWidget from '../components/student/StudentGamificationWidget';

// Example 1: Add compact stats widget to the top of any student page
const ExamplePageWithCompactStats = () => {
  return (
    <div className="p-4 space-y-4">
      {/* Existing page header */}
      <h1 className="text-2xl font-bold">Halaman Siswa</h1>
      
      {/* Add compact gamification widget */}
      <StudentGamificationWidget 
        variant="compact-stats"
        showViewMore={true}
        onViewMore={() => console.log('Navigate to gamification dashboard')}
      />
      
      {/* Rest of existing page content */}
      <div>Konten halaman lainnya...</div>
    </div>
  );
};

// Example 2: Add challenge widget to assignments page
const ExampleAssignmentsPageWithChallenges = () => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Tugas Saya</h1>
          {/* Existing assignments content */}
          <div>Daftar tugas...</div>
        </div>
        
        {/* Sidebar with gamification */}
        <div className="space-y-4">
          <StudentGamificationWidget 
            variant="compact-stats"
          />
          <StudentGamificationWidget 
            variant="challenges"
            maxItems={3}
          />
        </div>
      </div>
    </div>
  );
};

// Example 3: Add to profile page
const ExampleProfilePageWithGamification = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Informasi Profil</h2>
          {/* Existing profile content */}
        </div>
        
        {/* Gamification stats */}
        <div>
          <StudentGamificationWidget 
            variant="stats"
            showViewMore={true}
          />
        </div>
      </div>
      
      {/* Recent challenges */}
      <StudentGamificationWidget 
        variant="recent-challenges"
        maxItems={5}
      />
    </div>
  );
};

// Example 4: Integration guidelines for existing StudentDashboard.tsx
/*
To integrate into existing src/pages/StudentDashboard.tsx:

1. Import the widget:
import StudentGamificationWidget from '../components/student/StudentGamificationWidget';

2. Find the appropriate section in the dashboard (around line 400-600 where cards are rendered)

3. Add a new card section:
<Card className="mb-6">
  <CardBody>
    <StudentGamificationWidget 
      variant="stats"
      showViewMore={true}
      onViewMore={() => navigate('/student/gamification')}
    />
  </CardBody>
</Card>

4. Or add a compact version to the top stats area:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <StudentGamificationWidget variant="compact-stats" />
  <div>Other existing stats...</div>
</div>

5. Add challenges section:
<StudentGamificationWidget 
  variant="challenges"
  maxItems={4}
  onViewMore={() => navigate('/student/challenges')}
/>
*/

export {
  ExamplePageWithCompactStats,
  ExampleAssignmentsPageWithChallenges,
  ExampleProfilePageWithGamification
};
