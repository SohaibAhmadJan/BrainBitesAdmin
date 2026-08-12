import { useState, useEffect } from 'react';
import { BiteItem } from '../types';
import { fetchBites, createOrUpdateBite, deleteBite, createAuditLog } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const useFacts = () => {
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
      toast.error('Fact stream synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const saveFact = async (fact: BiteItem) => {
    try {
      await createOrUpdateBite(fact);
      await createAuditLog({
        adminEmail: 'master@brainbites.com',
        action: 'UPDATE_BITE',
        details: `Synchronized node: ${fact.id}`
      });
      toast.success('Sequence anchored to Cloud');
      await loadFacts();
      return true;
    } catch (err) {
      toast.error('Sync failure');
      return false;
    }
  };

  const removeFact = async (id: string) => {
    if (!window.confirm('Erase this sequence node?')) return;
    try {
      await deleteBite(id);
      await createAuditLog({
        adminEmail: 'master@brainbites.com',
        action: 'DELETE_BITE',
        details: `Expunged node: ${id}`
      });
      toast.success('Node expunged');
      await loadFacts();
    } catch (err) {
      toast.error('Expunge failed');
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
    refresh: loadFacts
  };
};
