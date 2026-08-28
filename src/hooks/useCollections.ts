import { useState, useEffect } from 'react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { useAdmin } from '../context/AdminContext';
import { CollectionSet } from '../types';
import { fetchCollections } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const useCollections = () => {
  const { adminUser } = useAdmin();
  const [collections, setCollections] = useState<CollectionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (err) {
      toast.error('Collection sync failure');
    } finally {
      setLoading(false);
    }
  };

  const saveCollection = async (col: CollectionSet) => {
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return false;
    }

    const snapshot = [...collections];
    const isNew = !collections.some(c => c.id === col.id);

    try {
      // Optimistic Update
      setCollections(prev => {
        const index = prev.findIndex(c => c.id === col.id);
        if (index !== -1) {
          const newCols = [...prev];
          newCols[index] = col;
          return newCols;
        }
        return [...prev, col];
      });

      const batch = writeBatch(db);
      const colRef = doc(db, 'collections', col.id);
      batch.set(colRef, col, { merge: true });

      // Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: isNew ? 'CREATE_COLLECTION_CLIENT' : 'UPDATE_COLLECTION_CLIENT',
        targetType: 'COLLECTION',
        targetId: col.id,
        reason: 'Manual Collection Update (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success(isNew ? 'New collection anchored' : 'Collection record updated');
      return true;
    } catch (err: any) {
      setCollections(snapshot);
      toast.error(`Handshake failure: ${err.message}`);
      return false;
    }
  };

  const removeCollection = async (id: string, title: string) => {
    if (!window.confirm(`Dissolve ${title} collection?`)) return;
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return;
    }

    const snapshot = [...collections];
    setCollections(prev => prev.filter(c => c.id !== id));

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'collections', id));

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'DELETE_COLLECTION_CLIENT',
        targetType: 'COLLECTION',
        targetId: id,
        reason: 'Manual collection removal (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Collection expunged');
    } catch (err: any) {
      setCollections(snapshot);
      toast.error(`Expunge failed: ${err.message}`);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const filteredCollections = collections.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    collections: filteredCollections,
    allCollections: collections,
    loading,
    searchTerm,
    setSearchTerm,
    saveCollection,
    removeCollection,
    refresh: loadCollections
  };
};
