// Student Gamification Components Export
// Phase 2: Student Dashboard Integration

// Main Components
export { default as StudentChallengeView } from './StudentChallengeView';
export { default as StudentGamificationStats } from './StudentGamificationStats';
export { default as StudentGamificationWidget } from './StudentGamificationWidget';

// Types
export interface StudentChallengeViewProps {
  showOnlyMyChallenges?: boolean;
  maxItems?: number;
}

export interface StudentGamificationStatsProps {
  compact?: boolean;
  showLeaderboard?: boolean;
}

export interface StudentGamificationWidgetProps {
  variant?: 'stats' | 'challenges' | 'compact-stats' | 'recent-challenges';
  showViewMore?: boolean;
  onViewMore?: () => void;
  maxItems?: number;
}

// Usage Examples:
/*
// 1. Full Dashboard Page
import StudentDashboard from '../pages/StudentDashboard';

// 2. Widget Integration
import { StudentGamificationWidget } from '../components/student';
<StudentGamificationWidget variant="compact-stats" showViewMore={true} />

// 3. Individual Components
import { StudentChallengeView, StudentGamificationStats } from '../components/student';
<StudentChallengeView showOnlyMyChallenges={true} maxItems={5} />
<StudentGamificationStats compact={false} showLeaderboard={true} />

// 4. Different Widget Variants
<StudentGamificationWidget variant="recent-challenges" maxItems={3} />
<StudentGamificationWidget variant="challenges" showViewMore={true} />
<StudentGamificationWidget variant="stats" />
*/
