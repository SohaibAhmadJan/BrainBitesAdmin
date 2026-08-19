import { useState, useEffect } from 'react';
import { Category } from '../types';
import { fetchCategories } from '../services/firestoreService';
import { updateCategory, deleteCategory } from '../services/adminApi';
import toast from 'react-hot-toast';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      toast.error('Domain sync failure');
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (cat: Partial<Category>) => {
    const fullCat: Category = {
      id: cat.id || cat.name?.toUpperCase().replace(/ /g, '_') || `cat-${Date.now()}`,
      name: cat.name || '',
      description: cat.description || '',
      color: cat.color || '#2D6A4F',
      icon: cat.icon || '🧠',
      vectorIcon: cat.vectorIcon || 'LayoutGrid',
      isActive: cat.isActive ?? true,
      sortOrder: cat.sortOrder ?? 0,
      createdAt: cat.createdAt || Date.now()
    };

    try {
      await updateCategory(fullCat.id, fullCat, 'Administrative domain sync');
      toast.success('Domain record anchored (Atomic)');
      await loadCategories();
      return true;
    } catch (err: any) {
      toast.error(`Handshake failure: ${err.message}`);
      return false;
    }
  };

  const removeCategory = async (id: string, name: string) => {
    if (!window.confirm(`Dissolve ${name} domain?`)) return;
    try {
      // NOTE: We don't have a deleteCategory API yet, but we'll use a generic delete or implement it.
      // For now, I'll use a placeholder or the actual implementation if I added it to adminApi.
      await deleteCategory(id, `Dissolved domain: ${name}`);
      toast.success('Domain expunged');
      await loadCategories();
    } catch (err: any) {
      toast.error(`Expunge failed: ${err.message}`);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return { categories, loading, saveCategory, removeCategory, refresh: loadCategories };
};
