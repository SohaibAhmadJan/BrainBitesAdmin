export type BiteCategory = string;

export const CategoryPresets = [
  { id: 'HUMAN_BEHAVIOR', name: 'Human Behavior', color: '#A8DADC', icon: '👥', vectorIcon: 'Users' },
  { id: 'MENTAL_HEALTH', name: 'Mental Health', color: '#457B9D', icon: '🧠', vectorIcon: 'Brain' },
  { id: 'BRAIN_SCIENCE', name: 'Brain Science', color: '#E9C46A', icon: '🧪', vectorIcon: 'FlaskConical' },
  { id: 'LOVE_ATTRACTION', name: 'Love & Attraction', color: '#E76F51', icon: '💖', vectorIcon: 'Heart' },
  { id: 'PERSONALITY', name: 'Personality Traits', color: '#F4A261', icon: '🎭', vectorIcon: 'Smile' },
  { id: 'BODY_LANGUAGE', name: 'Body Language', color: '#2A9D8F', icon: '✋', vectorIcon: 'Hand' },
  { id: 'SUBCONSCIOUS', name: 'Subconscious Mind', color: '#264653', icon: '🌌', vectorIcon: 'Waves' },
  { id: 'SOCIAL_PSYCHOLOGY', name: 'Social Psychology', color: '#8AB17D', icon: '🏘️', vectorIcon: 'Globe' },
  { id: 'HABITS_MOTIVATION', name: 'Habits & Motivation', color: '#B5838D', icon: '📈', vectorIcon: 'TrendingUp' },
  { id: 'MEMORY_LEARNING', name: 'Memory & Learning', color: '#6D6875', icon: '📚', vectorIcon: 'BookOpen' },
];

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  vectorIcon: string;
  createdAt: string;
}

export interface BiteItem {
  id: string;
  fact: string;
  category: BiteCategory;
  title?: string | null;
  snippet?: string | null;
  fullFact?: string | null;
  whyItMatters?: string | null;
  quizQuestion?: string | null;
  quizOptions?: string[] | null;
  correctAnswerIndex?: number | null;
  teaserType?: string | null;
  imageUrl?: string | null;
  keywords?: string | null;
  readTimeMinutes?: number;
}

export interface CollectionSet {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  factIds: string[];
}

export type NotificationType = 'NEW_FACT' | 'ACHIEVEMENT' | 'SYSTEM' | 'GENERAL';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  imageUrl?: string | null;
  deepLinkFactId?: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  userName: string;
  about: string;
  registrationDate: string;
  lastActive: string;
  factsViewed: number;
  favoritesCount: number;
  quizScore: number;
  achievementsCount: number;
  level: number;
  streak: number;
  status: 'Active' | 'Suspended' | 'Pending';
  achievements: string[]; // List of achievement IDs
  collections: {
    id: string;
    title: string;
    progress: number; // 0 to 1
  }[];
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'READ_FACT' | 'LIKE_FACT' | 'COMPLETE_QUIZ' | 'APP_OPEN';
  targetId?: string;
  targetName?: string;
  timestamp: string;
}

export interface AppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  latestVersion: string;
  minVersion: string;
  supportEmail: string;
  featureFlags: {
    quizzesEnabled: boolean;
    achievementsEnabled: boolean;
    dailyFactEnabled: boolean;
  };
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  maxProgress: number;
  points: number;
  type: 'MILESTONE' | 'STREAK' | 'SOCIAL' | 'HIDDEN';
  isActive: boolean;
}

export type AdminRole = 'SUPER_ADMIN' | 'EDITOR' | 'VIEWER';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: BiteCategory;
  isActive: boolean;
  createdAt: string;
}
