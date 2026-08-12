import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  limit,
  DocumentData,
  QuerySnapshot,
  FirestoreError
} from 'firebase/firestore';
import { db } from './firebaseService';
import { BiteItem, CollectionSet, AppNotification, UserProfile, UserActivity, AppSettings, AuditLog, Achievement, AdminUser, QuoteItem, Category } from '../types';

// Helper to handle potentially null Firebase services
const getColl = (path: string) => db ? collection(db, path) : null as any;

const factsRef = getColl('facts');
const collectionsRef = getColl('collections');
const notificationsRef = getColl('notifications');
const usersRef = getColl('users');
const activityRef = getColl('user_activity');
const settingsRef = getColl('app_settings');
const logsRef = getColl('audit_logs');
const achievementsRef = getColl('achievements');
const adminsRef = getColl('admins');
const quotesRef = getColl('quotes');
const categoriesRef = getColl('categories');

export const fetchBites = async (): Promise<BiteItem[]> => {
  if (!factsRef) return [];
  try {
    const snapshot = await getDocs(factsRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as BiteItem), id: doc.id }));
  } catch (err) {
    console.error('fetchBites failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
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

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  if (!notificationsRef) return [];
  try {
    const snapshot = await getDocs(notificationsRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AppNotification), id: doc.id }));
  } catch (err) {
    console.error('fetchNotifications failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const fetchUsers = async (): Promise<UserProfile[]> => {
  if (!usersRef) return [];
  try {
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserProfile), id: doc.id }));
  } catch (err) {
    return []; // Return empty if collection doesn't exist yet
  }
};

export const fetchRecentActivity = async (): Promise<UserActivity[]> => {
  if (!activityRef) return [];
  try {
    const snapshot = await getDocs(query(activityRef, limit(20)));
    return snapshot.docs.map((doc) => ({ ...(doc.data() as UserActivity), id: doc.id }));
  } catch (err) {
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

export const updateAppSettings = async (settings: AppSettings) => {
  if (!settingsRef) throw new Error('Firestore not initialized');
  try {
    await setDoc(doc(settingsRef, 'global_config'), settings, { merge: true });
  } catch (err) {
    throw new Error('Failed to update app settings');
  }
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  if (!logsRef) return [];
  try {
    const snapshot = await getDocs(query(logsRef, limit(50)));
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

export const createOrUpdateAchievement = async (achievement: Achievement) => {
  if (!achievementsRef) throw new Error('Firestore not initialized');
  try {
    const achDoc = doc(achievementsRef, achievement.id);
    await setDoc(achDoc, achievement, { merge: true });
  } catch (err) {
    console.error('createOrUpdateAchievement failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const deleteAchievement = async (id: string) => {
  if (!achievementsRef) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(achievementsRef, id));
  } catch (err) {
    console.error('deleteAchievement failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
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

export const createOrUpdateAdmin = async (admin: AdminUser) => {
  if (!adminsRef) throw new Error('Firestore not initialized');
  try {
    const adminDoc = doc(adminsRef, admin.id);
    await setDoc(adminDoc, admin, { merge: true });
  } catch (err) {
    console.error('createOrUpdateAdmin failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const deleteAdmin = async (id: string) => {
  if (!adminsRef) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(adminsRef, id));
  } catch (err) {
    console.error('deleteAdmin failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
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

export const createOrUpdateQuote = async (quote: QuoteItem) => {
  if (!quotesRef) throw new Error('Firestore not initialized');
  try {
    const quoteDoc = doc(quotesRef, quote.id);
    await setDoc(quoteDoc, quote, { merge: true });
  } catch (err) {
    console.error('createOrUpdateQuote failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const deleteQuote = async (id: string) => {
  if (!quotesRef) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(quotesRef, id));
  } catch (err) {
    console.error('deleteQuote failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
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

export const createOrUpdateCategory = async (category: Category) => {
  if (!categoriesRef) throw new Error('Firestore not initialized');
  try {
    const catDoc = doc(categoriesRef, category.id);
    await setDoc(catDoc, category, { merge: true });
  } catch (err) {
    console.error('createOrUpdateCategory failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const deleteCategory = async (id: string) => {
  if (!categoriesRef) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(categoriesRef, id));
  } catch (err) {
    console.error('deleteCategory failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  if (!logsRef) return;
  try {
    const newLog = {
      ...log,
      timestamp: new Date().toISOString()
    };
    await addDoc(logsRef, newLog);
  } catch (err) {
    console.error('Audit log failed', err);
  }
};

export const createOrUpdateBite = async (bite: BiteItem) => {
  if (!factsRef) throw new Error('Firestore not initialized');
  try {
    const biteDoc = doc(factsRef, bite.id);
    await setDoc(biteDoc, bite, { merge: true });
  } catch (err) {
    console.error('createOrUpdateBite failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const deleteBite = async (biteId: string) => {
  if (!factsRef) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(factsRef, biteId));
  } catch (err) {
    console.error('deleteBite failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const createOrUpdateCollection = async (collectionItem: CollectionSet) => {
  if (!collectionsRef) throw new Error('Firestore not initialized');
  try {
    const collectionDoc = doc(collectionsRef, collectionItem.id);
    await setDoc(collectionDoc, collectionItem, { merge: true });
  } catch (err) {
    console.error('createOrUpdateCollection failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const deleteCollection = async (collectionId: string) => {
  if (!collectionsRef) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(collectionsRef, collectionId));
  } catch (err) {
    console.error('deleteCollection failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const createNotification = async (notification: AppNotification) => {
  if (!notificationsRef) throw new Error('Firestore not initialized');
  try {
    const notificationDoc = doc(notificationsRef, notification.id);
    await setDoc(notificationDoc, notification, { merge: true });
  } catch (err) {
    console.error('createNotification failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const bulkImportBites = async (bites: BiteItem[]) => {
  if (!factsRef || !db) throw new Error('Firestore not initialized');
  try {
    const batch = writeBatch(db);
    bites.forEach((bite) => {
      const docRef = doc(factsRef, bite.id);
      batch.set(docRef, bite);
    });
    await batch.commit();
  } catch (err) {
    console.error('bulkImportBites failed', err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export const subscribeToBites = (callback: (items: BiteItem[]) => void) => {
  if (!factsRef) return () => {};
  return onSnapshot(
    factsRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as BiteItem), id: doc.id })));
      } catch (err) {
        console.error('subscribeToBites callback failed', err);
      }
    },
    (error: FirestoreError) => {
      console.error('subscribeToBites listener error', error);
    }
  );
};

export const subscribeToCollections = (callback: (items: CollectionSet[]) => void) => {
  if (!collectionsRef) return () => {};
  return onSnapshot(
    collectionsRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as CollectionSet), id: doc.id })));
      } catch (err) {
        console.error('subscribeToCollections callback failed', err);
      }
    },
    (error: FirestoreError) => {
      console.error('subscribeToCollections listener error', error);
    }
  );
};

export const subscribeToNotifications = (callback: (items: AppNotification[]) => void) => {
  if (!notificationsRef) return () => {};
  return onSnapshot(
    notificationsRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        callback(snapshot.docs.map((doc) => ({ ...(doc.data() as AppNotification), id: doc.id })));
      } catch (err) {
        console.error('subscribeToNotifications callback failed', err);
      }
    },
    (error: FirestoreError) => {
      console.error('subscribeToNotifications listener error', error);
    }
  );
};