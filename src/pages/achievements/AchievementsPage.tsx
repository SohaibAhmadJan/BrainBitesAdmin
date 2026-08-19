import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trophy,
  Lock,
  Unlock,
  CheckCircle2,
  Search,
  Settings2,
  Trash2,
  Edit3,
  Star,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { Achievement } from '../../types';
import { fetchAchievements } from '../../services/firestoreService';
import { updateAchievement, deleteAchievement as deleteAchievementApi } from '../../services/adminApi';
import toast from 'react-hot-toast';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';

const AchievementsPage = () => {
  const { theme } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await fetchAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Load achievements failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async () => {
    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: 'New Achievement',
      description: 'Describe the milestone criteria...',
      iconName: 'Trophy',
      maxProgress: 1,
      requirementType: 'READ_COUNT',
      isActive: true,
      createdAt: Date.now()
    };
    try {
      await updateAchievement(newAch.id, newAch, 'Administrative achievement initialization');
      toast.success('Milestone anchored (Atomic)');
      loadAchievements();
    } catch (err: any) {
      toast.error(`Initialization failed: ${err.message}`);
    }
  };

  const toggleStatus = async (ach: Achievement) => {
    const updated = { ...ach, isActive: !ach.isActive };
    try {
      await updateAchievement(updated.id, updated, `State toggle: ${updated.isActive ? 'ACTIVATE' : 'ARCHIVE'}`);
      toast.success(updated.isActive ? 'Achievement active' : 'Achievement archived');
      loadAchievements();
    } catch (err: any) {
      toast.error(`State toggle failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dissolve this achievement definition?')) return;
    try {
      await deleteAchievementApi(id, 'Manual achievement removal');
      toast.success('Definition expunged');
      loadAchievements();
    } catch (err: any) {
      toast.error(`Expunge failed: ${err.message}`);
    }
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
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="warning" className="px-5 py-1.5">Gamification Root</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Mechanics \u0026 Milestone Logic</p>
           </div>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={handleAddAchievement}>
              <Plus size={18} strokeWidth={3} />
              Create Definition
           </ElasticButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 glass rounded-[3rem] animate-pulse"></div>
          ))
        ) : achievements.length === 0 ? (
          <div className="col-span-full py-40 glass rounded-[3rem] border border-dashed border-brand-sage/20 flex flex-col items-center justify-center text-sub opacity-40 gap-4">
            <Trophy size={64} />
            <p className="font-black uppercase tracking-[0.3em] text-lg">Zero milestone definitions</p>
          </div>
        ) : (
          <AnimatePresence>
            {achievements.map((ach, idx) => (
              <motion.div
                key={ach.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass rounded-[3rem] shadow-xl group border-transparent hover:border-brand-gold/20 transition-all flex flex-col overflow-hidden h-full"
              >
                <div className="p-10 flex-1 space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="w-20 h-20 bg-brand-bg/5 dark:bg-brand-bg rounded-[1.8rem] flex items-center justify-center text-4xl border border-brand-sage/10 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(233,196,106,0.2)] transition-all duration-500">
                        🏆
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                          "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                        )}>
                          {ach.requirementType}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleStatus(ach)}
                          className={cn(
                            "p-2.5 rounded-xl transition-all border shadow-sm",
                            ach.isActive ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-brand-bg/5 dark:bg-brand-bg border-brand-sage/10 text-sub opacity-40"
                          )}
                        >
                          {ach.isActive ? <Unlock size={18} /> : <Lock size={18} />}
                        </motion.button>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight">{ach.title}</h3>
                      <p className="text-sub text-sm font-medium leading-relaxed italic line-clamp-2">"{ach.description}"</p>
                   </div>

                   <div className="pt-8 border-t border-brand-sage/5 grid grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Target size={12} className="text-brand-primary" /> Goal
                        </p>
                        <p className="text-base font-black">{ach.maxProgress} Multi-steps</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Star size={12} className="text-brand-gold" /> Established
                        </p>
                        <p className="text-base font-black text-brand-gold">{new Date(ach.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>

                <div className="px-10 py-6 bg-brand-primary/5 border-t border-brand-sage/5 flex justify-between items-center backdrop-blur-xl relative overflow-hidden">
                   <span className="text-[9px] font-mono text-sub opacity-40 uppercase tracking-widest relative z-10">UID: {ach.id.slice(0, 14)}</span>
                   <div className="flex gap-3 relative z-10">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-[1.2rem] border border-brand-sage/10 transition-all"
                      >
                        <Edit3 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(ach.id)}
                        className="p-3 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-[1.2rem] border border-brand-sage/10 transition-all"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
