import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  FileText,
  HelpCircle,
  ArrowRight,
  Trash2,
  Edit3,
  X,
  PieChart,
  Palette,
  Search,
  BookOpen,
  LayoutGrid,
  Puzzle,
  Brain,
  FlaskConical,
  Heart,
  Smile,
  Hand,
  Waves,
  Globe,
  TrendingUp,
  Users,
  Smartphone,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Shield,
  Star,
  Compass,
  Atom,
  Dna,
  Sparkles,
  Lightbulb,
  Activity,
  Eye,
  Languages,
  Map,
  Pin,
  Anchor,
  Award,
  BarChart3,
  ChevronDown,
  Flame,
  Fingerprint,
  Ghost,
  Stethoscope,
  Infinity,
  Trophy,
  Coffee,
  Music,
  Camera,
  Hash
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { useCategories } from '../../hooks/useCategories';
import { useFacts } from '../../hooks/useFacts';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useTheme } from '../../context/ThemeContext';
import { Category } from '../../types';
import { cn } from '../../utils/cn';
import { DRAWER_TRANSITION } from '../../utils/animations';
import PremiumCard from '../../components/ui/PremiumCard';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import StatusLight from '../../components/ui/StatusLight';

const IconMap: Record<string, React.ElementType> = {
  'Users': Users,
  'Brain': Brain,
  'FlaskConical': FlaskConical,
  'Heart': Heart,
  'Smile': Smile,
  'Hand': Hand,
  'Waves': Waves,
  'Globe': Globe,
  'TrendingUp': TrendingUp,
  'BookOpen': BookOpen,
  'LayoutGrid': LayoutGrid,
  'Zap': Zap,
  'Target': Target,
  'Shield': Shield,
  'Star': Star,
  'Compass': Compass,
  'Atom': Atom,
  'Dna': Dna,
  'Sparkles': Sparkles,
  'Lightbulb': Lightbulb,
  'Activity': Activity,
  'Eye': Eye,
  'Languages': Languages,
  'Map': Map,
  'Pin': Pin,
  'Anchor': Anchor,
  'Award': Award,
  'BarChart3': BarChart3,
  'Flame': Flame,
  'Fingerprint': Fingerprint,
  'Ghost': Ghost,
  'Stethoscope': Stethoscope,
  'Infinity': Infinity,
  'Trophy': Trophy,
  'Coffee': Coffee,
  'Music': Music,
  'Camera': Camera
};

const IconList = Object.keys(IconMap).sort();

interface CategoryEditorDrawerProps {
  category: Category | null;
  onClose: () => void;
  onSave: (cat: Partial<Category>) => void;
  stats: { facts: number };
}

