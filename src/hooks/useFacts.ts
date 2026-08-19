import { useState, useEffect } from 'react';
import { BiteItem } from '../types';
import { fetchBites } from '../services/firestoreService';
import { updateFact, deleteFact } from '../services/adminApi';
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
      await updateFact(fact.id, fact, 'UI Update via Sequence Editor');
      toast.success('Sequence anchored to Cloud (Atomic)');
      await loadFacts();
      return true;
    } catch (err: any) {
      toast.error(`Sync failure: ${err.message}`);
      return false;
    }
  };

  const removeFact = async (id: string) => {
    if (!window.confirm('Erase this sequence node?')) return;
    try {
      await deleteFact(id, 'Manual expunge from repository');
      toast.success('Node expunged');
      await loadFacts();
    } catch (err: any) {
      toast.error(`Expunge failed: ${err.message}`);
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
