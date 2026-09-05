import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp, db, auth } from './firebaseService';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { BiteItem, Category, AppSettings, AdminUser, AppNotification, CollectionSet, Achievement, QuoteItem } from '../types';
import { dispatchNotificationDirectly } from './firestoreService';

// Helper to get functions safely
const getFunctionsInstance = () => {
    if (!firebaseApp) return null;
    return getFunctions(firebaseApp);
};

/**
 * Admin API Bridge
 * Client-side wrappers for Trusted Backend mutations.
 */

export const updateFact = async (id: string, data: Partial<BiteItem>, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateFactAtomic');
    return fn({ id, data, reason });
};

export const deleteFact = async (id: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteFactAtomic');
    return fn({ id, reason });
};

export const updateCategory = async (id: string, data: Partial<Category>, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateCategoryAtomic');
    return fn({ id, data, reason });
};

export const deleteCategory = async (id: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteCategoryAtomic');
    return fn({ id, reason });
};

export const updateCollection = async (id: string, data: Partial<CollectionSet>, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateCollectionAtomic');
    return fn({ id, data, reason });
};

export const deleteCollection = async (id: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteCollectionAtomic');
    return fn({ id, reason });
};

export const updateAchievement = async (id: string, data: Partial<Achievement>, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateAchievementAtomic');
    return fn({ id, data, reason });
};

export const deleteAchievement = async (id: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteAchievementAtomic');
    return fn({ id, reason });
};

export const updateQuote = async (id: string, data: Partial<QuoteItem>, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateQuoteAtomic');
    return fn({ id, data, reason });
};

export const deleteQuote = async (id: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteQuoteAtomic');
    return fn({ id, reason });
};

export const bulkImportFacts = async (items: BiteItem[], reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'bulkImportFactsAtomic');
    return fn({ items, reason });
};

export const updateConfig = async (data: AppSettings, reason: string) => {
    if (!db || !auth?.currentUser) throw new Error('Administrative clearance required.');

    // Safety Sanitization: Strip 'undefined' values which cause Firestore Admin SDK to crash
    const sanitizedData = JSON.parse(JSON.stringify(data));

    try {
        // 1. Direct Write to app_settings/global_config
        const configRef = doc(db, 'app_settings', 'global_config');
        await setDoc(configRef, { ...sanitizedData, updatedAt: Date.now() }, { merge: true });

        // 2. Manual Audit Log Entry
        const auditRef = collection(db, 'audit_logs');
        await addDoc(auditRef, {
            adminUid: auth.currentUser.uid,
            action: 'UPDATE_CONFIG_DIRECT',
            targetType: 'CONFIG',
            targetId: 'global_config',
            after: sanitizedData,
            reason: reason || 'Direct system synchronization',
            createdAt: Date.now()
        });

        return { status: "success" };
    } catch (err) {
        console.error('Direct Config Sync ERROR:', err);
        throw err;
    }
};

export const updateAdmin = async (uid: string, data: Partial<AdminUser>, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateAdminAtomic');
    return fn({ uid, data, reason });
};

export const deleteAdmin = async (uid: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteAdminAtomic');
    return fn({ uid, reason });
};

export const sendGlobalNotification = async (data: Partial<AppNotification>, reason: string) => {
    // Safety Sanitization: Strip 'undefined' values
    const sanitizedData = JSON.parse(JSON.stringify(data));

    try {
        // Direct Firestore dispatch to bypass Cloud Function (Free Plan Compatibility)
        const newId = await dispatchNotificationDirectly({
            ...sanitizedData,
            timestamp: Date.now()
        } as any);

        // Optional: Manual Audit Log Entry
        if (db && auth?.currentUser) {
            const auditRef = collection(db, 'audit_logs');
            await addDoc(auditRef, {
                adminUid: auth.currentUser.uid,
                action: 'SEND_NOTIFICATION_DIRECT',
                targetType: 'NOTIFICATION',
                targetId: newId,
                after: sanitizedData,
                reason: reason || 'Broadcast dispatch (direct)',
                createdAt: Date.now()
            });
        }

        return { status: "success", data: { notificationId: newId } };
    } catch (err) {
        console.error('sendGlobalNotification ERROR:', err);
        throw err;
    }
};

export const deleteNotification = async (id: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'deleteNotificationAtomic');
    return fn({ id, reason });
};

export const updateUserStatus = async (uid: string, status: 'ACTIVE' | 'DISABLED', reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateUserStatusAtomic');
    return fn({ uid, status, reason });
};

export const pingApi = async () => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'ping');
    return fn({});
};

export const resetUserStats = async (uid: string, fields: string[], reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'resetUserStatsAtomic');
    return fn({ uid, fields, reason });
};

export const awardAchievement = async (uid: string, achievementId: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'awardAchievementAtomic');
    return fn({ uid, achievementId, reason });
};

export const updateReportStatus = async (id: string, status: string, reason: string) => {
    const functions = getFunctionsInstance();
    if (!functions) throw new Error('Cloud Connectivity Not Initialized');
    const fn = httpsCallable(functions, 'updateReportStatusAtomic');
    return fn({ id, status, reason });
};