const CategoryEditorDrawer: React.FC<CategoryEditorDrawerProps> = ({ category, onClose, onSave, stats }) => {
  const { theme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const iconSelectorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Category>>({
    id: category?.id || '',
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#2D6A4F',
    icon: category?.icon || '🧠',
    vectorIcon: category?.vectorIcon || 'LayoutGrid',
    isPublished: category?.isPublished ?? true
  });

  const [isIdInUse, setIsIdInUse] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconSelectorRef.current && !iconSelectorRef.current.contains(event.target as Node)) {
        setIsIconSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time ID Uniqueness Check for Category
  useEffect(() => {
    if (!category && formData.id?.trim() && db) {
      const timer = setTimeout(async () => {
        setIsCheckingId(true);
        try {
          const docRef = doc(db, 'categories', formData.id!.trim());
          const docSnap = await getDoc(docRef);
          setIsIdInUse(docSnap.exists());
        } catch (err) {
          console.error("Category ID uniqueness check failed", err);
        } finally {
          setIsCheckingId(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsIdInUse(false);
    }
  }, [formData.id, category]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id?.trim()) newErrors.id = "Category ID is required";
    if (isIdInUse) newErrors.id = "This Category ID already exists";
    if (!formData.name?.trim()) newErrors.name = "Category name is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSyncing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      onSave(formData);
    }
  };

  const CategoryIcon = IconMap[formData.vectorIcon || ''] || LayoutGrid;
  const filteredIcons = IconList.filter(icon =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
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
                {category ? 'Edit Category' : 'New Category'}
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
               Save Category
             </ElasticButton>
          </div>
        </div>
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("flex w-full h-full min-h-0 divide-x-2 justify-center", theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10")}>

            {/* Column 1: Category Basics */}
            <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
              <section className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="flex items-center gap-3 text-brand-primary font-black">
                  <div className="p-2 bg-brand-primary/10 rounded-lg"><Info size={18} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Category Basics</h3>
                </div>
                <div className={cn("p-6 rounded-[3.5rem] flex-1 flex flex-col justify-start space-y-4 border-4 relative overflow-hidden transition-all duration-500 group/tile", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>

                  {/* Category Name Input (Moved to Top) */}
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Category Name</label>
                    <input className={cn("w-full border-2 rounded-[1.5rem] px-6 py-4 text-2xl font-black tracking-tighter focus:outline-none transition-all", errors.name ? "border-red-500/50" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Brain Science" />
                    {errors.name && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4"><AlertCircle size={14} /> {errors.name}</p>}
                  </div>

                  {/* Domain Status Toggle */}
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Publication Protocol</label>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                        className={cn(
                            "w-full py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3",
                            formData.isPublished
                                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-lg"
                                : "bg-brand-primary/5 border-brand-primary/10 text-sub opacity-40"
                        )}
                    >
                        <div className={cn("w-2.5 h-2.5 rounded-full", formData.isPublished ? "bg-brand-primary animate-pulse" : "bg-sub")} />
                        {formData.isPublished ? "Active" : "Draft"}
                    </button>
                  </div>

                  {/* Category ID Input */}
                  <div className="space-y-3">
                     <div className="flex justify-between items-center ml-2">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.3em]", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Category Identifier (Primary Key)</label>
                        {isCheckingId && <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />}
                        {!isCheckingId && formData.id && !isIdInUse && !category && <CheckCircle2 size={14} className="text-brand-primary" />}
                     </div>
                     <div className="relative">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/30" size={18} />
                        <input
                            className={cn(
                                "w-full border-2 rounded-2xl pl-14 pr-8 py-3 text-sm font-mono font-bold focus:outline-none transition-all",
                                errors.id || isIdInUse ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50",
                                category ? "opacity-50 cursor-not-allowed bg-brand-bg/5" : "",
                                theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                            )}
                            placeholder="e.g. BRAIN_SCIENCE, HABITS..."
                            value={formData.id}
                            onChange={e => setFormData({...formData, id: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                            disabled={!!category}
                        />
                     </div>
                     {errors.id && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4"><AlertCircle size={14} /> {errors.id}</p>}
                     {isIdInUse && !category && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4 animate-pulse"><AlertCircle size={14} /> Security Alert: ID already exists</p>}
                  </div>

                  <div className="grid grid-cols-12 gap-4 relative z-10">
                     <div className="col-span-8 space-y-4">
                        <div className="space-y-2">
                          <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Category Icon (Emoji)</label>
                          <input className={cn("w-full border-2 rounded-2xl px-4 py-2 text-4xl text-center focus:outline-none transition-all", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")} value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                        </div>

                        {/* Vector Icon Selection (Restored) */}
                        <div className="space-y-2 relative" ref={iconSelectorRef}>
                          <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Vector Symbol ID</label>
                          <div onClick={() => setIsIconSelectorOpen(!isIconSelectorOpen)} className={cn("w-full border-2 rounded-2xl px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex justify-between items-center shadow-inner", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}>
                            {formData.vectorIcon || 'Select Icon'}
                            <ChevronDown className={cn("transition-transform duration-300 opacity-40", isIconSelectorOpen ? "rotate-180" : "")} size={16} />
                          </div>
                          <AnimatePresence>
                            {isIconSelectorOpen && (
                              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={cn("absolute left-0 right-0 bottom-full mb-4 z-[100] p-6 rounded-[2.5rem] border-4 shadow-2xl backdrop-blur-3xl overflow-hidden", theme === 'dark' ? "bg-brand-surface/95 border-brand-primary/30" : "bg-white/95 border-brand-primary/20")}>
                                <div className="relative mb-6">
                                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-brand-primary" />
                                   <input autoFocus placeholder="Search symbols..." className={cn("w-full border rounded-xl pl-10 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none", theme === 'dark' ? "bg-black/20 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary")} value={iconSearch} onChange={e => setIconSearch(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-6 gap-3 h-[108px] overflow-y-auto pr-2 scrollbar-thin">
                                   {filteredIcons.map(iconName => {
                                     const Icon = IconMap[iconName];
                                     return (
                                       <button key={iconName} type="button" onClick={() => { setFormData({...formData, vectorIcon: iconName}); setIsIconSelectorOpen(false); setIconSearch(''); }} className={cn("h-12 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110 shrink-0", formData.vectorIcon === iconName ? "bg-brand-primary/20 border-2 border-brand-primary/40" : theme === 'dark' ? "bg-black/10" : "bg-brand-primary/5")} title={iconName}><Icon size={20} className={formData.vectorIcon === iconName ? "text-brand-primary" : "text-sub"} /></button>
                                     );
                                   })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Color Picker Integration */}
                        <div className="space-y-2">
                           <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] ml-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Brand Spectrum (Color)</label>
                           <div className={cn("flex gap-6 items-center p-3 rounded-2xl border-2 transition-all shadow-inner", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20")}>
                                <input type="color" className="w-8 h-8 bg-transparent border-none cursor-pointer rounded-xl" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                                <span className="text-xs font-mono font-black text-brand-primary uppercase tracking-widest">{formData.color}</span>
                           </div>
                        </div>
                     </div>

                     <div className="col-span-4 flex flex-col items-center justify-center pt-4">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.3em] text-center mb-2", theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80")}>Card<br/>Preview</label>
                        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl relative transition-transform duration-500", theme === 'dark' ? "bg-brand-surface/80 border-2 border-brand-primary/20" : "bg-white border-2 border-brand-primary/10 shadow-lg")}>
                           <CategoryIcon size={32} style={{ color: formData.color }} />
                           <span className={cn("absolute -bottom-1 -right-1 text-xl rounded-xl p-1 border-2 shadow-lg", theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/20")}>{formData.icon}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Column 2: Description */}
            <div className="w-full max-w-2xl flex flex-col h-full min-h-0 p-6 space-y-6">
               <section className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="flex items-center gap-3 text-brand-gold font-black">
                  <div className="p-2 bg-brand-gold/10 rounded-lg"><FileText size={18} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Description</h3>
                </div>
                <div className={cn("p-6 rounded-[3.5rem] flex-1 flex flex-col border-4 transition-all duration-500 min-h-0 group/tile relative overflow-hidden", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>
                  <textarea className={cn("w-full flex-1 border-2 rounded-[2rem] p-6 text-sm font-medium leading-relaxed italic resize-none focus:outline-none transition-all relative z-10", errors.description ? "border-red-500/50" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Define the scope and mission of this category..." />
                  {errors.description && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4 mt-2"><AlertCircle size={14} /> {errors.description}</p>}

                  {/* Facts Count Display */}
                  <div className="mt-6 pt-6 border-t-2 border-brand-primary/10 space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-2">Category Statistics</p>
                     <div className="p-6 rounded-2xl border-2 border-dashed border-brand-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary"><BookOpen size={20} /></div>
                            <span className="text-sm font-black uppercase tracking-widest text-sub">Total Facts</span>
                        </div>
                        <span className="text-2xl font-black text-brand-primary tabular-nums">{stats.facts}</span>
                     </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
  return createPortal(content, document.body);
};

const CategoriesPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const {
    categories: filteredCategories,
    allCategories,
    loading,
    searchTerm,
    setSearchTerm,
    saveCategory,
    removeCategory
  } = useCategories();
  const { allFacts } = useFacts();
  const headerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(headerRef);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const getCategoryStats = (categoryName: string) => {
    const categoryFacts = allFacts.filter(f => f.category.toLowerCase() === categoryName.toLowerCase());
    return { facts: categoryFacts.length };
  };

  const handleEdit = (cat: Category | null = null) => {
    setSelectedCategory(cat);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black tracking-tighter uppercase"
           >
             Categories
           </motion.h1>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={() => handleEdit(null)}>
              <Plus size={18} strokeWidth={3} />
              New Category
           </ElasticButton>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={24} />
          <input
            type="text"
            placeholder="Filter categories by name or description..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hidden md:flex items-center gap-6 pr-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-sub uppercase tracking-[0.3em] opacity-40">Active Categories</p>
              <p className="text-2xl font-black text-brand-primary tabular-nums">{allCategories.length}</p>
           </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 glass rounded-[3rem] animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))
        ) : filteredCategories.length === 0 ? (
          <EmptyBuffer
            icon={LayoutGrid}
            title="No Categories Found"
            message="No categories were found matching your criteria."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((cat, idx) => {
              const stats = getCategoryStats(cat.name);

              // Smart Icon Selection
              const getIcon = (c: Category) => {
                if (c.vectorIcon && IconMap[c.vectorIcon]) return IconMap[c.vectorIcon];
                const name = c.name.toLowerCase();
                if (name.includes('brain')) return IconMap['Brain'] || Brain;
                if (name.includes('mental')) return IconMap['Smile'] || Smile;
                if (name.includes('behavior') || name.includes('social') || name.includes('human')) return IconMap['Users'] || Users;
                if (name.includes('love') || name.includes('attraction')) return IconMap['Heart'] || Heart;
                if (name.includes('body') || name.includes('language')) return IconMap['Hand'] || Hand;
                if (name.includes('habit') || name.includes('motivation')) return IconMap['TrendingUp'] || TrendingUp;
                if (name.includes('memory') || name.includes('learning')) return IconMap['BookOpen'] || BookOpen;
                if (name.includes('subconscious')) return IconMap['Waves'] || Waves;
                return LayoutGrid;
              };

              const CategoryIcon = getIcon(cat);

              return (
                <motion.div key={cat.id} layout>
                  <PremiumCard glowColor={`${cat.color}22`} className="p-10 flex flex-col" onClick={() => navigate(`/facts?category=${cat.name}`)}>
                    <div className="flex justify-between items-start mb-10">
                       <div className={cn("w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 relative", theme === 'dark' ? "bg-brand-bg/80 border border-brand-sage/20" : "bg-white border border-brand-primary/10")}>
                          <CategoryIcon size={32} style={{ color: cat.color }} />
                          <span className="absolute -bottom-2 -right-2 text-xl bg-brand-surface rounded-lg p-1 border border-brand-sage/20 shadow-lg">{cat.icon}</span>
                       </div>

                       <div className="flex flex-col items-end gap-3">
                          <span className="text-[12px] font-mono text-sub opacity-50 font-bold tracking-[0.1em]">UID: {cat.id}</span>
                          <ActionBadge variant={cat.isPublished ? 'success' : 'warning'} className="font-black text-[11px]">
                             {cat.isPublished ? 'Live' : 'Draft'}
                          </ActionBadge>
                          <div className="flex gap-2">
                             <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                                className="p-2.5 glass hover:bg-brand-primary/10 text-sub hover:text-brand-primary rounded-xl transition-all border border-brand-sage/10 shadow-md"
                             >
                                <Edit3 size={16} />
                             </motion.button>
                             <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => { e.stopPropagation(); removeCategory(cat.id, cat.name); }}
                                className="p-2.5 glass hover:bg-red-500/10 text-sub hover:text-red-500 rounded-xl transition-all border border-brand-sage/10 shadow-md"
                             >
                                <Trash2 size={16} />
                             </motion.button>
                          </div>
                       </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black mb-1 tracking-tighter group-hover:text-brand-primary transition-colors">{cat.name}</h3>
                      <p className="text-sub text-[15px] font-bold leading-relaxed italic line-clamp-2 opacity-80 mb-10 group-hover:text-brand-white transition-colors duration-500">
                        "{cat.description && cat.description !== '..' ? cat.description : 'No detailed description available for this sector.'}"
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 relative z-10 mb-10">
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-sub uppercase flex items-center gap-2 opacity-40"><BookOpen size={12} className="text-brand-primary" /> Facts</p>
                          <p className="text-2xl font-black tracking-tighter tabular-nums">{stats.facts}</p>
                       </div>
                    </div>
                    <div className="mt-auto pt-8 border-t border-brand-sage/10 flex justify-end items-center relative z-10">
                       <motion.button whileHover={{ x: 5 }} className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] group-hover:opacity-100 transition-opacity">Facts <ArrowRight size={16} /></motion.button>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      <AnimatePresence>
        {isEditorOpen && (
          <CategoryEditorDrawer
            category={selectedCategory}
            onClose={() => setIsEditorOpen(false)}
            stats={selectedCategory ? getCategoryStats(selectedCategory.name) : { facts: 0 }}
            onSave={async (cat) => {
              const success = await saveCategory(cat);
              if (success) setIsEditorOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
export default CategoriesPage;
