import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { useAdmin } from '../context/AdminContext';
import { BiteItem } from '../types';
import { fetchBites } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const useFacts = () => {
  const { adminUser } = useAdmin();
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const loadFacts = async () => {
    setLoading(true);
    try {
      const data = await fetchBites();
      setFacts(data.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (err) {
      toast.error('Failed to load facts');
    } finally {
      setLoading(false);
    }
  };

  const saveFact = async (fact: BiteItem) => {
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return false;
    }

    // 1. Capture snapshot for rollback
    const snapshot = [...facts];
    const isNew = !facts.some(f => f.id === fact.id);

    try {
      // 2. Optimistic Update (Update the base facts list)
      const factWithTimestamps = {
        ...fact,
        updatedAt: Date.now(),
        createdAt: fact.createdAt || Date.now()
      };

      setFacts(prev => {
        const index = prev.findIndex(f => f.id === fact.id);
        if (index !== -1) {
          const newFacts = [...prev];
          newFacts[index] = factWithTimestamps;
          return newFacts;
        }
        return [factWithTimestamps, ...prev];
      });

      const batch = writeBatch(db);

      // 3. Save Fact Document directly to Firestore
      const factRef = doc(db, 'facts', fact.id);
      batch.set(factRef, factWithTimestamps, { merge: true });

      // 4. Create Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: isNew ? 'CREATE_FACT_CLIENT' : 'UPDATE_FACT_CLIENT',
        targetType: 'FACT',
        targetId: fact.id,
        reason: 'Manual Fact Update (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success(isNew ? 'New fact added to database' : 'Fact updated successfully');
      return true;
    } catch (err: any) {
      // Rollback on protocol failure
      setFacts(snapshot);
      toast.error(`Save failure: ${err.message}`);
      return false;
    }
  };

  const removeFact = async (id: string) => {
    if (!window.confirm('Delete this fact?')) return;
    if (!db || !adminUser) {
      toast.error('Security protocol not initialized');
      return;
    }

    const snapshot = [...facts];
    setFacts(prev => prev.filter(f => f.id !== id));

    try {
      const batch = writeBatch(db);

      // A. Delete Fact
      batch.delete(doc(db, 'facts', id));

      // B. Create Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'DELETE_FACT_CLIENT',
        targetType: 'FACT',
        targetId: id,
        reason: 'Manual fact removal (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Fact removed from database');
    } catch (err: any) {
      setFacts(snapshot);
      toast.error(`Removal failed: ${err.message}`);
    }
  };

  const exportFacts = (format: 'json' | 'csv') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `brainbites_facts_${timestamp}`;

      let content = '';
      let type = '';

      if (format === 'json') {
        content = JSON.stringify(facts, null, 2);
        type = 'application/json';
      } else {
        // Simple CSV conversion
        const headers = ['id', 'fact', 'category', 'readTimeMinutes', 'isPublished', 'isFeatured'];
        const rows = facts.map(f => [
          f.id,
          `"${(f.fact || '').replace(/"/g, '""')}"`,
          f.category,
          f.readTimeMinutes,
          f.isPublished,
          f.isFeatured
        ].join(','));
        content = [headers.join(','), ...rows].join('\n');
        type = 'text/csv';
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Facts exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const filteredFacts = facts.filter(f => {
    const factText = f.fact || '';
    const factId = f.id || '';
    const matchesSearch = factText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return {
    facts: filteredFacts,
    allFacts: facts,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    saveFact,
    removeFact,
    exportFacts,
    refresh: loadFacts
  };
};
