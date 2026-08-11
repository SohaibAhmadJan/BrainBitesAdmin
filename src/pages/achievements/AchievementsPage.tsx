import React, { useState, useEffect } from 'react';
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

import { Achievement } from '../../types';
import { fetchAchievements, createOrUpdateAchievement, deleteAchievement } from '../../services/firestoreService';
import toast from 'react-hot-toast';

const AchievementsPage = () => {
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
      description: 'Describe the milestone...',
      icon: '🏆',
      maxProgress: 1,
      points: 10,
      type: 'MILESTONE',
      isActive: true
    };
    try {
      await createOrUpdateAchievement(newAch);
      setAchievements([newAch, ...achievements]);
      toast.success('Achievement defined');
    } catch (err) {
      toast.error('Failed to create');
    }
  };

  const toggleStatus = async (ach: Achievement) => {
    const updated = { ...ach, isActive: !ach.isActive };
    try {
      await createOrUpdateAchievement(updated);
      setAchievements(prev => prev.map(a => a.id === ach.id ? updated : a));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await deleteAchievement(id);
      setAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Achievement removed');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Trophy className="text-yellow-500" size={32} />
             Reward System
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gamification architecture & milestone definitions</p>
        </div>
        <button
          onClick={handleAddAchievement}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black px-8 py-3 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-95 text-sm uppercase tracking-widest"
        >
          <Plus size={18} strokeWidth={3} />
          Define Achievement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-[2rem] animate-pulse"></div>
          ))
        ) : achievements.length === 0 ? (
          <div className="md:col-span-2 2xl:col-span-3 py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 gap-4">
            <Trophy size={48} className="opacity-10" />
            <p className="font-bold uppercase tracking-widest text-xs">No achievements defined in the cloud</p>
          </div>
        ) : achievements.map((ach) => (
          <div key={ach.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-yellow-500/30 transition-all flex flex-col">
            <div className="p-8 space-y-6">
               <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl border border-slate-700 shadow-inner group-hover:bg-yellow-500/10 group-hover:border-yellow-500/30 transition-all">
                    {ach.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      ach.type === 'MILESTONE' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                      ach.type === 'SOCIAL' ? "bg-pink-500/10 border-pink-500/20 text-pink-400" :
                      "bg-slate-800 border-slate-700 text-slate-500"
                    )}>
                      {ach.type}
                    </span>
                    <button
                      onClick={() => toggleStatus(ach)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        ach.isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-slate-600 hover:bg-slate-800"
                      )}
                    >
                      {ach.isActive ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
               </div>

               <div>
                  <h3 className="text-xl font-black text-white">{ach.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed font-medium">{ach.description}</p>
               </div>

               <div className="pt-6 border-t border-slate-800/50 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                       <Target size={10} /> Requirement
                    </p>
                    <p className="text-xs font-bold text-slate-300">{ach.maxProgress} Steps</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                       <Zap size={10} /> Rewards
                    </p>
                    <p className="text-xs font-bold text-yellow-500">{ach.points} BB Points</p>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-slate-950/30 border-t border-slate-800 flex justify-between items-center px-8">
               <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">ID: {ach.id}</span>
               <div className="flex gap-2">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(ach.id)}
                    className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
