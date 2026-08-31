export type BiteCategory = string;

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  vectorIcon: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface BiteItem {
  id: string;
  fact: string;
  category: BiteCategory;
  categoryId: string;
  title: string | null;
  snippet: string | null;
  fullFact: string | null;
  whyItMatters: string | null;
  teaserType: string | null;
  imageUrl: string | null;
  keywords: string | null;
  readTimeMinutes: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CollectionSet {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  factIds: string[];
  isPublished: boolean;
  createdAt: number;
}

export type NotificationType = 'NEW_FACT' | 'ACHIEVEMENT' | 'SYSTEM' | 'GENERAL';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience?: string | null; // Added: For segment labeling (e.g., 3+ DAYS)
  imageUrl?: string | null;
  deepLinkFactId?: string | null;
  isGlobal: boolean;
  targetUserId?: string | null; // Added: For specific user targeting
  scheduledAt?: number | null;  // Added: For future broadcasts
  timestamp: number;
}

export interface UserAccount {
  uid: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

export interface UserProfileFields {
  displayName: string;
  email: string;
  photoUrl: string;
  bio: string;
  isPublic: boolean;
}

export interface UserStats {
  streakCount: number;
  factsReadCount: number;
  favoritesCount: number;
  sharesCount: number;
  lastActiveAt: number;
}

export interface UserPreferences {
  dailyGoal: number;
  textScale: number;
  hapticsEnabled: boolean;
  analyticsEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  id: string; // Matches account.uid
  account: UserAccount;
  profile: UserProfileFields;
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserDevice {
  id: string; // deviceId
  fcmToken: string;
  platform: 'android';
  appVersion: string;
  createdAt: number;
  updatedAt: number;
  lastSeenAt: number;
}

export interface CollectionProgress {
  id: string; // collectionId
  progress: number; // 0 to 1
  lastUpdated: number;
  readFactIds: string[];
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  params: Record<string, any>;
  uid: string;
  timestamp: number;
}

export interface AppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  latestVersion: string;
  minVersion: string;
  supportEmail: string;
  featureFlags: {
    achievementsEnabled: boolean;
    dailyFactEnabled: boolean;
  };
  dailyTipTitle: string;
  dailyTipMessage: string;
  featuredFactId: string;
  homeSectionsOrder: string[];
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  action: string;
  targetType: string;
  targetId: string;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  reason: string | null;
  createdAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  maxProgress: number;
  requirementType: string;
  isPublished: boolean;
  createdAt: number;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'ANALYST';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: BiteCategory;
  isActive: boolean;
  createdAt: number;
}

export type ReportType = 'BUG' | 'CONTENT' | 'FEEDBACK' | 'OTHER';
export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserReport {
  id: string;
  uid: string;
  type: ReportType;
  subject: string;
  message: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: number;
  updatedAt: number;
}
