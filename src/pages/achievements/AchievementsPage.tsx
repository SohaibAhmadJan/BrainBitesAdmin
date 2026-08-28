import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trophy,
  Search,
  Trash2,
  Edit3,
  Star,
  Target
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Achievement } from '../../types';
import { useAchievements } from '../../hooks/useAchievements';
import { cn } from '../../utils/cn';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import AchievementEditorDrawer from './AchievementEditorDrawer';

const getRequirementLabel = (type: string, magnitude: number) => {
  switch (type) {
    case 'READ_COUNT': return `${magnitude} Psychology Reads`;
    case 'FAVORITE_COUNT': return `${magnitude} Saved Insights`;
    case 'SHARE_COUNT': return `${magnitude} Social Shares`;
    case 'CATEGORY_COUNT': return `${magnitude} Knowledge Domains`;
    case 'STREAK_DAYS': return `${magnitude} Day Streak`;
    case 'NIGHT_OWL': return 'Condition: Late Night Reading';
    case 'EARLY_BIRD': return 'Condition: Morning Insight';
    default: return `${magnitude} Logic Units`;
  }
};

const AchievementsPage = () => {
  const { theme } = useTheme();
  const {
    achievements: filteredAchievements,
    allAchievements,
    loading,
    searchTerm,
    setSearchTerm,
    saveAchievement,
    removeAchievement
  } = useAchievements();

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = (ach: Achievement | null = null) => {
    setSelectedAchievement(ach);
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
             Reward <span className="text-brand-primary">Architecture</span>
           </motion.h1>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={() => handleEdit(null)}>
              <Plus size={18} strokeWidth={3} />
              Create Definition
           </ElasticButton>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search milestones by title or logic..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center gap-6 pr-4">
           <div className="text-right">
              <p className="text-[11px] font-black text-sub uppercase tracking-[0.2em] opacity-60">Active Milestones</p>
              <p className="text-3xl font-black text-brand-primary tabular-nums">{allAchievements.length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 glass rounded-[3rem] animate-pulse"></div>
          ))
        ) : filteredAchievements.length === 0 ? (
          <div className="col-span-full py-40 glass rounded-[3rem] border border-dashed border-brand-sage/20 flex flex-col items-center justify-center text-sub opacity-40 gap-4">
            <Trophy size={64} />
            <p className="font-black uppercase tracking-[0.3em] text-lg">Zero milestone definitions</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAchievements.map((ach, idx) => (
              <motion.div
                key={ach.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass rounded-[3rem] shadow-xl group border-transparent hover:border-brand-gold/20 transition-all flex flex-col overflow-hidden h-full"
              >
                <div className={cn(
                  "p-10 flex-1 space-y-6 relative overflow-hidden",
                  (ach.requirementType === 'NIGHT_OWL' || ach.requirementType === 'EARLY_BIRD') && "bg-gradient-to-br from-brand-primary/5 to-transparent"
                )}>
                   {/* Special Logic Glow */}
                   {(ach.requirementType === 'NIGHT_OWL' || ach.requirementType === 'EARLY_BIRD') && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                   )}

                   {/* Universal Header Block */}
                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="w-20 h-20 bg-brand-bg/5 dark:bg-brand-bg rounded-[1.8rem] flex items-center justify-center text-brand-primary border border-brand-sage/10 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(45,106,79,0.2)] transition-all duration-500">
                        <Trophy size={32} />
                      </div>

                      <div className="flex flex-col items-end gap-3">
                         <span className="text-[12px] font-mono text-sub opacity-50 font-bold tracking-[0.1em]">UID: {ach.id}</span>
                         <ActionBadge variant={ach.isPublished ? 'success' : 'warning'} className="font-black text-[11px]">
                            {ach.isPublished ? 'Live' : 'Draft'}
                         </ActionBadge>
                         <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={(e) => { e.stopPropagation(); handleEdit(ach); }}
                              className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-xl border border-brand-sage/10 transition-all shadow-md"
                            >
                              <Edit3 size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={(e) => { e.stopPropagation(); removeAchievement(ach.id, ach.title); }}
                              className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-xl border border-brand-sage/10 transition-all shadow-md"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2 relative z-10">
                      <h3 className="text-3xl font-black tracking-tighter group-hover:text-brand-primary transition-colors mb-1">{ach.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.1em] opacity-80">
                          {ach.requirementType.replace('_', ' ')}
                        </span>
                      </div>
                   </div>

                   <p className="text-sub text-[15px] font-bold leading-relaxed italic line-clamp-2 relative z-10 opacity-80 group-hover:text-brand-white transition-colors duration-500 border-l-4 border-brand-primary/10 pl-6">"{ach.description}"</p>

                   <div className="pt-6 border-t border-brand-sage/5 relative z-10">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-sub opacity-50 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Target size={14} className="text-brand-primary" /> Success Threshold
                        </p>
                        <p className="text-lg font-black text-brand-white">
                          {getRequirementLabel(ach.requirementType, ach.maxProgress)}
                        </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <AchievementEditorDrawer
            achievement={selectedAchievement}
            onClose={() => setIsEditorOpen(false)}
            onSave={saveAchievement}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsPage;
