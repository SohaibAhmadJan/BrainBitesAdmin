import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from './firebaseService';
import { BiteItem, Category, AppSettings, AdminUser, AppNotification, QuizQuestion, CollectionSet, Achievement, QuoteItem } from '../types';

const functions = getFunctions(firebaseApp);

/**
 * Admin API Bridge
 * Client-side wrappers for Trusted Backend mutations.
 */

export const updateFact = async (id: string, data: Partial<BiteItem>, reason: string) => {
    const fn = httpsCallable(functions, 'updateFactAtomic');
    return fn({ id, data, reason });
};

export const deleteFact = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteFactAtomic');
    return fn({ id, reason });
};

export const updateQuiz = async (id: string, data: Partial<QuizQuestion>, reason: string) => {
    const fn = httpsCallable(functions, 'updateQuizAtomic');
    return fn({ id, data, reason });
};

export const deleteQuiz = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteQuizAtomic');
    return fn({ id, reason });
};

export const updateCategory = async (id: string, data: Partial<Category>, reason: string) => {
    const fn = httpsCallable(functions, 'updateCategoryAtomic');
    return fn({ id, data, reason });
};

export const deleteCategory = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteCategoryAtomic');
    return fn({ id, reason });
};

export const updateCollection = async (id: string, data: Partial<CollectionSet>, reason: string) => {
    const fn = httpsCallable(functions, 'updateCollectionAtomic');
    return fn({ id, data, reason });
};

export const deleteCollection = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteCollectionAtomic');
    return fn({ id, reason });
};

export const updateAchievement = async (id: string, data: Partial<Achievement>, reason: string) => {
    const fn = httpsCallable(functions, 'updateAchievementAtomic');
    return fn({ id, data, reason });
};

export const deleteAchievement = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteAchievementAtomic');
    return fn({ id, reason });
};

export const updateQuote = async (id: string, data: Partial<QuoteItem>, reason: string) => {
    const fn = httpsCallable(functions, 'updateQuoteAtomic');
    return fn({ id, data, reason });
};

export const deleteQuote = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteQuoteAtomic');
    return fn({ id, reason });
};

export const bulkImportFacts = async (items: BiteItem[], reason: string) => {
    const fn = httpsCallable(functions, 'bulkImportFactsAtomic');
    return fn({ items, reason });
};

export const updateConfig = async (data: AppSettings, reason: string) => {
    const fn = httpsCallable(functions, 'updateAppConfigAtomic');
    return fn({ data, reason });
};

export const updateAdmin = async (uid: string, data: Partial<AdminUser>, reason: string) => {
    const fn = httpsCallable(functions, 'updateAdminAtomic');
    return fn({ uid, data, reason });
};

export const deleteAdmin = async (uid: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteAdminAtomic');
    return fn({ uid, reason });
};

export const sendGlobalNotification = async (data: Partial<AppNotification>, reason: string) => {
    const fn = httpsCallable(functions, 'sendGlobalNotificationAtomic');
    return fn({ data, reason });
};

export const deleteNotification = async (id: string, reason: string) => {
    const fn = httpsCallable(functions, 'deleteNotificationAtomic');
    return fn({ id, reason });
};

export const updateUserStatus = async (uid: string, status: 'ACTIVE' | 'DISABLED', reason: string) => {
    const fn = httpsCallable(functions, 'updateUserStatusAtomic');
    return fn({ uid, status, reason });
};

export const pingApi = async () => {
    const fn = httpsCallable(functions, 'ping');
    return fn({});
};

export const resetUserStats = async (uid: string, fields: string[], reason: string) => {
    const fn = httpsCallable(functions, 'resetUserStatsAtomic');
    return fn({ uid, fields, reason });
};

export const awardAchievement = async (uid: string, achievementId: string, reason: string) => {
    const fn = httpsCallable(functions, 'awardAchievementAtomic');
    return fn({ uid, achievementId, reason });
};
