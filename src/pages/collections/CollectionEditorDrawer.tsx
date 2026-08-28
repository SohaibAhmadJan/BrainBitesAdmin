import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Info,
  FileText,
  Palette,
  Layers,
  Search,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CollectionSet, BiteItem } from '../../types';
import { cn } from '../../utils/cn';
import { fetchBites } from '../../services/firestoreService';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ElasticButton from '../../components/ui/ElasticButton';
import StatusLight from '../../components/ui/StatusLight';
import toast from 'react-hot-toast';

interface CollectionEditorDrawerProps {
  collection: CollectionSet | null;
  onClose: () => void;
  onSave: (col: CollectionSet) => void;
}

const CollectionEditorDrawer: React.FC<CollectionEditorDrawerProps> = ({ collection, onClose, onSave }) => {
  const { theme } = useTheme();
  const [allFacts, setAllFacts] = useState<BiteItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CollectionSet>({
    id: collection?.id || `col-${Date.now()}`,
    title: collection?.title || '',
    description: collection?.description || '',
    icon: collection?.icon || '✨',
    color: collection?.color || '#2D6A4F',
    factIds: collection?.factIds || [],
    isPublished: collection?.isPublished ?? true,
    createdAt: collection?.createdAt || Date.now()
  });

  useEffect(() => {
    loadFacts();
  }, []);

  const loadFacts = async () => {
    try {
      const data = await fetchBites();
      setAllFacts(data);
    } catch (err) {
      console.error(err);
      toast.error('Fact synchronization failed');
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Collection identity is required";
    if (!formData.description.trim()) newErrors.description = "Narrative scope is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSyncing(true);
      try {
        await onSave(formData);
        onClose();
      } catch (err) {
        toast.error("Save protocol failed");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const toggleFact = (factId: string) => {
    setFormData(prev => ({
      ...prev,
      factIds: prev.factIds.includes(factId)
        ? prev.factIds.filter(id => id !== factId)
        : [...prev.factIds, factId]
    }));
  };

  const filteredFacts = allFacts.filter(f =>
    f.fact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <div className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-black/60 backdrop-blur-xl p-0">
      <motion.div
        {...DRAWER_TRANSITION}
        className={cn(
          "w-full h-full flex flex-col overflow-hidden border-[16px] relative rounded-[4.5rem] transition-colors duration-700",
          theme === 'dark'
            ? "bg-brand-bg border-brand-primary/60 shadow-[inset_0_0_150px_rgba(45,106,79,0.5)]"
            : "bg-[#F4F8F6] border-brand-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-6 flex items-center justify-between backdrop-blur-3xl sticky top-0 z-50 transition-colors duration-500",
          theme === 'dark' ? "bg-brand-surface/90" : "bg-white/95 shadow-sm"
        )}>
          <AnimatePresence>
            {isSyncing && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                className="absolute top-0 left-0 right-0 h-1 bg-brand-primary z-[100] origin-left shadow-[0_0_20px_rgba(45,106,79,0.8)]"
              />
            )}
          </AnimatePresence>
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={cn(
                "p-4 glass rounded-2xl transition-all shadow-xl",
                theme === 'dark' ? "text-sub hover:text-brand-primary border-brand-sage/10" : "text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20"
              )}
            >
              <X size={28} />
            </motion.button>
            <div>
              <h2 className={cn("text-4xl font-black tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-brand-primary")}>
                {collection ? 'Edit Collection' : 'New Collection'}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <StatusLight />
                 <p className={cn("text-xs font-black uppercase tracking-[0.4em] opacity-40", theme === 'dark' ? "text-sub" : "text-brand-primary")}>
                   {formData.id} • Root Protocol
                 </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <ElasticButton onClick={handleSave} disabled={isSyncing} className="px-16 py-5 rounded-2xl text-base shadow-[0_0_30px_rgba(45,106,79,0.4)]">
               {isSyncing ? "Saving..." : "Save Collection"}
             </ElasticButton>
          </div>
        </div>

        {/* Content Body (Compressed to 2 Columns) */}
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
          <div className={cn("flex w-full h-full min-h-0 divide-x-2 justify-center", theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10")}>

            {/* Column 1: Identity \u0026 Description */}
            <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
              <section className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="flex items-center gap-3 text-brand-primary font-black">
                  <div className="p-2 bg-brand-primary/10 rounded-lg"><Info size={18} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Identity \u0026 Scope</h3>
                </div>
                <div className={cn("p-8 rounded-[3.5rem] flex-1 flex flex-col justify-start space-y-6 border-4 relative overflow-hidden transition-all duration-500 group/tile", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>

                  <div className="grid grid-cols-12 gap-6 relative z-10">
                     <div className="col-span-4 space-y-2">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Token</label>
                        <input className={cn("w-full border-2 rounded-2xl px-4 py-3 text-4xl text-center focus:outline-none transition-all", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")} value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                     </div>
                     <div className="col-span-8 space-y-2">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Title</label>
                        <input className={cn("w-full border-2 rounded-[1.5rem] px-6 py-4 text-2xl font-black tracking-tighter focus:outline-none transition-all", errors.title ? "border-red-500/50" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Science of Sleep" />
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Description</label>
                    <textarea className={cn("w-full h-32 border-2 rounded-2xl p-6 text-sm font-medium leading-relaxed italic resize-none focus:outline-none transition-all", errors.description ? "border-red-500/50" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Define the core mission of this collection..." />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Color Theme</label>
                       <div className={cn("flex gap-4 items-center p-3 rounded-2xl border-2 transition-all shadow-inner", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20")}>
                          <input type="color" className="w-8 h-8 bg-transparent border-none cursor-pointer rounded-xl" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                          <span className="text-xs font-mono font-black text-brand-primary uppercase tracking-widest">{formData.color}</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Status</label>
                      <button
                          onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                          className={cn("w-full py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3", formData.isPublished ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-sub opacity-40")}
                      >
                          <div className={cn("w-2.5 h-2.5 rounded-full", formData.isPublished ? "bg-brand-primary animate-pulse" : "bg-sub")} />
                          {formData.isPublished ? "Active" : "Draft"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Column 2: Sequence Matrix (Fact Selection) */}
            <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
              <section className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="flex items-center gap-3 text-brand-primary font-black">
                  <div className="p-2 bg-brand-primary/10 rounded-lg"><Layers size={18} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Fact Selection</h3>
                </div>

                <div className={cn("rounded-[3.5rem] border-4 shadow-2xl overflow-hidden flex flex-col flex-1 transition-all relative", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10")}>

                  <div className="p-6 border-b border-brand-sage/10 bg-black/5">
                    <div className="relative group">
                       <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-brand-primary transition-colors" />
                       <input
                        className={cn("w-full border-2 rounded-xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20")}
                        placeholder="Filter available facts..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                       />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    <div className="space-y-2">
                      {filteredFacts.map(fact => {
                        const isSelected = formData.factIds.includes(fact.id);
                        return (
                          <button
                            key={fact.id}
                            onClick={() => toggleFact(fact.id)}
                            className={cn(
                              "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 group/item",
                              isSelected
                                ? "bg-brand-primary/10 border-brand-primary/30"
                                : "hover:bg-brand-primary/5 border-brand-primary/5"
                            )}
                          >
                             <div className={cn("mt-0.5 w-4 h-4 rounded-lg border-2 flex items-center justify-center transition-all", isSelected ? "bg-brand-primary border-brand-primary" : "border-brand-primary/20 group-hover/item:border-brand-primary/40")}>
                                {isSelected && <Plus size={10} className="text-white rotate-45" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className={cn("text-xs font-bold leading-normal", isSelected ? "text-brand-primary" : "text-sub opacity-90")}>
                                   {fact.fact}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{fact.category}</span>
                                   <span className="text-[9px] font-mono opacity-30">#{fact.id}</span>
                                </div>
                             </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-6 bg-brand-primary/5 border-t border-brand-sage/10 flex items-center justify-between">
                     <div>
                       <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.3em]">Selected</p>
                       <p className="text-xl font-black text-brand-primary tabular-nums">{formData.factIds.length}</p>
                     </div>
                     <BookOpen size={20} className="text-brand-primary opacity-20" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
  return createPortal(content, document.body);
};

export default CollectionEditorDrawer;
