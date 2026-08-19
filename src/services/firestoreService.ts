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
  Query
} from 'firebase/firestore';
import { db } from './firebaseService';
import { BiteItem, CollectionSet, AppNotification, UserProfile, AnalyticsEvent, AppSettings, AuditLog, Achievement, AdminUser, QuoteItem, Category, QuizQuestion } from '../types';

// Helper to handle potentially null Firebase services
const getColl = (path: string) => db ? collection(db, path) : null as any;

const factsRef = getColl('facts') as CollectionReference;
const collectionsRef = getColl('collections') as CollectionReference;
const quizzesRef = getColl('quizzes') as CollectionReference;
const notificationsRef = getColl('notifications') as CollectionReference;
const usersRef = getColl('users') as CollectionReference;
const analyticsRef = getColl('analytics_events') as CollectionReference;
const settingsRef = getColl('app_settings') as CollectionReference;
const logsRef = getColl('audit_logs') as CollectionReference;
const achievementsRef = getColl('achievements') as CollectionReference;
const adminsRef = getColl('admins') as CollectionReference;
const quotesRef = getColl('quotes') as CollectionReference;
const categoriesRef = getColl('categories') as CollectionReference;

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

export const fetchQuizzes = async (fetchLimit: number = 200): Promise<QuizQuestion[]> => {
  if (!quizzesRef) return [];
  try {
    const q = query(quizzesRef, limit(fetchLimit));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as QuizQuestion), id: doc.id }));
  } catch (err) {
    console.error('fetchQuizzes failed', err);
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

export const fetchAnalyticsEvents = async (days: number, fetchLimit: number = 1000): Promise<AnalyticsEvent[]> => {
    if (!analyticsRef) return [];
    try {
        const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const q = query(
            analyticsRef,
            where('timestamp', '>=', startTime),
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
