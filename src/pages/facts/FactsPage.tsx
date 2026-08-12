import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useFacts } from '../../hooks/useFacts';
import { useCategories } from '../../hooks/useCategories';
import { BiteItem } from '../../types';
import PremiumCard from '../../components/ui/PremiumCard';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';
import FactEditorDrawer from './FactEditorDrawer';
import { cn } from '../../utils/cn';

const FactsPage = () => {
  const {
    facts,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    saveFact,
    removeFact
  } = useFacts();

  const [searchParams] = useSearchParams();
  const { categories } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFact, setSelectedFact] = useState<BiteItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
  }, [searchParams, setCategoryFilter]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(facts.length / itemsPerPage);
  const currentItems = facts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (fact: BiteItem) => {
    setSelectedFact(fact);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setSelectedFact(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* Search & Action Bar */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="relative flex-1 md:w-[32rem] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={24} />
            <input
              type="text"
              placeholder="Query sequence identifiers or content..."
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-[1.8rem] pl-14 pr-8 py-5 text-base focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-72 group">
             <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 pointer-events-none" size={20} />
             <select
                className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-[1.8rem] pl-14 pr-10 py-5 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Domains</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
          </div>
        </div>

        <div className="flex items-center gap-5 w-full md:w-auto justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-5 glass rounded-[1.5rem] border border-brand-sage/10 text-sub hover:text-brand-primary transition-all shadow-lg"
          >
            <Download size={24} />
          </motion.button>
          <ElasticButton
            onClick={handleAddNew}
            className="px-10 py-5 h-full"
          >
            <Plus size={22} strokeWidth={3} />
            Append Sequence
          </ElasticButton>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 glass rounded-[3.5rem] animate-pulse" />
          ))
        ) : currentItems.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {currentItems.map((fact, idx) => (
              <PremiumCard
                key={fact.id}
                layoutId={fact.id}
                onClick={() => handleEdit(fact)}
                className="p-10 flex flex-col h-full border-transparent hover:border-brand-primary/20"
              >
                <div className="flex justify-between items-start mb-8">
                   <ActionBadge variant="success">{fact.category}</ActionBadge>
                   <span className="text-[10px] font-mono text-sub opacity-30 font-black tracking-widest uppercase">ID: {fact.id.slice(0, 6)}</span>
                </div>

                <div className="flex-1 space-y-6">
                   <div className="flex gap-5">
                      <div className="w-12 h-12 shrink-0 bg-brand-bg/5 dark:bg-brand-bg rounded-2xl flex items-center justify-center text-brand-primary/40 transition-colors border border-brand-sage/10">
                         <BookOpen size={24} />
                      </div>
                      <p className="text-base font-bold leading-relaxed line-clamp-4 italic group-hover:text-brand-primary transition-colors">
                        {fact.fact}
                      </p>
                   </div>
                   <p className="text-[11px] text-sub font-medium line-clamp-2 leading-relaxed border-l-2 border-brand-primary/20 pl-5 opacity-60">
                     {fact.fullFact || 'No supplementary data available...'}
                   </p>
                </div>

                <div className="mt-10 pt-8 border-t border-brand-sage/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(45,106,79,1)]" />
                      <span className="text-[10px] font-black text-sub uppercase tracking-[0.3em] opacity-60">{fact.readTimeMinutes || 2}m Stream</span>
                   </div>
                   <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        onClick={(e) => { e.stopPropagation(); handleEdit(fact); }}
                        className="p-3 glass hover:bg-brand-primary/10 text-sub hover:text-brand-primary rounded-xl transition-all border border-brand-sage/10 shadow-lg"
                      >
                        <Edit3 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        onClick={(e) => { e.stopPropagation(); removeFact(fact.id); }}
                        className="p-3 glass hover:bg-red-500/10 text-sub hover:text-red-500 rounded-xl transition-all border border-brand-sage/10 shadow-lg"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                   </div>
                </div>
              </PremiumCard>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-40 glass rounded-[3.5rem] border border-dashed border-brand-sage/20 text-center flex flex-col items-center gap-8 opacity-40">
             <div className="p-8 bg-brand-primary/5 rounded-full">
                <BookOpen size={80} className="text-brand-primary opacity-20" />
             </div>
             <p className="text-3xl font-black uppercase tracking-[0.4em] tracking-tighter">Zero matches in sequence buffer</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center glass p-10 rounded-[3.5rem] border border-brand-sage/10 gap-8 shadow-2xl relative overflow-hidden">
        <p className="text-sm font-black text-sub uppercase tracking-[0.4em] opacity-40 relative z-10">
          Showing sequence <span className="text-brand-primary">{ (currentPage - 1) * itemsPerPage + 1 }</span> — <span className="text-brand-primary">{ Math.min(currentPage * itemsPerPage, facts.length) }</span> of <span className="text-brand-primary">{ facts.length }</span>
        </p>
        <div className="flex items-center gap-6 relative z-10">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-4 rounded-2xl glass border border-brand-sage/20 text-sub hover:text-brand-primary disabled:opacity-20 transition-all shadow-xl shadow-brand-primary/5"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="flex gap-3">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-14 h-14 rounded-2xl text-sm font-black transition-all border shadow-xl",
                  currentPage === i + 1
                    ? "bg-brand-primary border-brand-primary/30 text-brand-white shadow-[0_15px_30px_rgba(45,106,79,0.3)]"
                    : "glass border-brand-sage/20 text-sub hover:text-brand-primary"
                )}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-4 rounded-2xl glass border border-brand-sage/20 text-sub hover:text-brand-primary disabled:opacity-20 transition-all shadow-xl shadow-brand-primary/5"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />
      </div>

      {/* Morph Editor Drawer */}
      <AnimatePresence>
        {isEditorOpen && (
          <FactEditorDrawer
            fact={selectedFact}
            onClose={() => setIsEditorOpen(false)}
            onSave={async (fact) => {
              const success = await saveFact(fact);
              if (success) setIsEditorOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactsPage;
