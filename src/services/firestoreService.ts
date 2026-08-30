import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  limit,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
  orderBy,
  CollectionReference,
  Query,
  addDoc,
  Timestamp,
  documentId,
  collectionGroup
} from 'firebase/firestore';
import { db } from './firebaseService';
import { BiteItem, CollectionSet, AppNotification, UserProfile, AnalyticsEvent, AppSettings, AuditLog, Achievement, AdminUser, QuoteItem, Category, UserReport } from '../types';

// Helper to handle potentially null Firebase services
const getColl = (path: string) => db ? collection(db, path) : null as any;

const factsRef = getColl('facts') as CollectionReference;
const collectionsRef = getColl('collections') as CollectionReference;
const notificationsRef = getColl('notifications') as CollectionReference;
const usersRef = getColl('users') as CollectionReference;
const analyticsRef = getColl('analytics_events') as CollectionReference;
const settingsRef = getColl('app_settings') as CollectionReference;
const logsRef = getColl('audit_logs') as CollectionReference;
const achievementsRef = getColl('achievements') as CollectionReference;
const adminsRef = getColl('admins') as CollectionReference;
const quotesRef = getColl('quotes') as CollectionReference;
const categoriesRef = getColl('categories') as CollectionReference;
const reportsRef = getColl('user_reports') as CollectionReference;

/**
 * AUTHORITATIVE READS (Client-side enabled via Security Rules)
 */

export const fetchBites = async (fetchLimit: number = 500): Promise<BiteItem[]> => {
  if (!factsRef) return [];
  try {
    const q = query(factsRef, limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as BiteItem), id: doc.id }));
  } catch (err) {
    console.error('fetchBites failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const fetchBitesByIds = async (ids: string[]): Promise<BiteItem[]> => {
  if (!factsRef || ids.length === 0) return [];
  try {
    // Firestore 'in' query limit is 30 items
    const batches = [];
    for (let i = 0; i < ids.length; i += 30) {
      const batch = ids.slice(i, i + 30);
      const q = query(factsRef, where(documentId(), 'in', batch));
      batches.push(getDocs(q));
    }
    const snapshots = await Promise.all(batches);
    return snapshots.flatMap(snap =>
      snap.docs.map(doc => ({ ...(doc.data() as BiteItem), id: doc.id }))
    );
  } catch (err) {
    console.error('fetchBitesByIds failed', err);
    return [];
  }
};

export const fetchCollections = async (): Promise<CollectionSet[]> => {
  if (!collectionsRef) return [];
  try {
    const snapshot = await getDocs(collectionsRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as CollectionSet), id: doc.id }));
  } catch (err) {
    console.error('fetchCollections failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const fetchNotifications = async (fetchLimit: number = 100): Promise<AppNotification[]> => {
  if (!notificationsRef) return [];
  try {
    const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AppNotification), id: doc.id }));
  } catch (err) {
    console.error('fetchNotifications failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const fetchUsers = async (fetchLimit: number = 100): Promise<UserProfile[]> => {
  if (!usersRef) return [];
  try {
    const q = query(usersRef, limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserProfile), id: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchUserSubcollection = async (uid: string, sub: string, fetchLimit: number = 50): Promise<any[]> => {
    if (!db) return [];
    try {
        const subRef = collection(db, 'users', uid, sub);
        const q = query(subRef, limit(fetchLimit));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...(doc.data() as object), id: doc.id }));
    } catch (err) {
        console.error(`fetchUserSubcollection failed for ${sub}:`, err);
        return [];
    }
};

export const fetchAnalyticsEvents = async (days: number, fetchLimit: number = 5000): Promise<AnalyticsEvent[]> => {
    if (!analyticsRef) return [];
    try {
        const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const q = query(
            analyticsRef,
            where('timestamp', '>=', Timestamp.fromMillis(startTime)),
            orderBy('timestamp', 'desc'),
            limit(fetchLimit)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...(doc.data() as object), id: doc.id } as AnalyticsEvent));
    } catch (err) {
        console.error("fetchAnalyticsEvents failed:", err);
        return [];
    }
};

export const fetchAppSettings = async (): Promise<AppSettings | null> => {
  if (!settingsRef) return null;
  try {
    const docSnap = await getDoc(doc(settingsRef, 'global_config'));
    return docSnap.exists() ? (docSnap.data() as AppSettings) : null;
  } catch (err) {
    return null;
  }
};

