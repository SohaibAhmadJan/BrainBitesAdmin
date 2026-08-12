import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Edit3,
  SearchX
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
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <BrainCircuit className="text-brand-gold" size={32} />
             </div>
             Challenge Repository
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Psychometric Evaluation • Interactive Sequence Logic</p>
        </div>

        <div className="relative w-full md:w-[30rem] group z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-gold transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search quiz nodes..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-inner backdrop-blur-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 glass rounded-[3rem] animate-pulse"></div>
          ))
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-40 text-center glass rounded-[3rem] border border-dashed border-brand-sage/20 opacity-40">
             <SearchX size={80} className="mx-auto text-brand-gold mb-6" />
             <p className="text-2xl font-black uppercase tracking-[0.3em]">Zero challenges in current buffer</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredQuizzes.map((fact, idx) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-[3rem] p-10 shadow-xl group hover:border-brand-gold/20 transition-all flex flex-col lg:flex-row gap-10 relative overflow-hidden"
              >
                <div className="lg:w-1/3 space-y-6 relative z-10">
                   <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
                        {fact.category}
                      </span>
                      <span className="text-[10px] font-mono text-sub opacity-40 font-black tracking-widest uppercase">ID: {fact.id.slice(0, 8)}</span>
                   </div>
                   <p className="text-lg font-bold leading-relaxed italic opacity-80 border-l-2 border-brand-sage/10 pl-6">
                      {fact.fact}
                   </p>
                   <motion.button
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:opacity-70 transition-all"
                   >
                      <ExternalLink size={14} /> Open Sequence Editor
                   </motion.button>
                </div>

                <div className={cn(
                  "flex-1 rounded-[2.5rem] p-8 border space-y-8 shadow-inner relative z-10",
                  theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/10" : "bg-brand-primary/5 border-brand-primary/5"
                )}>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] flex items-center gap-2">
                        <HelpCircle size={14} /> Critical Challenge Logic
                      </p>
                      <p className="text-2xl font-black tracking-tight leading-tight">{fact.quizQuestion}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fact.quizOptions?.map((opt, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-5 rounded-2xl border flex items-center justify-between transition-all group/opt shadow-sm",
                            fact.correctAnswerIndex === i
                              ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                              : theme === 'dark' ? "bg-brand-bg/40 border-brand-sage/5 text-sub opacity-60" : "bg-white border-brand-primary/5 text-sub opacity-60"
                          )}
                        >
                          <span className="text-sm font-bold">{opt}</span>
                          {fact.correctAnswerIndex === i && <CheckCircle2 size={18} className="text-brand-primary shadow-xl" />}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="lg:w-48 flex flex-col justify-between items-end py-4 relative z-10">
                   <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-sub opacity-30 uppercase tracking-[0.2em]">Deployment Tier</p>
                      <p className="text-sm font-black text-brand-primary tracking-tighter uppercase">{fact.teaserType || 'Standard'}</p>
                   </div>
                   <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-4 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-[1.2rem] border border-brand-sage/10 transition-all shadow-xl"
                      >
                        <Edit3 size={20} />
                      </motion.button>
                   </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-gold/5 blur-[80px] rounded-full group-hover:opacity-10 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
