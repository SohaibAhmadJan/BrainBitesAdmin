import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BiteItem, BiteCategory, BiteCategories } from '../../types';
import { fetchBites, createOrUpdateBite, deleteBite } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import FactEditorDrawer from './FactEditorDrawer';
import { useTheme } from '../../context/ThemeContext';

const FactsPage = () => {
  const { theme } = useTheme();
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BiteCategory | 'All'>('All');
  const [selectedFacts, setSelectedFacts] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFact, setEditingFact] = useState<BiteItem | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadFacts();
  }, []);

  const loadFacts = async () => {
    setLoading(true);
    try {
      const data = await fetchBites();
      setFacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacts = facts.filter(fact => {
    const matchesSearch = fact.fact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fact.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || fact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredFacts.length / itemsPerPage);
  const currentItems = filteredFacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedFacts.length === currentItems.length) {
      setSelectedFacts([]);
    } else {
      setSelectedFacts(currentItems.map(f => f.id));
    }
  };

  const toggleSelectFact = (id: string) => {
    setSelectedFacts(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleEdit = (fact: BiteItem) => {
    setEditingFact(fact);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingFact(null);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Confirm permanent deletion from repository?')) {
      try {
        await deleteBite(id);
        setFacts(prev => prev.filter(f => f.id !== id));
        toast.success('Sequence deleted');
      } catch (err) {
        toast.error('Deletion failed');
      }
    }
  };

  const handleSaveFact = async (fact: BiteItem) => {
    try {
      await createOrUpdateBite(fact);
      setFacts(prev => {
        const index = prev.findIndex(f => f.id === fact.id);
        if (index >= 0) {
          const newFacts = [...prev];
          newFacts[index] = fact;
          return newFacts;
        } else {
          return [fact, ...prev];
        }
      });
      setIsEditorOpen(false);
      toast.success('Cloud sync complete');
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Dynamic Command Center */}
      <div className="glass p-6 rounded-[2.5rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="relative flex-1 md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/40 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search sequences..."
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64 group">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/40 group-focus-within:text-brand-primary pointer-events-none" size={18} />
             <select
                className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl pl-12 pr-10 py-3.5 text-xs font-black focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
              >
                <option value="All">All Domains</option>
                {BiteCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-brand-bg/5 dark:bg-brand-surface text-brand-secondary hover:text-brand-primary rounded-2xl border border-brand-sage/10 hover:border-brand-primary/30 transition-all shadow-lg"
          >
            <Download size={22} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNew}
            className="flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 active:scale-95 text-xs uppercase tracking-[0.2em]"
          >
            <Plus size={20} strokeWidth={3} />
            Commit New Fact
          </motion.button>
        </div>
      </div>

      {/* Grid Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 glass rounded-[2.5rem] animate-pulse" />
          ))
        ) : currentItems.length > 0 ? (
          <AnimatePresence>
            {currentItems.map((fact, idx) => (
              <motion.div
                key={fact.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="glass rounded-[2.5rem] p-8 shadow-xl group border-transparent hover:border-brand-primary/20 transition-all relative overflow-hidden flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[9px] font-black text-brand-primary uppercase tracking-widest">
                     {fact.category}
                   </div>
                   <span className="text-[10px] font-mono text-sub font-black opacity-40">#{fact.id.slice(0, 6)}</span>
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 shrink-0 bg-brand-bg/5 dark:bg-brand-bg rounded-xl flex items-center justify-center text-brand-primary/40 group-hover:text-brand-primary transition-colors border border-brand-sage/10">
                         <BookOpen size={20} />
                      </div>
                      <p className="text-sm font-bold leading-relaxed line-clamp-4 italic group-hover:text-brand-primary transition-colors">
                        "{fact.fact}"
                      </p>
                   </div>
                   <p className="text-[10px] text-sub font-medium line-clamp-2 leading-relaxed border-l-2 border-brand-primary/20 pl-4">
                     {fact.fullFact || 'Supplementary analysis pending...'}
                   </p>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-sage/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-sub uppercase tracking-widest opacity-60">{fact.readTimeMinutes || 2}m Read</span>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleEdit(fact)}
                        className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg hover:bg-brand-primary/10 text-sub hover:text-brand-primary rounded-xl transition-all border border-brand-sage/10"
                      >
                        <Edit3 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(fact.id)}
                        className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg hover:bg-red-500/10 text-sub hover:text-red-500 rounded-xl transition-all border border-brand-sage/10"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                   </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-brand-primary/5 blur-3xl rounded-full group-hover:bg-brand-primary/10 transition-all" />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-40 text-center flex flex-col items-center gap-6 opacity-20">
             <XCircle size={80} className="text-brand-primary" />
             <p className="text-2xl font-black uppercase tracking-[0.3em]">No sequences matched the current filters</p>
          </div>
        )}
      </div>

      {/* Modern Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-brand-bg/5 dark:bg-brand-surface/40 p-8 rounded-[2.5rem] border border-brand-sage/5 dark:border-brand-sage/20 gap-6">
        <p className="text-xs font-black text-sub uppercase tracking-widest opacity-60">
          Displaying sequence <span className="text-brand-primary">{(currentPage - 1) * itemsPerPage + 1}</span> — <span className="text-brand-primary">{Math.min(currentPage * itemsPerPage, filteredFacts.length)}</span> of <span className="text-brand-primary">{filteredFacts.length}</span>
        </p>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ x: -3 }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 rounded-xl bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/10 text-sub hover:text-brand-primary disabled:opacity-20 transition-all shadow-xl"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -2 }}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-11 h-11 rounded-xl text-xs font-black transition-all border shadow-lg",
                  currentPage === i + 1
                    ? "bg-brand-primary border-brand-primary/30 text-brand-white"
                    : "bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/10 text-sub hover:text-brand-primary"
                )}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ x: 3 }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 rounded-xl bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/10 text-sub hover:text-brand-primary disabled:opacity-20 transition-all shadow-xl"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>

      {/* Editor Component */}
      {isEditorOpen && (
        <FactEditorDrawer
          fact={editingFact}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveFact}
        />
      )}
    </div>
  );
};

export default FactsPage;
