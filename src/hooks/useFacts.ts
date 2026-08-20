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

  const exportFacts = (format: 'json' | 'csv') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `brainbites_sequences_${timestamp}`;

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

      toast.success(`Repository snapshot exported as ${format.toUpperCase()}`);
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
