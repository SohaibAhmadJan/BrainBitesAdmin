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
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
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
    removeFact,
    exportFacts
  } = useFacts();

  const [searchParams] = useSearchParams();
  const { categories } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFact, setSelectedFact] = useState<BiteItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportFacts('json');
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-3xl font-bold tracking-tight uppercase"
           >
             Facts Database
           </motion.h1>
        </div>
        <div className="flex gap-3">
           <ElasticButton
             variant="secondary"
             onClick={handleExport}
             disabled={isExporting}
             className="px-6 py-2.5 rounded-xl text-xs"
           >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <Download size={16} />
                  Export
                </>
              )}
           </ElasticButton>
           <ElasticButton onClick={handleAddNew} className="px-6 py-2.5 rounded-xl text-xs">
              <Plus size={16} />
              Add Fact
           </ElasticButton>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="glass p-4 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={18} />
            <input
              type="text"
              placeholder="Search facts..."
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-xl pl-12 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-64 group">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-sub opacity-30 pointer-events-none" size={16} />
             <select
                className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-xl pl-10 pr-8 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Domains</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 glass rounded-2xl animate-pulse" />
          ))
        ) : currentItems.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {currentItems.map((fact, idx) => (
              <motion.div key={fact.id} layout>
                <PremiumCard
                  layoutId={fact.id}
                  onClick={() => handleEdit(fact)}
                  className="p-6 flex flex-col h-full rounded-2xl border-transparent hover:border-brand-primary/20"
                >
                  <div className="flex justify-between items-start mb-6">
                     <ActionBadge variant="success" className="font-bold text-[9px] uppercase">{fact.category}</ActionBadge>
                     <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-mono text-sub opacity-50 font-bold uppercase">ID: {fact.id.slice(0, 8)}</span>
                        <ActionBadge variant={fact.isPublished ? 'success' : 'warning'} className="font-bold text-[9px] uppercase">
                            {fact.isPublished ? 'Live' : 'Draft'}
                        </ActionBadge>
                        <div className="flex gap-1.5 mt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(fact); }}
                              className="p-1.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-lg border border-brand-sage/10 transition-all"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFact(fact.id); }}
                              className="p-1.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-lg border border-brand-sage/10 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 space-y-4">
                     <div className="flex gap-4">
                        <div className="w-10 h-10 shrink-0 bg-brand-bg/5 dark:bg-brand-bg rounded-xl flex items-center justify-center text-brand-primary/40 border border-brand-sage/10">
                           <BookOpen size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-bold leading-tight line-clamp-4 group-hover:text-brand-white transition-colors duration-300">
                            {fact.fact}
                          </p>
                        </div>
                     </div>
                     <p className="text-xs text-sub font-medium line-clamp-2 leading-relaxed border-l-2 border-brand-primary/20 pl-4 opacity-70">
                       {fact.fullFact || 'No supplementary data...'}
                     </p>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <EmptyBuffer
            icon={BookOpen}
            title="No matches found"
            message="No results matching your query."
          />
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center glass p-6 rounded-2xl border border-brand-sage/10 gap-6 shadow-lg relative overflow-hidden">
        <p className="text-xs font-bold text-sub uppercase tracking-widest opacity-40">
          Showing <span className="text-brand-primary">{ (currentPage - 1) * itemsPerPage + 1 } - { Math.min(currentPage * itemsPerPage, facts.length) }</span> of <span className="text-brand-primary">{ facts.length }</span>
        </p>
        <div className="flex items-center gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2.5 rounded-xl glass border border-brand-sage/20 text-sub hover:text-brand-primary disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-10 h-10 rounded-xl text-xs font-bold transition-all border",
                  currentPage === i + 1
                    ? "bg-brand-primary border-brand-primary/30 text-brand-white"
                    : "glass border-brand-sage/20 text-sub hover:text-brand-primary"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2.5 rounded-xl glass border border-brand-sage/20 text-sub hover:text-brand-primary disabled:opacity-20 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Morph Editor Drawer */}
      <AnimatePresence>
        {isEditorOpen && (
          <FactEditorDrawer
            fact={selectedFact}
            defaultCategory={categoryFilter === 'All' ? '' : categoryFilter}
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
