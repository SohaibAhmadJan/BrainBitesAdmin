import React, { useState, useRef } from 'react';
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
  Users
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

const CategoriesPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { categories, loading, saveCategory, removeCategory } = useCategories();
  const { allFacts } = useFacts();

  const headerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(headerRef);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2D6A4F',
    icon: '🧠',
    vectorIcon: 'LayoutGrid'
  });

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

  const handleOpenModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        vectorIcon: cat.vectorIcon || 'LayoutGrid'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#2D6A4F',
        icon: '🧠',
        vectorIcon: 'LayoutGrid'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveCategory({
      ...editingCategory,
      ...formData
    });
    if (success) setIsModalOpen(false);
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
            onClick={() => handleOpenModal()}
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
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(cat); }}
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

      {/* Modal Overhaul */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-bg/95 backdrop-blur-xl"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl glass rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
            >
               <div className="p-12 border-b border-brand-sage/10 flex justify-between items-center bg-brand-primary/5">
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">{editingCategory ? 'Refine Sector' : 'Anchor Node'}</h3>
                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-[0.4em] mt-2 italic">System Taxonomy Sequence</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 bg-brand-bg/10 hover:bg-brand-bg/20 text-sub hover:text-brand-primary transition-all rounded-[1.5rem] border border-brand-sage/10">
                    <X size={28} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-12 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-sub uppercase tracking-[0.4em] ml-2">App Presets (Quick Sync)</label>
                    <div className="flex flex-wrap gap-3 p-6 glass rounded-[2rem] border-brand-sage/10">
                      {CategoryPresets.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({
                            name: preset.name,
                            description: `Psychological insights regarding ${preset.name}.`,
                            color: preset.color,
                            icon: preset.icon,
                            vectorIcon: preset.vectorIcon
                          })}
                          className="px-4 py-2 bg-brand-bg/20 hover:bg-brand-primary/20 border border-brand-sage/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-sub uppercase tracking-[0.4em] ml-2">Emoji Identity</label>
                        <input
                          className="w-full bg-brand-bg/20 border border-brand-sage/20 rounded-3xl px-3 py-5 text-4xl text-center focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
                          placeholder="🧠"
                          value={formData.icon}
                          onChange={e => setFormData({...formData, icon: e.target.value})}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-sub uppercase tracking-[0.4em] ml-2">Vector Symbol ID</label>
                        <input
                          className="w-full bg-brand-bg/20 border border-brand-sage/20 rounded-3xl px-6 py-6 text-sm text-center focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner font-mono font-bold"
                          placeholder="Brain"
                          value={formData.vectorIcon}
                          onChange={e => setFormData({...formData, vectorIcon: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-sub uppercase tracking-[0.4em] ml-2">Node Identity</label>
                    <input
                        className="w-full bg-brand-bg/20 border border-brand-sage/20 rounded-3xl px-8 py-5 text-lg focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner font-bold"
                        placeholder="e.g. Cognitive Dynamics"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-sub uppercase tracking-[0.4em] ml-2">Functional Scope</label>
                    <textarea
                      className="w-full bg-brand-bg/20 border border-brand-sage/20 rounded-[2.5rem] p-8 text-sm focus:outline-none focus:border-brand-primary/50 transition-all leading-relaxed shadow-inner font-medium italic"
                      rows={3}
                      placeholder="Define the scope of this psychological sector..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-sub uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
                       <Palette size={14} className="text-brand-primary" /> Spectral Target
                    </label>
                    <div className="flex gap-6 items-center bg-brand-bg/20 p-5 rounded-[1.8rem] border border-brand-sage/10">
                       <input
                        type="color"
                        className="w-20 h-14 bg-transparent border-none cursor-pointer rounded-xl"
                        value={formData.color}
                        onChange={e => setFormData({...formData, color: e.target.value})}
                       />
                       <p className="text-sm font-mono font-black text-brand-primary uppercase tracking-[0.2em]">{formData.color}</p>
                    </div>
                  </div>

                  <div className="pt-8">
                     <ElasticButton
                      type="submit"
                      className="w-full py-6 rounded-[2rem]"
                     >
                       {editingCategory ? 'Execute Sync' : 'Initialize Node'}
                     </ElasticButton>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;
