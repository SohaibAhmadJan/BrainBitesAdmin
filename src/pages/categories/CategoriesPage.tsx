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
  AlertCircle
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useFacts } from '../../hooks/useFacts';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useTheme } from '../../context/ThemeContext';
import { Category, CategoryPresets } from '../../types';
import { cn } from '../../utils/cn';
import PremiumCard from '../../components/ui/PremiumCard';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';

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
};

const StatusLight = () => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 80);
      setTimeout(triggerBlink, Math.random() * 6000 + 2000); // 2-8s random interval
    };
    const initialTimer = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <div className={cn(
        "w-2.5 h-2.5 rounded-full transition-all duration-75",
        isBlinking
          ? "bg-brand-primary shadow-[0_0_15px_rgba(45,106,79,1)] scale-110"
          : "bg-brand-primary/40 scale-100"
      )} />
      <div className="absolute inset-0 w-full h-full rounded-full bg-brand-primary animate-ping opacity-20" />
    </div>
  );
};

interface CategoryEditorDrawerProps {
  category: Category | null;
  onClose: () => void;
  onSave: (cat: Partial<Category>) => void;
  stats: { facts: number; quizzes: number };
}

const CategoryEditorDrawer: React.FC<CategoryEditorDrawerProps> = ({ category, onClose, onSave, stats }) => {
  const { theme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    id: category?.id || '',
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#2D6A4F',
    icon: category?.icon || '🧠',
    vectorIcon: category?.vectorIcon || 'LayoutGrid'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Domain identity is required";
    if (!formData.description?.trim()) newErrors.description = "Functional scope is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSyncing(true);
      // Brief artificial delay for the transmission animation immersion
      await new Promise(resolve => setTimeout(resolve, 800));
      onSave(formData);
    }
  };

  const CategoryIcon = IconMap[formData.vectorIcon || ''] || LayoutGrid;

  const content = (
    <div className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-black/60 backdrop-blur-xl p-0">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className={cn(
          "w-full h-full flex flex-col overflow-hidden border-[16px] relative rounded-[4.5rem] transition-colors duration-700",
          theme === 'dark'
            ? "bg-brand-bg border-brand-primary/60 shadow-[inset_0_0_150px_rgba(45,106,79,0.5)]"
            : "bg-[#F4F8F6] border-brand-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-10 flex items-center justify-between backdrop-blur-3xl sticky top-0 z-50 transition-colors duration-500",
          theme === 'dark' ? "bg-brand-surface/90" : "bg-white/95 shadow-sm"
        )}>
          {/* Sync Transmission Overlay */}
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
              <h2 className={cn(
                "text-4xl font-black tracking-tighter uppercase",
                theme === 'dark' ? "text-white" : "text-brand-primary"
              )}>
                {category ? 'Refine Sector' : 'Initialize Node'}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <StatusLight />
                 <p className={cn(
                   "text-xs font-black uppercase tracking-[0.4em] opacity-40",
                   theme === 'dark' ? "text-sub" : "text-brand-primary"
                 )}>
                   {formData.id || 'NEW_SEQUENCE'} • Root Taxonomy Access
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <ElasticButton
              onClick={handleSave}
              className="px-16 py-5 rounded-2xl text-base shadow-[0_0_30px_rgba(45,106,79,0.4)]"
             >
               Execute Sync
             </ElasticButton>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-hidden flex flex-col min-h-0",
          theme === 'dark' ? "bg-brand-bg" : "bg-transparent"
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex w-full h-full min-h-0 divide-x-2",
              theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10"
            )}
          >
            {/* Column 1: Identity Matrix */}
            <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
              <section className="flex-1 flex flex-col space-y-4 min-h-0">
                <div className="flex items-center gap-3 text-brand-primary font-black">
                  <div className="p-2 bg-brand-primary/10 rounded-lg">
                    <Info size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Identity Matrix</h3>
                </div>

                <div className={cn(
                  "p-10 rounded-[3.5rem] flex-1 flex flex-col justify-center space-y-12 border-4 relative overflow-hidden transition-all duration-500 group/tile",
                  theme === 'dark'
                    ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl focus-within:border-brand-primary/40 focus-within:shadow-brand-primary/10"
                    : "bg-white/90 border-brand-primary/10 shadow-xl shadow-brand-primary/5 focus-within:border-brand-primary/30 focus-within:shadow-brand-primary/10"
                )}>
                  {/* Focus Aura Glow */}
                  <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-focus-within/tile:opacity-100 transition-opacity pointer-events-none" />

                  <div className="grid grid-cols-12 gap-8 relative z-10">
                     <div className="col-span-8 space-y-8">
                        <div className="space-y-3">
                          <label className={cn(
                            "text-[10px] font-black uppercase tracking-[0.3em] ml-2",
                            theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80"
                          )}>Emoji Symbol</label>
                          <input
                            className={cn(
                              "w-full border-2 rounded-3xl px-4 py-4 text-5xl text-center focus:outline-none transition-all shadow-inner",
                              theme === 'dark'
                                ? "bg-black/30 border-brand-primary/10 focus:border-brand-primary/50"
                                : "bg-brand-primary/5 border-brand-primary/20 focus:border-brand-primary/40 text-brand-primary"
                            )}
                            value={formData.icon}
                            onChange={e => setFormData({...formData, icon: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className={cn(
                            "text-[10px] font-black uppercase tracking-[0.3em] ml-2",
                            theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80"
                          )}>Vector ID</label>
                          <input
                            className={cn(
                              "w-full border-2 rounded-2xl px-6 py-5 text-xs text-center focus:outline-none font-mono font-bold uppercase tracking-widest transition-all shadow-inner",
                              theme === 'dark'
                                ? "bg-black/30 border-brand-primary/10 focus:border-brand-primary/50"
                                : "bg-brand-primary/5 border-brand-primary/20 focus:border-brand-primary/40 text-brand-primary"
                            )}
                            value={formData.vectorIcon}
                            onChange={e => setFormData({...formData, vectorIcon: e.target.value})}
                          />
                        </div>
                     </div>

                     <div className="col-span-4 flex flex-col items-center justify-center pt-6">
                        <label className={cn(
                          "text-[10px] font-black uppercase tracking-[0.3em] text-center mb-4",
                          theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80"
                        )}>Live Card<br/>Preview</label>
                        <div
                          className={cn(
                            "w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative transition-transform duration-500 hover:scale-110",
                            theme === 'dark' ? "bg-brand-surface/80 border-2 border-brand-primary/20" : "bg-white border-2 border-brand-primary/10 shadow-lg"
                          )}
                        >
                           <CategoryIcon size={40} style={{ color: formData.color }} />
                           <span className={cn(
                             "absolute -bottom-2 -right-2 text-2xl rounded-xl p-1.5 border-2 shadow-lg",
                             theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/20"
                           )}>{formData.icon}</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] ml-2",
                      theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary/80"
                    )}>Sequence Name</label>
                    <input
                      className={cn(
                        "w-full border-2 rounded-[2rem] px-8 py-6 text-3xl font-black tracking-tighter focus:outline-none transition-all shadow-inner",
                        errors.name ? "border-red-500/50" : "focus:border-brand-primary/50",
                        theme === 'dark'
                          ? "bg-black/30 border-brand-primary/10"
                          : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                      )}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  {/* Discrete Hidden Node ID */}
                  <div className="absolute bottom-6 right-10 opacity-10 hover:opacity-100 transition-opacity">
                      <p className={cn(
                        "text-[8px] font-mono select-all cursor-copy tracking-widest uppercase",
                        theme === 'dark' ? "text-white" : "text-brand-primary"
                      )}>{formData.id}</p>
                  </div>
                </div>
              </section>
            </div>

                {/* Column 2: Functional Scope */}
                <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
                   <section className="flex-1 flex flex-col space-y-4 min-h-0">
                    <div className="flex items-center gap-3 text-brand-gold font-black">
                      <div className="p-2 bg-brand-gold/10 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Functional Scope</h3>
                    </div>
                    <div className={cn(
                      "p-12 rounded-[4rem] flex-1 flex flex-col border-4 transition-all duration-500 min-h-0 group/tile relative overflow-hidden",
                      theme === 'dark'
                        ? "bg-brand-surface/40 border-brand-primary/15 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl focus-within:border-brand-primary/40 focus-within:shadow-brand-primary/10"
                        : "bg-white/90 border-brand-primary/10 shadow-xl shadow-brand-primary/5 focus-within:border-brand-primary/30 focus-within:shadow-brand-primary/10"
                    )}>
                       {/* Focus Aura Glow */}
                       <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-focus-within/tile:opacity-100 transition-opacity pointer-events-none" />

                      <textarea
                        className={cn(
                          "w-full flex-1 border-2 rounded-[2.5rem] p-12 text-sm font-medium leading-relaxed italic resize-none focus:outline-none transition-all shadow-inner relative z-10",
                          errors.description ? "border-red-500/50" : "focus:border-brand-primary/50",
                          theme === 'dark'
                            ? "bg-black/30 border-brand-primary/10"
                            : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                        )}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Anchor the core mission of this domain..."
                      />
                    </div>
                  </section>
                </div>

            {/* Column 3: App Presets & Spectral Control */}
            <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
              <section className="space-y-4 flex flex-col">
                <div className="flex items-center gap-3 text-brand-primary font-black">
                  <div className="p-2 bg-brand-primary/10 rounded-lg">
                    <LayoutGrid size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Quick Sync Bank</h3>
                </div>
                <div className={cn(
                  "rounded-[3rem] border-4 shadow-2xl overflow-hidden flex flex-col h-[220px] transition-all duration-500 group/tile relative",
                  theme === 'dark'
                    ? "bg-brand-surface/40 border-brand-primary/15 backdrop-blur-2xl focus-within:border-brand-primary/40"
                    : "bg-white/90 border-brand-primary/10 focus-within:border-brand-primary/30"
                )}>
                   {/* Focus Aura Glow */}
                   <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-focus-within/tile:opacity-100 transition-opacity pointer-events-none" />

                  {/* INTERNALIZED SCROLLBAR GEOMETRY */}
                  <div className={cn(
                    "flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent relative z-10",
                    theme === 'dark' ? "scrollbar-thumb-brand-primary/30" : "scrollbar-thumb-brand-primary/20"
                  )}>
                    <div className="grid grid-cols-5 gap-3">
                      {CategoryPresets.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            name: preset.name,
                            description: `Psychological insights regarding ${preset.name}.`,
                            color: preset.color,
                            icon: preset.icon,
                            vectorIcon: preset.vectorIcon
                          })}
                          className={cn(
                            "px-2 py-2 border-2 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 aspect-square group/preset shadow-lg",
                            theme === 'dark'
                              ? "bg-brand-bg/40 hover:bg-brand-primary/40 border-brand-primary/10"
                              : "bg-brand-primary/5 hover:bg-brand-primary/10 border-brand-primary/20"
                          )}
                        >
                          <span className="text-2xl shrink-0 group-hover/preset:scale-110 transition-transform">{preset.icon}</span>
                          <span className={cn(
                            "text-[7px] font-black uppercase tracking-tighter truncate w-full text-center group-hover/preset:opacity-100",
                            theme === 'dark' ? "opacity-60" : "opacity-80 text-brand-primary"
                          )}>{preset.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex-1 flex flex-col space-y-4 min-h-0">
                <div className="flex items-center gap-3 text-brand-gold font-black">
                  <div className="p-2 bg-brand-gold/10 rounded-lg">
                    <Palette size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Spectral Orchestration</h3>
                </div>
                <div className={cn(
                  "p-10 rounded-[4rem] border-4 shadow-2xl flex-1 flex flex-col justify-between space-y-8 min-h-0 transition-all duration-500 group/tile relative overflow-hidden",
                  theme === 'dark'
                    ? "bg-brand-surface/40 border-brand-primary/15 backdrop-blur-2xl focus-within:border-brand-primary/40 focus-within:shadow-brand-primary/10"
                    : "bg-white/90 border-brand-primary/10 shadow-xl shadow-brand-primary/5 focus-within:border-brand-primary/30 focus-within:shadow-brand-primary/10"
                )}>
                   {/* Focus Aura Glow */}
                   <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-focus-within/tile:opacity-100 transition-opacity pointer-events-none" />

                  <div className={cn(
                    "flex gap-10 items-center p-8 rounded-[2.5rem] border-4 shadow-inner flex-1 relative z-10",
                    theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/20"
                  )}>
                    <div className="relative group shrink-0">
                       <input
                         type="color"
                         className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-2xl"
                         value={formData.color}
                         onChange={e => setFormData({...formData, color: e.target.value})}
                       />
                       <div className="absolute inset-0 rounded-2xl border-4 border-white/10 pointer-events-none group-hover:border-brand-primary/50 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-mono font-black text-brand-primary uppercase tracking-widest leading-none">{formData.color}</p>
                      <p className={cn(
                        "text-[9px] font-black uppercase mt-2 tracking-widest",
                        theme === 'dark' ? "text-sub opacity-40" : "text-brand-primary/60"
                      )}>Active HEX Bridge</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 shrink-0">
                    <div className="space-y-2">
                       <p className={cn(
                         "text-[9px] font-black uppercase flex items-center gap-2 tracking-widest",
                         theme === 'dark' ? "text-brand-primary/60" : "text-brand-primary"
                       )}>
                          <BookOpen size={12} className="text-brand-primary" /> Facts
                       </p>
                       <p className="text-2xl font-black text-brand-primary tabular-nums tracking-tighter">{stats.facts}</p>
                    </div>
                    <div className="space-y-2">
                       <p className={cn(
                         "text-[9px] font-black uppercase flex items-center gap-2 tracking-widest",
                         theme === 'dark' ? "text-brand-gold/60" : "text-brand-gold"
                       )}>
                          <Puzzle size={12} className="text-brand-gold" /> Quiz Questions
                       </p>
                       <p className="text-2xl font-black text-brand-gold tabular-nums tracking-tighter">{stats.quizzes}</p>
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
  const { categories, loading, saveCategory, removeCategory } = useCategories();
  const { allFacts } = useFacts();

  const headerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(headerRef);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const getCategoryStats = (categoryName: string) => {
    const categoryFacts = allFacts.filter(f => f.category === categoryName);
    const quizCount = categoryFacts.filter(f => !!f.quizQuestion).length;
    return {
      facts: categoryFacts.length,
      quizzes: quizCount
    };
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cat: Category | null = null) => {
    setSelectedCategory(cat);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* Category Matrix Header */}
      <div
        ref={headerRef}
        className="glass p-10 rounded-[3.5rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden group border-brand-primary/10 hover:border-brand-primary/20 transition-colors"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 400px at ${mouse.x}px ${mouse.y}px, rgba(45, 106, 79, 0.1), transparent)`
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full xl:w-auto">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-brand-primary/10 rounded-[1.5rem] shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <LayoutGrid className="text-brand-primary relative z-10" size={40} />
                <div className="absolute inset-0 bg-brand-primary/20 animate-pulse blur-xl" />
            </div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black tracking-tighter"
              >
                Category <span className="text-brand-primary">Matrix</span>
              </motion.h2>
              <p className="text-sub text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic opacity-40">System Taxonomy Sequence Control</p>
            </div>
          </div>

          <div className="w-[1px] h-12 bg-brand-sage/20 hidden md:block" />

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={20} />
            <input
              type="text"
              placeholder="Filter domains..."
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10 w-full md:w-auto justify-end">
           <div className="text-right hidden md:block">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <p className="text-[10px] font-black text-sub uppercase tracking-[0.3em] opacity-40">Active Sectors</p>
              </div>
              <p className="text-2xl font-black text-brand-primary">{categories.length}</p>
           </div>
           <div className="w-[1px] h-12 bg-brand-sage/20 hidden md:block" />
           <ElasticButton
            onClick={() => handleEdit(null)}
            className="px-10 py-5"
           >
             <Plus size={22} strokeWidth={3} />
             Add Sector
           </ElasticButton>
        </div>

        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Grid Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 glass rounded-[3rem] animate-pulse" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((cat, idx) => {
              const stats = getCategoryStats(cat.name);
              const CategoryIcon = IconMap[cat.vectorIcon] || LayoutGrid;

              return (
                <PremiumCard
                  key={cat.id}
                  glowColor={`${cat.color}22`}
                  className="p-10 flex flex-col"
                  onClick={() => navigate(`/facts?category=${cat.name}`)}
                >
                  <div className="flex justify-between items-start mb-10">
                     <div
                      className={cn(
                        "w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 relative",
                        theme === 'dark' ? "bg-brand-bg/80 border border-brand-sage/20" : "bg-white border border-brand-primary/10"
                      )}
                     >
                        <CategoryIcon size={32} style={{ color: cat.color }} />
                        <span className="absolute -bottom-2 -right-2 text-xl bg-brand-surface rounded-lg p-1 border border-brand-sage/20 shadow-lg">{cat.icon}</span>
                     </div>
                     <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                          className="p-3 glass hover:bg-brand-primary/10 text-sub hover:text-brand-primary rounded-2xl transition-all border border-brand-sage/10 shadow-lg"
                        >
                          <Edit3 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -10 }}
                          onClick={(e) => { e.stopPropagation(); removeCategory(cat.id, cat.name); }}
                          className="p-3 glass hover:bg-red-500/10 text-sub hover:text-red-500 rounded-2xl transition-all border border-brand-sage/10 shadow-lg"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                     </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-black mb-4 tracking-tighter group-hover:text-brand-primary transition-colors">{cat.name}</h3>
                    <p className="text-sub text-sm font-medium leading-relaxed italic line-clamp-2 opacity-60 mb-10">"{cat.description}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 relative z-10 mb-10">
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-sub uppercase flex items-center gap-2 opacity-40"><BookOpen size={12} className="text-brand-primary" /> Facts</p>
                        <p className="text-2xl font-black tracking-tighter tabular-nums">{stats.facts}</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-sub uppercase flex items-center gap-2 opacity-40"><Puzzle size={12} className="text-brand-gold" /> Quiz</p>
                        <p className="text-2xl font-black tracking-tighter tabular-nums">{stats.quizzes}</p>
                     </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-brand-sage/10 flex justify-between items-center relative z-10">
                     <ActionBadge variant="info">System Node</ActionBadge>
                     <motion.button
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] group-hover:opacity-100 transition-opacity"
                     >
                        Sequence <ArrowRight size={16} />
                     </motion.button>
                  </div>
                </PremiumCard>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Morph Category Editor Drawer */}
      <AnimatePresence>
        {isEditorOpen && (
          <CategoryEditorDrawer
            category={selectedCategory}
            onClose={() => setIsEditorOpen(false)}
            stats={selectedCategory ? getCategoryStats(selectedCategory.name) : { facts: 0, quizzes: 0 }}
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
