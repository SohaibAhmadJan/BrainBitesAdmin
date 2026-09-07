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

/**
 * DYNAMIC REGISTRY
 * Ensures we always use the latest initialized Firestore instance.
 * Prevents "Null Reference" errors if the module is imported before Firebase settling.
 */
const getColl = (path: string) => {
    if (!db) {
        console.error(`[Firestore] Attempted to access collection '${path}' before database initialization.`);
        return null;
    }
    return collection(db, path);
};

// Getter functions for references to ensure they aren't stuck at 'null'
const getFactsRef = () => getColl('facts');
const getCollectionsRef = () => getColl('collections');
const getNotificationsRef = () => getColl('notifications');
const getUsersRef = () => getColl('users');
const getAnalyticsRef = () => getColl('analytics_events');
const getSettingsRef = () => getColl('app_settings');
const getLogsRef = () => getColl('audit_logs');
const getAchievementsRef = () => getColl('achievements');
const getAdminsRef = () => getColl('admins');
const getQuotesRef = () => getColl('quotes');
const getCategoriesRef = () => getColl('categories');
const getReportsRef = () => getColl('user_reports');

/**
 * AUTHORITATIVE READS
 */

export const fetchBites = async (fetchLimit: number = 500): Promise<BiteItem[]> => {
  const ref = getFactsRef();
  if (!ref) return [];
  try {
    const q = query(ref, limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as BiteItem), id: doc.id }));
  } catch (err) {
    console.error('fetchBites failed', err);
    return [];
  }
};

export const fetchBitesByIds = async (ids: string[]): Promise<BiteItem[]> => {
  const ref = getFactsRef();
  if (!ref || ids.length === 0) return [];
  try {
    const batches = [];
    for (let i = 0; i < ids.length; i += 30) {
      const batch = ids.slice(i, i + 30);
      const q = query(ref, where(documentId(), 'in', batch));
      batches.push(getDocs(q));
    }
    const snapshots = await Promise.all(batches);
    return snapshots.flatMap(snap =>
      snap.docs.map(doc => ({ ...(doc.data() as BiteItem), id: doc.id }))
    );
  } catch (err) {
    return [];
  }
};

export const fetchCollections = async (): Promise<CollectionSet[]> => {
  const ref = getCollectionsRef();
  if (!ref) return [];
  try {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as CollectionSet), id: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchNotifications = async (fetchLimit: number = 100): Promise<AppNotification[]> => {
  const ref = getNotificationsRef();
  if (!ref) return [];
  try {
    const q = query(ref, orderBy('timestamp', 'desc'), limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AppNotification), id: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchUsers = async (fetchLimit: number = 100): Promise<UserProfile[]> => {
  const ref = getUsersRef();
  if (!ref) return [];
  try {
    const q = query(ref, limit(fetchLimit));
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
        return [];
    }
};

export const fetchAnalyticsEvents = async (days: number, fetchLimit: number = 5000): Promise<AnalyticsEvent[]> => {
    const ref = getAnalyticsRef();
    if (!ref) return [];
    try {
        const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const q = query(
            ref,
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
  const ref = getSettingsRef();
  if (!ref) return null;
  try {
    const docSnap = await getDoc(doc(ref, 'global_config'));
    return docSnap.exists() ? (docSnap.data() as AppSettings) : null;
  } catch (err) {
    return null;
  }
};

export const fetchAuditLogs = async (fetchLimit: number = 200): Promise<AuditLog[]> => {
  const ref = getLogsRef();
  if (!ref) return [];
  try {
    const q = query(ref, orderBy('createdAt', 'desc'), limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AuditLog), id: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchAchievements = async (): Promise<Achievement[]> => {
  const ref = getAchievementsRef();
  if (!ref) return [];
  try {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as Achievement), id: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchAdmins = async (): Promise<AdminUser[]> => {
  const ref = getAdminsRef();
  if (!ref) return [];
  try {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AdminUser), uid: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchQuotes = async (): Promise<QuoteItem[]> => {
  const ref = getQuotesRef();
  if (!ref) return [];
  try {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as QuoteItem), id: doc.id }));
  } catch (err) {
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  const ref = getCategoriesRef();
  if (!ref) return [];
  try {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as Category), id: doc.id }));
  } catch (err) {
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
        return [];
    }
};

export const fetchTotalInstallations = async (): Promise<number> => {
    if (!db) return 0;
    try {
        const installationsRef = collection(db, 'installations');
        const snapshot = await getDocs(installationsRef);
        return snapshot.size;
    } catch (err) {
        return 0;
    }
};

export const fetchReports = async (fetchLimit: number = 100): Promise<UserReport[]> => {
  const ref = getReportsRef();
  if (!ref) return [];
  try {
    const q = query(ref, orderBy('createdAt', 'desc'), limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserReport), id: doc.id }));
  } catch (err) {
    return [];
  }
};

/**
 * REAL-TIME LISTENERS
 */

export const subscribeToBites = (callback: (items: BiteItem[]) => void) => {
  const ref = getFactsRef();
  if (!ref) return () => {};
  const q = query(ref, limit(100)) as Query<DocumentData>;
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
  const ref = getCollectionsRef();
  if (!ref) return () => {};
  return onSnapshot(
    ref as Query<DocumentData>,
    (snapshot) => {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as CollectionSet), id: doc.id })));
    },
    (error) => {
        console.error('subscribeToCollections listener error', error);
    }
  );
};

export const subscribeToNotifications = (callback: (items: AppNotification[]) => void) => {
  const ref = getNotificationsRef();
  if (!ref) return () => {};
  const q = query(ref, orderBy('timestamp', 'desc'), limit(50)) as Query<DocumentData>;
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
  const ref = getReportsRef();
  if (!ref) return () => {};
  const q = query(ref, orderBy('createdAt', 'desc'), limit(50)) as Query<DocumentData>;
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
    const ref = getNotificationsRef();
    if (!ref) throw new Error('Firestore Connectivity Incomplete');
    try {
        const docRef = await addDoc(ref, {
            ...notification,
            timestamp: Date.now()
        });
        return docRef.id;
    } catch (err) {
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
        throw new Error(err instanceof Error ? err.message : String(err));
    }
};
