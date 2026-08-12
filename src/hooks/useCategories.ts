import { useState, useEffect } from 'react';
import { Category, CategoryPresets } from '../types';
import { fetchCategories, createOrUpdateCategory, deleteCategory, createAuditLog } from '../services/firestoreService';
import toast from 'react-hot-toast';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      if (data.length === 0) {
        await migrateInitialCategories();
        const migrated = await fetchCategories();
        setCategories(migrated);
      } else {
        setCategories(data);
      }
    } catch (err) {
      toast.error('Domain sync failure');
    } finally {
      setLoading(false);
    }
  };

  const migrateInitialCategories = async () => {
    const batch = CategoryPresets.map(preset => ({
      id: preset.id,
      name: preset.id,
      description: `Official psychological domain for ${preset.name}.`,
      color: preset.color,
      icon: preset.icon,
      createdAt: new Date().toISOString()
    }));
    await Promise.all(batch.map(cat => createOrUpdateCategory(cat)));
  };

  const saveCategory = async (cat: Partial<Category>) => {
    const fullCat: Category = {
      id: cat.id || cat.name?.toLowerCase().replace(/ /g, '-') || `cat-${Date.now()}`,
      name: cat.name || '',
      description: cat.description || '',
      color: cat.color || '#2D6A4F',
      icon: cat.icon || '🧠',
      createdAt: cat.createdAt || new Date().toISOString()
    };

    try {
      await createOrUpdateCategory(fullCat);
      await createAuditLog({
        adminEmail: 'master@brainbites.com',
        action: cat.id ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY',
        details: `${cat.id ? 'Updated' : 'Established'} domain: ${fullCat.name}`
      });
      toast.success('Domain record anchored');
      await loadCategories();
      return true;
    } catch (err) {
      toast.error('Handshake failure');
      return false;
    }
  };

  const removeCategory = async (id: string, name: string) => {
    if (!window.confirm(`Dissolve ${name} domain?`)) return;
    try {
      await deleteCategory(id);
      await createAuditLog({
        adminEmail: 'master@brainbites.com',
        action: 'DELETE_CATEGORY',
        details: `Dissolved domain: ${name}`
      });
      toast.success('Domain expunged');
      await loadCategories();
    } catch (err) {
      toast.error('Expunge failed');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return { categories, loading, saveCategory, removeCategory, refresh: loadCategories };
};
