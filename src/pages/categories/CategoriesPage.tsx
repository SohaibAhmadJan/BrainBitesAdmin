import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  FileText,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  PieChart,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { BiteCategory, BiteCategories, BiteItem, QuoteItem } from '../../types';
import { fetchBites, fetchQuotes } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

const CategoriesPage = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, { facts: number, quotes: number, quizzes: number }>>({});

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = async () => {
    setLoading(true);
    try {
      const [facts, quotes] = await Promise.all([
        fetchBites(),
        fetchQuotes()
      ]);

      const newStats: any = {};
      BiteCategories.forEach(cat => {
        const catFacts = facts.filter(f => f.category === cat);
        newStats[cat] = {
          facts: catFacts.length,
          quotes: quotes.filter(q => q.category === cat).length,
          quizzes: catFacts.filter(f => f.quizQuestion).length
        };
      });
      setStats(newStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: BiteCategory) => {
    switch (category) {
      case 'Human Behavior': return 'from-brand-primary/20 to-brand-primary/5 border-brand-primary/20 text-brand-primary';
      case 'Mental Health': return 'from-brand-secondary/20 to-brand-secondary/5 border-brand-secondary/20 text-brand-secondary';
      case 'Brain Science': return 'from-brand-gold/20 to-brand-gold/5 border-brand-gold/20 text-brand-gold';
      case 'Love & Attraction': return 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-500';
      case 'Personality Traits': return 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-500';
      case 'Body Language': return 'from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-500';
      case 'Subconscious Mind': return 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-500';
      case 'Social Psychology': return 'from-brand-primary/20 to-brand-primary/5 border-brand-primary/20 text-brand-primary';
      case 'Habits & Motivation': return 'from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-500';
      case 'Memory & Learning': return 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-500';
      default: return 'from-brand-white/10 to-brand-white/5 border-brand-white/10 text-main';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="glass p-8 rounded-[2.5rem] shadow-xl flex justify-between items-end relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <Layers className="text-brand-primary" size={32} />
             Domain Dashboard
          </h2>
          <p className="text-sub text-sm mt-1 font-medium italic">Fixed psychological categories & content distribution</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="text-right">
              <p className="text-[10px] font-black text-sub uppercase tracking-widest">Total Domains</p>
              <p className="text-xl font-black">{BiteCategories.length}</p>
           </div>
           <div className="w-px h-10 bg-brand-sage/20 self-center mx-2"></div>
           <div className="text-right">
              <p className="text-[10px] font-black text-sub uppercase tracking-widest">Master Coverage</p>
              <p className="text-xl font-black text-brand-primary">100%</p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 glass rounded-[2.5rem] animate-pulse"></div>
          ))
        ) : BiteCategories.map((cat) => (
          <div key={cat} className={cn(
            "bg-gradient-to-br border p-8 rounded-[2.5rem] shadow-2xl transition-all group hover:scale-[1.02]",
            getCategoryColor(cat)
          )}>
            <div className="flex justify-between items-start mb-8">
               <div className={cn(
                 "p-3 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner",
                 theme === 'dark' ? "bg-brand-bg/40" : "bg-white/40"
               )}>
                  <PieChart size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">System Core</span>
            </div>

            <h3 className="text-2xl font-black mb-6 tracking-tight">{cat}</h3>

            <div className="grid grid-cols-3 gap-4">
               <div className="space-y-1">
                  <p className="text-[9px] font-black opacity-50 uppercase flex items-center gap-1"><FileText size={10} /> Facts</p>
                  <p className="text-lg font-black">{stats[cat]?.facts || 0}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black opacity-50 uppercase flex items-center gap-1"><MessageSquare size={10} /> Quotes</p>
                  <p className="text-lg font-black">{stats[cat]?.quotes || 0}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black opacity-50 uppercase flex items-center gap-1"><HelpCircle size={10} /> Quizzes</p>
                  <p className="text-lg font-black">{stats[cat]?.quizzes || 0}</p>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className={cn(
                      "w-6 h-6 rounded-full border-2",
                      theme === 'dark' ? "bg-brand-bg border-brand-surface" : "bg-brand-primary/5 border-white"
                    )} />
                  ))}
               </div>
               <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                  Manage Domain <ArrowRight size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
