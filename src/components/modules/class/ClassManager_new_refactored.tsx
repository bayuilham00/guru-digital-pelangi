import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClassManagerTabs from './ClassManagerTabs';

/**
 * Main ClassManager Component - Refactored for Separation of Concerns
 * 
 * This component now serves as the main orchestrator for class management,
 * focusing only on class-related operations and removing redundant
 * subject/teacher management that belongs in SettingsManager.
 * 
 * Architecture:
 * - ClassManagerTabs: Handles tab navigation and layout
 * - ClassManagerCore: Core class CRUD operations
 * - ClassAssignmentManager: Subject/teacher assignments to classes
 * - AttendanceManager: Attendance management (existing)
 * 
 * Data Flow:
 * 1. SettingsManager → Create/Edit Subjects & Teachers (master data)
 * 2. ClassManager → Create/Edit Classes + Assign existing subjects/teachers
 * 3. Teachers → Access assigned classes through their accounts
 */

const ClassManager: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToSettings = () => {
    // Navigate to settings manager for subject/teacher management
    navigate('/admin/settings');
  };

  return (
    <ClassManagerTabs 
      onNavigateToSettings={handleNavigateToSettings}
    />
  );
};

export default ClassManager;