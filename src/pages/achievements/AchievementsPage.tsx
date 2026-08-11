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
import { fetchAchievements, createOrUpdateAchievement, deleteAchievement } from '../../services/firestoreService';
import toast from 'react-hot-toast';

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
      icon: '🏆',
      maxProgress: 1,
      points: 10,
      type: 'MILESTONE',
      isActive: true
    };
    try {
      await createOrUpdateAchievement(newAch);
      setAchievements([newAch, ...achievements]);
      toast.success('Milestone initialized');
    } catch (err) {
      toast.error('Initialization failed');
    }
  };

  const toggleStatus = async (ach: Achievement) => {
    const updated = { ...ach, isActive: !ach.isActive };
    try {
      await createOrUpdateAchievement(updated);
      setAchievements(prev => prev.map(a => a.id === ach.id ? updated : a));
      toast.success(updated.isActive ? 'Achievement active' : 'Achievement archived');
    } catch (err) {
      toast.error('State toggle failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dissolve this achievement definition?')) return;
    try {
      await deleteAchievement(id);
      setAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Definition expunged');
    } catch (err) {
      toast.error('Expunge failed');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
       <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Trophy className="text-brand-gold" size={32} />
             </div>
             Reward Architecture
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Gamification Mechanics • Milestone Logic</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddAchievement}
          className="relative z-10 flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/30 text-xs uppercase tracking-widest whitespace-nowrap"
        >
          <Plus size={20} strokeWidth={3} />
          Create Definition
        </motion.button>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
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
                        {ach.icon}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                          ach.type === 'MILESTONE' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" :
                          ach.type === 'SOCIAL' ? "bg-pink-500/10 border-pink-500/20 text-pink-500" :
                          "bg-brand-bg/5 dark:bg-brand-bg border-brand-sage/10 text-sub"
                        )}>
                          {ach.type}
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
                           <Star size={12} className="text-brand-gold" /> Rewards
                        </p>
                        <p className="text-base font-black text-brand-gold">{ach.points} BB Points</p>
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
