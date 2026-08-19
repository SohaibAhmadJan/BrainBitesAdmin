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
  Trash2,
  SearchX
} from 'lucide-react';
import { BiteItem, QuizQuestion } from '../../types';
import { fetchBites, fetchQuizzes } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import QuizEditorDrawer from './QuizEditorDrawer';
import { updateQuiz, deleteQuiz } from '../../services/adminApi';
import toast from 'react-hot-toast';

const QuizzesPage = () => {
  const { theme } = useTheme();
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizQuestion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allFacts, allQuizzes] = await Promise.all([
          fetchBites(),
          fetchQuizzes()
      ]);
      setFacts(allFacts);
      setQuizzes(allQuizzes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync challenge nexus');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz: QuizQuestion | null = null) => {
    setSelectedQuiz(quiz);
    setIsEditorOpen(true);
  };

  const handleSave = async (quiz: QuizQuestion) => {
    try {
      await updateQuiz(quiz.id, quiz, 'Administrative challenge update');
      toast.success('Challenge anchored successfully (Atomic)');
      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(`Sync failure: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dissolve this logical challenge?')) return;
    try {
      await deleteQuiz(id, 'Manual challenge removal');
      toast.success('Challenge dissolved');
      loadData();
    } catch (err: any) {
      toast.error(`Dissolution failed: ${err.message}`);
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const fact = facts.find(f => f.id === q.factId);
    return q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           fact?.fact.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
             Challenge <span className="text-brand-primary">Nexus</span>
           </motion.h1>
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="warning" className="px-5 py-1.5">Interactive Hub</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Psychometric Sequence Verification</p>
           </div>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={() => handleEdit(null)}>
              <Plus size={18} strokeWidth={3} />
              Anchor Challenge
           </ElasticButton>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search interactive challenges by content..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 glass rounded-[3rem] animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))
        ) : filteredQuizzes.length === 0 ? (
          <EmptyBuffer
            icon={BrainCircuit}
            title="Zero Challenges Active"
            message="No psychometric evaluation nodes found in the current challenge nexus buffer."
          />
        ) : (
          <AnimatePresence>
            {filteredQuizzes.map((quiz, idx) => {
              const fact = facts.find(f => f.id === quiz.factId);
              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-[3rem] p-10 shadow-xl group hover:border-brand-gold/20 transition-all flex flex-col lg:flex-row gap-10 relative overflow-hidden"
                >
                  <div className="lg:w-1/3 space-y-6 relative z-10">
                     <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
                          {fact?.category || 'Unknown'}
                        </span>
                        <span className="text-[10px] font-mono text-sub opacity-40 font-black tracking-widest uppercase">ID: {quiz.id.slice(0, 8)}</span>
                     </div>
                     <p className="text-lg font-bold leading-relaxed italic opacity-80 border-l-2 border-brand-sage/10 pl-6">
                        {fact?.fact || 'Fact record missing...'}
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
                        <p className="text-2xl font-black tracking-tight leading-tight">{quiz.question}</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quiz.options?.map((opt, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-5 rounded-2xl border flex items-center justify-between transition-all group/opt shadow-sm",
                              quiz.correctAnswerIndex === i
                                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                                : theme === 'dark' ? "bg-brand-bg/40 border-brand-sage/5 text-sub opacity-60" : "bg-white border-brand-primary/5 text-sub opacity-60"
                            )}
                          >
                            <span className="text-sm font-bold">{opt}</span>
                            {quiz.correctAnswerIndex === i && <CheckCircle2 size={18} className="text-brand-primary shadow-xl" />}
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="lg:w-48 flex flex-col justify-between items-end py-4 relative z-10">
                     <div className="text-right space-y-1">
                        <p className="text-[9px] font-black text-sub opacity-30 uppercase tracking-[0.2em]">Deployment Tier</p>
                        <p className="text-sm font-black text-brand-primary tracking-tighter uppercase">{quiz.teaserType || 'Standard'}</p>
                     </div>
                     <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleEdit(quiz)}
                          className="p-4 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-[1.2rem] border border-brand-sage/10 transition-all shadow-xl"
                        >
                          <Edit3 size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(quiz.id)}
                          className="p-4 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-[1.2rem] border border-brand-sage/10 transition-all shadow-xl"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                     </div>
                  </div>

                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-gold/5 blur-[80px] rounded-full group-hover:opacity-10 transition-opacity" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <QuizEditorDrawer
            quiz={selectedQuiz}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizzesPage;
