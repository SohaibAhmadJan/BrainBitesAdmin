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

const QuizzesPage = () => {
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
      <div className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <BrainCircuit className="text-amber-500" size={32} />
             Challenge Repository
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic uppercase tracking-widest">Psychometric Evaluation & Quizzes</p>
        </div>
        <div className="relative w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-900 border border-slate-800 rounded-[2rem] animate-pulse"></div>
          ))
        ) : filteredQuizzes.map((fact) => (
          <div key={fact.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl group hover:border-amber-500/30 transition-all flex flex-col lg:flex-row gap-8">

            <div className="lg:w-1/3 space-y-4">
               <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black rounded-full uppercase tracking-tighter">
                    {fact.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-700">FACT #{fact.id}</span>
               </div>
               <h3 className="text-sm font-bold text-slate-300 italic leading-relaxed">"{fact.fact}"</h3>
               <button className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                  <ExternalLink size={12} /> Go to Fact Editor
               </button>
            </div>

            <div className="flex-1 bg-slate-950/50 rounded-3xl p-6 border border-slate-800/50 space-y-6">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle size={12} /> The Challenge
                  </p>
                  <p className="text-white font-black text-lg">{fact.quizQuestion}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fact.quizOptions?.map((opt, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        fact.correctAnswerIndex === i
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                          : "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                      )}
                    >
                      <span className="text-sm font-medium">{opt}</span>
                      {fact.correctAnswerIndex === i && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  ))}
               </div>
            </div>

            <div className="lg:w-48 flex flex-col justify-between items-end py-4">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Teaser Type</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{fact.teaserType || 'DEFAULT'}</p>
               </div>
               <div className="flex gap-2">
                  <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-all">
                    <Plus size={18} />
                  </button>
                  <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-all">
                    <Edit3 size={18} />
                  </button>
               </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;
