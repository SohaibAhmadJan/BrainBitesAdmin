import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Info, Edit3, Lightbulb, AlertCircle, Hash, CheckCircle2, ChevronDown
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { BiteItem, Category } from '../../types';
import { cn } from '../../utils/cn';
import { fetchCategories } from '../../services/firestoreService';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ElasticButton from '../../components/ui/ElasticButton';
import StatusLight from '../../components/ui/StatusLight';
import toast from 'react-hot-toast';

interface FactEditorDrawerProps {
  fact: BiteItem | null;
  defaultCategory?: string;
  onClose: () => void;
  onSave: (fact: BiteItem) => void;
}

const FactEditorDrawer: React.FC<FactEditorDrawerProps> = ({ fact, defaultCategory, onClose, onSave }) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<BiteItem>({
    id: fact?.id || '',
    fact: fact?.fact || '',
    category: fact?.category || (defaultCategory && defaultCategory !== 'All' ? defaultCategory : ''),
    categoryId: fact?.categoryId || '',
    title: fact?.title || null,
    snippet: fact?.snippet || null,
    fullFact: fact?.fullFact || '',
    whyItMatters: fact?.whyItMatters || null,
    readTimeMinutes: fact?.readTimeMinutes || 1,
    imageUrl: fact?.imageUrl || null,
    keywords: fact?.keywords || null,
    isPublished: fact?.isPublished ?? true,
    isFeatured: fact?.isFeatured ?? false,
    createdAt: fact?.createdAt || Date.now(),
    updatedAt: fact?.updatedAt || Date.now()
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isIdInUse, setIsIdInUse] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);

  useEffect(() => {
    loadCategories();

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time ID Uniqueness Check
  useEffect(() => {
    if (!fact && formData.id.trim() && db) {
      const timer = setTimeout(async () => {
        setIsCheckingId(true);
        try {
          const docRef = doc(db, 'facts', formData.id.trim());
          const docSnap = await getDoc(docRef);
          setIsIdInUse(docSnap.exists());
        } catch (err) {
          console.error("ID uniqueness check failed", err);
        } finally {
          setIsCheckingId(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsIdInUse(false);
    }
  }, [formData.id, fact]);

  const loadCategories = async () => {
    const data = await fetchCategories();
    // Deduplicate categories by name
    const unique = Array.from(new Map(data.map(item => [item.name, item])).values());
    setCategories(unique);

    // Set categoryId if a default category was provided
    if (!fact && defaultCategory && defaultCategory !== 'All') {
        const catObj = unique.find(c => c.name === defaultCategory);
        if (catObj) {
            setFormData(prev => ({ ...prev, categoryId: catObj.id }));
        }
    } else if (fact) {
        const catObj = unique.find(c => c.name === fact.category);
        if (catObj) setFormData(prev => ({ ...prev, categoryId: catObj.id }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = "Fact ID is required";
    if (isIdInUse) newErrors.id = "This ID already exists in the database";
    if (!formData.fact.trim()) newErrors.fact = "Short summary is required";
    if (formData.fact.length > 120) newErrors.fact = "Fact summary too long";
    if (!formData.category) newErrors.category = "Please select a category";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSyncing(true);
      try {
        const dataToSave: BiteItem = {
          ...formData,
          id: formData.id.trim(),
          fact: formData.fact.trim(),
          fullFact: formData.fullFact?.trim() || ''
        };

        await onSave(dataToSave);
        onClose();
      } catch (err) {
        toast.error("Save failed");
      } finally {
        setIsSyncing(false);
      }
    }
  };

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
                {fact ? 'Edit Fact' : 'New Fact'}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <StatusLight />
                 <p className={cn("text-xs font-black uppercase tracking-[0.4em]", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary")}>
                   Content Management System
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <ElasticButton
                onClick={handleSave}
                disabled={isSyncing || isCheckingId || isIdInUse}
                className="px-16 py-5 rounded-2xl text-base shadow-[0_0_30px_rgba(45,106,79,0.4)]"
             >
               {isSyncing ? "Saving..." : "Save Changes"}
             </ElasticButton>
          </div>
        </div>

        {/* Matrix View */}
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
              <div className={cn("flex w-full h-full min-h-0 divide-x-2 justify-center", theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10")}>

                {/* Column 1: Fact Basics */}
                <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
                   <section className="flex-1 flex flex-col space-y-2 min-h-0">
                      <div className="flex items-center gap-3 text-brand-primary font-black">
                        <div className="p-2 bg-brand-primary/10 rounded-lg"><Info size={18} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Fact Basics</h3>
                      </div>
                      <div className={cn("p-6 rounded-[3.5rem] flex-1 flex flex-col justify-start space-y-4 border-4 relative overflow-hidden transition-all duration-500 group/tile", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>

                        {/* ID Input Section */}
                        <div className="space-y-2">
                           <div className="flex justify-between items-center ml-2">
                             <label className={cn("text-[10px] font-black uppercase tracking-[0.3em]", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Fact Identifier (Primary Key)</label>
                             {isCheckingId && <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />}
                             {!isCheckingId && formData.id && !isIdInUse && !fact && <CheckCircle2 size={14} className="text-brand-primary" />}
                           </div>
                           <div className="relative">
                               <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/30" size={18} />
                               <input
                                className={cn(
                                    "w-full border-2 rounded-2xl pl-14 pr-8 py-3 text-sm font-mono font-bold focus:outline-none transition-all",
                                    errors.id || isIdInUse ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50",
                                    fact ? "opacity-50 cursor-not-allowed bg-brand-bg/5" : "",
                                    theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                                )}
                                placeholder="Enter unique ID (e.g. 101, brain-01)..."
                                value={formData.id}
                                onChange={(e) => setFormData({...formData, id: e.target.value})}
                                disabled={!!fact}
                               />
                           </div>
                           {errors.id && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4 animate-bounce"><AlertCircle size={14} /> {errors.id}</p>}
                           {isIdInUse && !fact && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4 animate-pulse"><AlertCircle size={14} /> Security Alert: ID already exists in repository</p>}
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center ml-2">
                             <label className={cn("text-[10px] font-black uppercase tracking-[0.3em]", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Short Fact Summary</label>
                             <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30", formData.fact.length > 100 ? "text-brand-gold opacity-100" : "")}>
                               {formData.fact.length} / 120 Units
                             </span>
                           </div>
                           <textarea
                            className={cn("w-full border-2 rounded-[2rem] pl-8 pr-12 py-4 text-lg font-black tracking-tighter focus:outline-none transition-all resize-none scrollbar-thin", errors.fact ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}
                            rows={3}
                            placeholder="Type the core insight summary here..."
                            value={formData.fact}
                            onChange={(e) => setFormData({...formData, fact: e.target.value})}
                           />
                           {errors.fact && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4"><AlertCircle size={14} /> {errors.fact}</p>}
                        </div>

                        {/* High-Fidelity Custom Dropdown */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                           <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Category Assignment</label>

                           <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={cn(
                                "w-full border-2 rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all shadow-inner",
                                errors.category ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50",
                                theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                            )}
                           >
                            <span className={cn(!formData.category && "opacity-40")}>
                                {formData.category || "-- Select Target Category --"}
                            </span>
                            <ChevronDown className={cn("transition-transform duration-300", isDropdownOpen && "rotate-180")} size={16} />
                           </button>

                           <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={cn(
                                        "absolute left-0 right-0 bottom-full mb-4 z-[110] rounded-3xl border-2 shadow-2xl overflow-hidden backdrop-blur-3xl max-h-[300px] overflow-y-auto scrollbar-thin",
                                        theme === 'dark' ? "bg-brand-surface/95 border-brand-primary/30" : "bg-white/95 border-brand-primary/20"
                                    )}
                                >
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, category: cat.name, categoryId: cat.id });
                                                setIsDropdownOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group",
                                                formData.categoryId === cat.id
                                                    ? "bg-brand-primary text-white"
                                                    : theme === 'dark' ? "text-brand-white/60 hover:bg-brand-primary/10 hover:text-brand-primary" : "text-brand-primary/60 hover:bg-brand-primary/5 hover:text-brand-primary"
                                            )}
                                        >
                                            {cat.name}
                                            {formData.categoryId === cat.id && <CheckCircle2 size={14} />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                           </AnimatePresence>

                           {errors.category && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4"><AlertCircle size={14} /> {errors.category}</p>}
                        </div>

                        {/* Publication Status Toggle */}
                        <div className="space-y-2">
                           <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Publication Protocol</label>
                           <button
                            type="button"
                            onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                            className={cn(
                                "w-full py-4 rounded-2xl border-2 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3",
                                formData.isPublished
                                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-lg"
                                    : "bg-brand-primary/5 border-brand-primary/10 text-sub opacity-40"
                            )}
                           >
                            <div className={cn("w-2.5 h-2.5 rounded-full", formData.isPublished ? "bg-brand-primary animate-pulse" : "bg-sub")} />
                            {formData.isPublished ? "Active" : "Draft"}
                           </button>
                        </div>
                      </div>
                   </section>
                </div>

                {/* Column 2: Detailed Explanation */}
                <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
                   <section className="flex-1 flex flex-col space-y-2 min-h-0">
                      <div className="flex items-center gap-3 text-brand-gold font-black">
                        <div className="p-2 bg-brand-gold/10 rounded-lg"><Lightbulb size={18} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Explanation \u0026 Insights</h3>
                      </div>
                      <div className={cn("p-8 rounded-[4rem] flex-1 flex flex-col border-4 transition-all duration-500 min-h-0 group/tile relative overflow-hidden", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>
                         <div className="flex-1 flex flex-col space-y-2">
                            <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-4", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Detailed Fact Content</label>
                            <textarea
                              className={cn("w-full flex-1 border-2 rounded-[2.5rem] p-6 text-sm font-medium leading-relaxed italic resize-none focus:outline-none transition-all", theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}
                              value={formData.fullFact || ''}
                              onChange={(e) => setFormData({...formData, fullFact: e.target.value})}
                              placeholder="Elaborate on the scientific background or provide extra context..."
                            />
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

export default FactEditorDrawer;
