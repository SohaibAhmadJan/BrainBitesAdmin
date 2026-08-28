import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  BookOpen,
  Layers
} from 'lucide-react';
import { CollectionSet } from '../../types';
import { cn } from '../../utils/cn';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import { useCollections } from '../../hooks/useCollections';
import CollectionEditorDrawer from './CollectionEditorDrawer';
import PremiumCard from '../../components/ui/PremiumCard';

const CollectionsPage = () => {
  const {
    collections: filteredCollections,
    allCollections,
    loading,
    searchTerm,
    setSearchTerm,
    saveCollection,
    removeCollection
  } = useCollections();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionSet | null>(null);

  const handleEdit = (col: CollectionSet | null = null) => {
    setSelectedCollection(col);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black tracking-tighter uppercase"
           >
             Curated <span className="text-brand-primary">Collections</span>
           </motion.h1>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={() => handleEdit(null)}>
              <Plus size={18} strokeWidth={3} />
              New Collection
           </ElasticButton>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search custom collections by identity or content..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 glass rounded-[3rem] animate-pulse" />
          ))
        ) : filteredCollections.length === 0 ? (
          <div className="col-span-full py-40 glass rounded-[3rem] border border-dashed border-brand-sage/20 text-center space-y-4">
             <Layers size={64} className="mx-auto text-brand-secondary/10" />
             <p className="text-xl font-black text-brand-secondary/20 uppercase tracking-widest">No custom collections defined</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredCollections.map((col, idx) => (
              <motion.div
                key={col.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="flex flex-col"
              >
                <PremiumCard
                    glowColor={`${col.color}22`}
                    className="p-10 flex flex-col h-full border-transparent hover:border-brand-primary/20 overflow-hidden"
                    onClick={() => handleEdit(col)}
                >
                    {/* Universal Header Block */}
                    <div className="flex justify-between items-start mb-10">
                       <div className={cn("w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 relative bg-brand-bg/50 border-2 border-brand-sage/20")}>
                          <span className="text-4xl" style={{ textShadow: `0 0 20px ${col.color}44` }}>{col.icon}</span>
                          <div className="absolute inset-0 rounded-[1.8rem] opacity-20 blur-xl" style={{ backgroundColor: col.color }} />
                       </div>

                       <div className="flex flex-col items-end gap-3">
                          <span className="text-[12px] font-mono text-sub opacity-50 font-bold tracking-[0.1em]">UID: {col.id}</span>
                          <ActionBadge variant={col.isPublished ? 'success' : 'warning'} className="font-black text-[11px]">
                             {col.isPublished ? 'Live' : 'Draft'}
                          </ActionBadge>
                          <div className="flex gap-2">
                             <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => { e.stopPropagation(); handleEdit(col); }}
                                className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-xl border border-brand-sage/10 transition-all shadow-md"
                             >
                                <Edit3 size={16} />
                             </motion.button>
                             <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => { e.stopPropagation(); removeCollection(col.id, col.title); }}
                                className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-xl border border-brand-sage/10 transition-all shadow-md"
                             >
                                <Trash2 size={16} />
                             </motion.button>
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-3xl font-black text-brand-white truncate tracking-tighter group-hover:text-brand-primary transition-colors mb-1">{col.title}</h3>

                        <p className="text-brand-secondary/60 text-[15px] font-bold leading-relaxed italic line-clamp-2 mb-10 border-l-4 border-brand-primary/10 pl-6 group-hover:text-brand-white transition-colors duration-500">
                            "{col.description}"
                        </p>
                    </div>

                    {/* Stats & Identifiers */}
                    <div className="flex-1">
                        <div className="flex items-center gap-6 mb-8 px-2">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-brand-secondary/30 uppercase tracking-[0.3em]">Facts Attached</p>
                                <p className="text-2xl font-black text-brand-primary flex items-center gap-2 tabular-nums">
                                    {col.factIds.length} <BookOpen size={16} className="opacity-40" />
                                </p>
                            </div>
                            <div className="w-[1px] h-8 bg-brand-sage/10" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-brand-secondary/30 uppercase tracking-[0.3em]">Theme Spectrum</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-3.5 h-3.5 rounded-full shadow-lg" style={{ backgroundColor: col.color }}></div>
                                    <span className="text-[11px] font-bold text-brand-secondary/50 font-mono uppercase">{col.color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 px-2">
                            {col.factIds.length > 0 ? col.factIds.slice(0, 10).map(id => (
                                <span key={id} className="px-3 py-1 bg-brand-bg/50 border border-brand-sage/20 rounded-lg text-[10px] font-black text-brand-secondary/50 uppercase tracking-tighter">
                                    #{id}
                                </span>
                            )) : (
                                <p className="text-[11px] text-brand-secondary/30 italic">No facts in this collection...</p>
                            )}
                            {col.factIds.length > 10 && (
                                <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-[10px] font-black text-brand-primary uppercase">
                                    +{col.factIds.length - 10} Others
                                </span>
                            )}
                        </div>
                    </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <CollectionEditorDrawer
            collection={selectedCollection}
            onClose={() => setIsEditorOpen(false)}
            onSave={saveCollection}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectionsPage;