export const fetchAuditLogs = async (fetchLimit: number = 200): Promise<AuditLog[]> => {
  if (!logsRef) return [];
  try {
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AuditLog), id: doc.id }));
  } catch (err) {
    console.error('fetchAuditLogs failed', err);
    return [];
  }
};

export const fetchAchievements = async (): Promise<Achievement[]> => {
  if (!achievementsRef) return [];
  try {
    const snapshot = await getDocs(achievementsRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as Achievement), id: doc.id }));
  } catch (err) {
    console.error('fetchAchievements failed', err);
    return [];
  }
};

export const fetchAdmins = async (): Promise<AdminUser[]> => {
  if (!adminsRef) return [];
  try {
    const snapshot = await getDocs(adminsRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AdminUser), id: doc.id }));
  } catch (err) {
    console.error('fetchAdmins failed', err);
    return [];
  }
};

export const fetchQuotes = async (): Promise<QuoteItem[]> => {
  if (!quotesRef) return [];
  try {
    const snapshot = await getDocs(quotesRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as QuoteItem), id: doc.id }));
  } catch (err) {
    console.error('fetchQuotes failed', err);
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  if (!categoriesRef) return [];
  try {
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as Category), id: doc.id }));
  } catch (err) {
    console.error('fetchCategories failed', err);
    return [];
  }
};

export const fetchAllDevices = async (): Promise<any[]> => {
    if (!db) return [];
    try {
        const devicesQuery = query(collectionGroup(db, 'devices'));
        const snapshot = await getDocs(devicesQuery);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            userId: doc.ref.parent.parent?.id
        }));
    } catch (err) {
        console.error("fetchAllDevices failed:", err);
        return [];
    }
};

export const fetchTotalInstallations = async (): Promise<number> => {
    if (!db) return 0;
    try {
        const installationsRef = collection(db, 'installations');
        const snapshot = await getDocs(installationsRef);
        console.log(`[FirestoreService] Total Installations Found: ${snapshot.size}`);
        return snapshot.size;
    } catch (err) {
        console.error("[FirestoreService] fetchTotalInstallations FAILED:", err);
        return 0;
    }
};

export const fetchReports = async (fetchLimit: number = 100): Promise<UserReport[]> => {
  if (!reportsRef) return [];
  try {
    const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserReport), id: doc.id }));
  } catch (err) {
    console.error('fetchReports failed', err);
    return [];
  }
};

/**
 * INTELLIGENCE AGGREGATORS (New Decision Engine Logic)
 */

export const fetchIntelligenceData = async (rangeDays: number) => {
    if (!analyticsRef) return null;
    try {
        const startTime = Date.now() - (rangeDays * 24 * 60 * 60 * 1000);
        const q = query(
            analyticsRef,
            where('timestamp', '>=', Timestamp.fromMillis(startTime))
        );
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => doc.data() as AnalyticsEvent);

        // 1. Funnel Calculation
        const funnel = {
            impressions: events.filter(e => e.name === 'app_open').length,
            reads: events.filter(e => e.name === 'read_fact').length,
            likes: events.filter(e => e.name === 'like_fact').length,
            shares: events.filter(e => e.name === 'fact_share').length
        };

        // 2. Search Intelligence
        const searchCounts: Record<string, number> = {};
        events.filter(e => e.name === 'content_search').forEach(e => {
            const q = e.params?.query || 'unknown';
            searchCounts[q] = (searchCounts[q] || 0) + 1;
        });
        const searchCloud = Object.entries(searchCounts)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20);

        // 3. Hourly Heatmap
        const hourlyMap: Record<number, number> = {};
        for(let i=0; i<24; i++) hourlyMap[i] = 0;
        events.forEach(e => {
            const hour = new Date(e.timestamp).getHours();
            hourlyMap[hour]++;
        });
        const heatmap = Object.entries(hourlyMap).map(([hour, count]) => ({ hour: parseInt(hour), count }));

        // 4. Churn Risk (Mock logic based on activity)
        const users = await fetchUsers();
        const activeUids = new Set(events.map(e => e.uid));
        const atRiskUsers = users.filter(u => {
            const daysSinceActive = (Date.now() - (u.stats?.lastActiveAt || 0)) / (1000 * 60 * 60 * 24);
            return daysSinceActive > 3 && daysSinceActive < 14;
        }).slice(0, 5);

        // 5. Stickiness Data (Interaction Rate vs Read Time)
        // Note: Read time is often static in BiteItem, but we can track session duration if logged.
        // For now, we use Views vs Likes as a proxy for "Stickiness".
        const facts = await fetchBites();
        const stickiness = facts.map(f => {
            const views = events.filter(e => e.name === 'read_fact' && e.params?.item_id === f.id).length;
            const interactions = events.filter(e => e.params?.item_id === f.id && e.name !== 'read_fact').length;
            return {
                name: f.fact.slice(0, 15),
                views,
                rate: views > 0 ? (interactions / views) * 100 : 0
            };
        }).filter(f => f.views > 0).slice(0, 20);

        // 6. Achievement Velocity
        const achEvents = events.filter(e => e.name === 'achievement_unlocked');
        const velocity = achEvents.length / (rangeDays || 1);

        // 7. Version Adoption
        const versionMap: Record<string, number> = {};
        users.forEach(u => {
            // Mocking version if not present
            const v = (u as any).device?.appVersion || '3.1.0';
            versionMap[v] = (versionMap[v] || 0) + 1;
        });
        const versions = Object.entries(versionMap).map(([name, value]) => ({ name, value }));

        return { funnel, searchCloud, heatmap, atRiskUsers, stickiness, velocity, versions };
    } catch (err) {
        console.error("Intelligence fetch failed:", err);
        return null;
    }
};

