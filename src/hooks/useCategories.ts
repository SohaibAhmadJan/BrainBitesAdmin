import { useState, useEffect } from 'react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { useAdmin } from '../context/AdminContext';
import { Category } from '../types';
import { fetchCategories } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const useCategories = () => {
  const { adminUser } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      // Robust de-duplication by standardized ID and Name
      const uniqueMap = new Map<string, Category>();
      data.forEach(cat => {
        const standardId = cat.id.toUpperCase().replace(/\s+/g, '_');
        const nameKey = cat.name.trim().toLowerCase();

        // Handle field rename and default to true
        const isPublished = (cat as any).isPublished ?? (cat as any).isActive ?? true;

        // Priority: If we already have this name/id, keep the one that likely has more data (description)
        if (!uniqueMap.has(nameKey) || (cat.description?.length || 0) > (uniqueMap.get(nameKey)?.description?.length || 0)) {
          uniqueMap.set(nameKey, { ...cat, id: standardId, isPublished });
        }
      });

      setCategories(Array.from(uniqueMap.values()).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      toast.error('Domain sync failure');
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (cat: Partial<Category>) => {
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return false;
    }

    const snapshot = [...categories];

    // Enforce Standardized ID: UPPERCASE_WITH_UNDERSCORES
    const standardId = (cat.id || cat.name || '').trim().toUpperCase().replace(/\s+/g, '_');
    const isNew = !categories.some(c => c.id === standardId);

    const fullCat: Category = {
      id: standardId,
      name: cat.name || '',
      description: cat.description || '',
      color: cat.color || '#2D6A4F',
      icon: cat.icon || '🧠',
      vectorIcon: cat.vectorIcon || 'LayoutGrid',
      isPublished: cat.isPublished ?? true,
      sortOrder: cat.sortOrder ?? 0,
      createdAt: cat.createdAt || Date.now()
    };

    try {
      // Optimistic Update
      setCategories(prev => {
        const index = prev.findIndex(c => c.id === fullCat.id);
        if (index !== -1) {
          const newCats = [...prev];
          newCats[index] = fullCat;
          return newCats.sort((a, b) => a.sortOrder - b.sortOrder);
        }
        return [...prev, fullCat].sort((a, b) => a.sortOrder - b.sortOrder);
      });

      const batch = writeBatch(db);
      const catRef = doc(db, 'categories', fullCat.id);
      batch.set(catRef, fullCat, { merge: true });

      // Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: isNew ? 'CREATE_CATEGORY_CLIENT' : 'UPDATE_CATEGORY_CLIENT',
        targetType: 'CATEGORY',
        targetId: fullCat.id,
        reason: 'Manual Category Update (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success(isNew ? 'New domain anchored' : 'Domain record updated');
      return true;
    } catch (err: any) {
      setCategories(snapshot);
      toast.error(`Handshake failure: ${err.message}`);
      return false;
    }
  };

  const removeCategory = async (id: string, name: string) => {
    if (!window.confirm(`Dissolve ${name} domain?`)) return;
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return;
    }

    const snapshot = [...categories];
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'categories', id));

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'DELETE_CATEGORY_CLIENT',
        targetType: 'CATEGORY',
        targetId: id,
        reason: 'Manual domain removal (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Domain expunged');
    } catch (err: any) {
      setCategories(snapshot);
      toast.error(`Expunge failed: ${err.message}`);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    categories: filteredCategories,
    allCategories: categories,
    loading,
    searchTerm,
    setSearchTerm,
    saveCategory,
    removeCategory,
    refresh: loadCategories
  };
};
