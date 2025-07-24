// Level utility functions for gamification system
export type LevelColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

/**
 * Get HeroUI color based on level name
 * Maps each level to an appropriate color theme
 */
export const getLevelColor = (levelName: string): LevelColor => {
  const levelColors: Record<string, LevelColor> = {
    'Pemula': 'default',        // Gray - Starting level
    'Berkembang': 'primary',    // Blue - Growing
    'Mahir': 'secondary',       // Purple - Skilled
    'Ahli': 'success',          // Green - Expert
    'Master': 'warning',        // Orange/Yellow - Master
    'Grandmaster': 'danger',    // Red - Elite
    'Legend': 'primary',        // Blue - Legendary
    'Mythic': 'secondary',      // Purple - Mythical
    'Divine': 'success',        // Green - Divine
    'Immortal': 'warning'       // Gold - Ultimate
  };
  
  return levelColors[levelName] || 'default';
};

/**
 * Get level display text with icon
 */
export const getLevelDisplayText = (level: number, levelName: string): string => {
  return `Level ${level} - ${levelName}`;
};

/**
 * Get level icon based on level name
 */
export const getLevelIcon = (levelName: string): string => {
  const levelIcons: Record<string, string> = {
    'Pemula': '🌱',
    'Berkembang': '🌿', 
    'Mahir': '🌳',
    'Ahli': '🏆',
    'Master': '⭐',
    'Grandmaster': '👑',
    'Legend': '🔥',
    'Mythic': '💎',
    'Divine': '✨',
    'Immortal': '🌟'
  };
  
  return levelIcons[levelName] || '📊';
};

/**
 * Level system configuration
 */
export const LEVEL_SYSTEM = [
  { level: 1, name: 'Pemula', xpRequired: 0, benefits: 'Akses dasar ke semua fitur' },
  { level: 2, name: 'Berkembang', xpRequired: 100, benefits: 'Akses ke quiz tambahan' },
  { level: 3, name: 'Mahir', xpRequired: 300, benefits: 'Akses ke materi advanced' },
  { level: 4, name: 'Ahli', xpRequired: 600, benefits: 'Akses ke proyek khusus' },
  { level: 5, name: 'Master', xpRequired: 1000, benefits: 'Akses ke semua fitur premium' },
  { level: 6, name: 'Grandmaster', xpRequired: 1500, benefits: 'Akses mentor untuk siswa lain' },
  { level: 7, name: 'Legend', xpRequired: 2200, benefits: 'Akses ke kompetisi eksklusif' },
  { level: 8, name: 'Mythic', xpRequired: 3000, benefits: 'Akses ke program beasiswa' },
  { level: 9, name: 'Divine', xpRequired: 4000, benefits: 'Akses ke universitas partner' },
  { level: 10, name: 'Immortal', xpRequired: 5500, benefits: 'Status legend sekolah' }
] as const;