/**
 * REAL-TIME LISTENERS
 */

export const subscribeToBites = (callback: (items: BiteItem[]) => void) => {
  if (!factsRef) return () => {};
  const q = query(factsRef, limit(100)) as Query<DocumentData>;
  return onSnapshot(
    q,
    (snapshot) => {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as BiteItem), id: doc.id })));
    },
    (error) => {
        console.error('subscribeToBites listener error', error);
    }
  );
};

export const subscribeToCollections = (callback: (items: CollectionSet[]) => void) => {
  if (!collectionsRef) return () => {};
  return onSnapshot(
    collectionsRef as Query<DocumentData>,
    (snapshot) => {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as CollectionSet), id: doc.id })));
    },
    (error) => {
        console.error('subscribeToCollections listener error', error);
    }
  );
};

export const subscribeToNotifications = (callback: (items: AppNotification[]) => void) => {
  if (!notificationsRef) return () => {};
  const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(50)) as Query<DocumentData>;
  return onSnapshot(
    q,
    (snapshot) => {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as AppNotification), id: doc.id })));
    },
    (error) => {
        console.error('subscribeToNotifications listener error', error);
    }
  );
};

export const subscribeToInstallationCount = (callback: (count: number) => void) => {
    if (!db) return () => {};
    const installationsRef = collection(db, 'installations');
    return onSnapshot(installationsRef, (snapshot) => {
        callback(snapshot.size);
    }, (err) => {
        console.error("[FirestoreService] subscribeToInstallationCount FAILED:", err);
    });
};

export const subscribeToReports = (callback: (items: UserReport[]) => void) => {
  if (!reportsRef) return () => {};
  const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(50)) as Query<DocumentData>;
  return onSnapshot(
    q,
    (snapshot) => {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as UserReport), id: doc.id })));
    },
    (error) => {
        console.error('subscribeToReports listener error', error);
    }
  );
};

export const dispatchNotificationDirectly = async (notification: Omit<AppNotification, 'id'>): Promise<string> => {
    if (!notificationsRef) throw new Error('Firestore Connectivity Incomplete');
    try {
        const docRef = await addDoc(notificationsRef, {
            ...notification,
            timestamp: Date.now()
        });
        return docRef.id;
    } catch (err) {
        console.error('dispatchNotificationDirectly failed', err);
        throw new Error(err instanceof Error ? err.message : String(err));
    }
};

export const dispatchTargetedNotification = async (uid: string, notification: Omit<AppNotification, 'id'>): Promise<string> => {
    if (!db) throw new Error('Firestore Connectivity Incomplete');
    try {
        const subRef = collection(db, 'users', uid, 'notifications');
        const docRef = await addDoc(subRef, {
            ...notification,
            timestamp: Date.now()
        });
        return docRef.id;
    } catch (err) {
        console.error('dispatchTargetedNotification failed', err);
        throw new Error(err instanceof Error ? err.message : String(err));
    }
};
