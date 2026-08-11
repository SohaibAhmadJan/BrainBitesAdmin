import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BrainCircuit,
  MessageSquareQuote,
  Edit3
} from 'lucide-react';
import { BiteItem } from '../../types';
import { fetchBites } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

const QuizzesPage = () => {
  const { theme } = useTheme();
  const [factsWithQuizzes, setFactsWithQuizzes] = useState<BiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allFacts = await fetchBites();
      setFactsWithQuizzes(allFacts.filter(f => f.quizQuestion));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = factsWithQuizzes.filter(f =>
    f.quizQuestion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.fact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="glass p-8 rounded-[2.5rem] shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <BrainCircuit className="text-brand-gold" size={32} />
             Challenge Repository
          </h2>
          <p className="text-sub text-sm mt-1 font-medium italic uppercase tracking-widest">Psychometric Evaluation & Quizzes</p>
        </div>
        <div className="relative w-80 group z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-gold transition-colors" size={16} />
          <input
            type="text"
            placeholder="Query quizzes..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-brand-gold/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 glass rounded-[2rem] animate-pulse"></div>
          ))
        ) : filteredQuizzes.map((fact) => (
          <div key={fact.id} className="glass rounded-[2rem] p-8 shadow-xl group hover:border-brand-gold/30 transition-all flex flex-col lg:flex-row gap-8">

            <div className="lg:w-1/3 space-y-4">
               <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm">
                    {fact.category}
                  </span>
                  <span className="text-[10px] font-mono text-sub opacity-40 uppercase font-black tracking-widest">FACT #{fact.id.slice(0, 8)}</span>
               </div>
               <h3 className="text-sm font-bold text-sub italic leading-relaxed">"{fact.fact}"</h3>
               <button className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:opacity-70 transition-all">
                  <ExternalLink size={12} /> Go to Sequence Editor
               </button>
            </div>

            <div className={cn(
              "flex-1 rounded-3xl p-6 border space-y-6 shadow-inner",
              theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/10" : "bg-brand-primary/5 border-brand-primary/10"
            )}>
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-sub opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle size={12} /> Challenging Thought
                  </p>
                  <p className="font-black text-lg">{fact.quizQuestion}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fact.quizOptions?.map((opt, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all shadow-sm",
                        fact.correctAnswerIndex === i
                          ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                          : theme === 'dark' ? "bg-brand-bg/40 border-brand-sage/10 text-sub opacity-60" : "bg-white border-brand-primary/5 text-sub opacity-60"
                      )}
                    >
                      <span className="text-sm font-semibold">{opt}</span>
                      {fact.correctAnswerIndex === i && <CheckCircle2 size={16} className="text-brand-primary" />}
                    </div>
                  ))}
               </div>
            </div>

            <div className="lg:w-48 flex flex-col justify-between items-end py-4">
               <div className="text-right">
                  <p className="text-[10px] font-black text-sub opacity-40 uppercase tracking-widest">Mechanism</p>
                  <p className="text-xs font-bold text-brand-primary mt-1 uppercase tracking-tighter">{fact.teaserType || 'STANDARD'}</p>
               </div>
               <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-3 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-2xl border border-brand-sage/10 transition-all"
                  >
                    <Plus size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-3 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-2xl border border-brand-sage/10 transition-all"
                  >
                    <Edit3 size={18} />
                  </motion.button>
               </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;
