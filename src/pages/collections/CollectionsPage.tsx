import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Settings2,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Palette,
  Hash,
  Library,
  BookOpen,
  ArrowRight,
  Layers
} from 'lucide-react';
import { CollectionSet } from '../../types';
import { fetchCollections } from '../../services/firestoreService';
import { updateCollection, deleteCollection as deleteCollectionApi } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';

const CollectionsPage = () => {
  const [collections, setCollections] = useState<CollectionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (err) {
      console.error(err);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollection = async () => {
    const newCol: CollectionSet = {
      id: `col-${Date.now()}`,
      title: 'New Collection',
      description: 'Define the scope and narrative of this custom set...',
      icon: '✨',
      color: '#2D6A4F',
      factIds: [],
      isPublished: true,
      createdAt: Date.now()
    };
    try {
      await updateCollection(newCol.id, newCol, 'Administrative collection initialization');
      toast.success('Collection anchored (Atomic)');
      loadCollections();
    } catch (err: any) {
      toast.error(`Initialization failed: ${err.message}`);
    }
  };

  const filteredCollections = collections.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="info" className="px-5 py-1.5">Narrative Hub</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Hand-Picked Fact Groupings \u0026 Orchestration</p>
           </div>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={handleAddCollection}>
              <Plus size={18} strokeWidth={3} />
              New Collection
           </ElasticButton>
        </div>
      </div>

      {/* Search \u0026 Action Bar */}
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
                className="glass rounded-[3rem] shadow-2xl group border-transparent hover:border-brand-primary/20 transition-all flex flex-col overflow-hidden"
              >
                {/* Header Section */}
                <div className="p-10 flex items-start gap-8">
                   <div
                    className="w-24 h-24 shrink-0 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl relative border-2 border-brand-sage/20 group-hover:scale-110 transition-all duration-500 bg-brand-bg/50"
                    style={{ textShadow: `0 0 20px ${col.color}44` }}
                   >
                     {col.icon}
                     <div
                       className="absolute inset-0 rounded-[1.8rem] opacity-20 blur-xl"
                       style={{ backgroundColor: col.color }}
                     />
                   </div>
                   <div className="flex-1 min-w-0 pt-2">
                      <div className="flex justify-between items-start">
                         <h3 className="text-2xl font-black text-brand-white truncate tracking-tight">{col.title}</h3>
                         <span className="text-[9px] font-mono text-brand-secondary/20 uppercase tracking-widest mt-2">{col.id}</span>
                      </div>
                      <p className="text-brand-secondary/40 text-sm mt-3 font-medium leading-relaxed italic line-clamp-2">{col.description}</p>
                   </div>
                </div>

                {/* Stats & Identifiers */}
                <div className="px-10 pb-10 flex-1">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-brand-secondary/20 uppercase tracking-[0.3em]">Sequence Count</p>
                        <p className="text-xl font-black text-brand-primary flex items-center gap-2">
                           {col.factIds.length} <BookOpen size={14} className="opacity-40" />
                        </p>
                      </div>
                      <div className="w-[1px] h-8 bg-brand-sage/10" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-brand-secondary/20 uppercase tracking-[0.3em]">Theme Spectrum</p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: col.color }}></div>
                           <span className="text-[10px] font-bold text-brand-secondary/40 font-mono uppercase">{col.color}</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                      {col.factIds.length > 0 ? col.factIds.slice(0, 10).map(id => (
                        <span key={id} className="px-3 py-1 bg-brand-bg/50 border border-brand-sage/20 rounded-lg text-[9px] font-black text-brand-secondary/40 uppercase tracking-tighter">
                          #{id}
                        </span>
                      )) : (
                        <p className="text-[10px] text-brand-secondary/20 italic">No sequences attached to this node...</p>
                      )}
                      {col.factIds.length > 10 && (
                        <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-[9px] font-black text-brand-primary uppercase">
                          +{col.factIds.length - 10} Others
                        </span>
                      )}
                   </div>
                </div>

                {/* Interaction Footer */}
                <div className="px-10 py-6 bg-brand-primary/5 border-t border-brand-sage/10 flex items-center justify-between backdrop-blur-xl">
                   <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="p-3 glass hover:bg-brand-bg text-brand-secondary/60 hover:text-brand-white rounded-2xl transition-all border border-brand-sage/20"
                      >
                        <Settings2 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="p-3 glass hover:bg-brand-primary/10 text-brand-secondary/60 hover:text-brand-primary rounded-2xl transition-all border border-brand-sage/20"
                      >
                        <Edit3 size={18} />
                      </motion.button>
                   </div>

                   <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if(window.confirm('Dissolve this collection record?')) {
                        try {
                          await deleteCollectionApi(col.id, 'Manual collection removal');
                          toast.success('Collection dissolved');
                          loadCollections();
                        } catch (err: any) {
                          toast.error(`Dissolution failed: ${err.message}`);
                        }
                      }
                    }}
                    className="p-3 glass text-red-500/40 hover:text-red-500 rounded-2xl transition-all border border-brand-sage/20"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
