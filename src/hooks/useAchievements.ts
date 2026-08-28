import { useState, useEffect } from 'react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { useAdmin } from '../context/AdminContext';
import { Achievement } from '../types';
import { fetchAchievements } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const useAchievements = () => {
  const { adminUser } = useAdmin();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await fetchAchievements();
      // Handle rename migration and default to true
      const normalized = data.map(ach => ({
        ...ach,
        isPublished: (ach as any).isPublished ?? (ach as any).isActive ?? true
      }));
      setAchievements(normalized);
    } catch (err) {
      toast.error('Achievement sync failure');
    } finally {
      setLoading(false);
    }
  };

  const saveAchievement = async (ach: Achievement) => {
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return false;
    }

    const snapshot = [...achievements];
    const isNew = !achievements.some(a => a.id === ach.id);

    try {
      // Optimistic Update
      setAchievements(prev => {
        const index = prev.findIndex(a => a.id === ach.id);
        if (index !== -1) {
          const newAchs = [...prev];
          newAchs[index] = ach;
          return newAchs;
        }
        return [...prev, ach];
      });

      const batch = writeBatch(db);
      const achRef = doc(db, 'achievements', ach.id);
      batch.set(achRef, ach, { merge: true });

      // Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: isNew ? 'CREATE_ACHIEVEMENT_CLIENT' : 'UPDATE_ACHIEVEMENT_CLIENT',
        targetType: 'ACHIEVEMENT',
        targetId: ach.id,
        reason: 'Manual Achievement Update (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success(isNew ? 'New milestone anchored' : 'Milestone record updated');
      return true;
    } catch (err: any) {
      setAchievements(snapshot);
      toast.error(`Handshake failure: ${err.message}`);
      return false;
    }
  };

  const removeAchievement = async (id: string, title: string) => {
    if (!window.confirm(`Dissolve ${title} milestone?`)) return;
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return;
    }

    const snapshot = [...achievements];
    setAchievements(prev => prev.filter(a => a.id !== id));

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'achievements', id));

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'DELETE_ACHIEVEMENT_CLIENT',
        targetType: 'ACHIEVEMENT',
        targetId: id,
        reason: 'Manual milestone removal (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Milestone expunged');
    } catch (err: any) {
      setAchievements(snapshot);
      toast.error(`Expunge failed: ${err.message}`);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const filteredAchievements = achievements.filter(ach =>
    ach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ach.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    achievements: filteredAchievements,
    allAchievements: achievements,
    loading,
    searchTerm,
    setSearchTerm,
    saveAchievement,
    removeAchievement,
    refresh: loadAchievements
  };
};
