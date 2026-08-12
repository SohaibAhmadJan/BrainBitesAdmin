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
import { fetchCollections, createOrUpdateCollection, deleteCollection } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

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
      factIds: []
    };
    try {
      await createOrUpdateCollection(newCol);
      setCollections([newCol, ...collections]);
      toast.success('Collection initialized');
    } catch (err) {
      toast.error('Initialization failed');
    }
  };

  const filteredCollections = collections.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-brand-white tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Library className="text-brand-primary" size={32} />
             </div>
             Curated Collections
          </h2>
          <p className="text-brand-secondary/40 text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Hand-Picked Fact Groupings • Narrative Orchestration</p>
        </div>

        <div className="flex items-center gap-6 w-full xl:w-auto relative z-10">
          <div className="relative flex-1 xl:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search collections..."
              className="w-full bg-brand-bg/40 border border-brand-sage/20 rounded-2xl pl-12 pr-6 py-4 text-sm text-brand-white focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddCollection}
            className="flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/30 text-xs uppercase tracking-widest whitespace-nowrap"
          >
            <Plus size={20} strokeWidth={3} />
            New Collection
          </motion.button>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
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
                          await deleteCollection(col.id);
                          setCollections(prev => prev.filter(c => c.id !== col.id));
                          toast.success('Collection dissolved');
                        } catch (err) {
                          toast.error('Dissolution failed');
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
