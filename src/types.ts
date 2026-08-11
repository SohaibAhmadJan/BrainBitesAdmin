export type BiteCategory =
  | 'Human Behavior'
  | 'Mental Health'
  | 'Brain Science'
  | 'Love & Attraction'
  | 'Personality Traits'
  | 'Body Language'
  | 'Subconscious Mind'
  | 'Social Psychology'
  | 'Habits & Motivation'
  | 'Memory & Learning'
  | 'All';

export const BiteCategories: BiteCategory[] = [
  'Human Behavior',
  'Mental Health',
  'Brain Science',
  'Love & Attraction',
  'Personality Traits',
  'Body Language',
  'Subconscious Mind',
  'Social Psychology',
  'Habits & Motivation',
  'Memory & Learning',
];

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


