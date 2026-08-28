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
  SearchX,
  Trophy
} from 'lucide-react';
import {
  writeBatch,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { useAdmin } from '../../context/AdminContext';
import { BiteItem, QuizQuestion } from '../../types';
import { fetchBites, fetchQuizzes } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import QuizEditorDrawer from './QuizEditorDrawer';
import PremiumCard from '../../components/ui/PremiumCard';
import toast from 'react-hot-toast';

const QuizzesPage = () => {
  const { theme } = useTheme();
  const { adminUser } = useAdmin();
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFact, setSelectedFact] = useState<BiteItem | null>(null);
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

  const handleEdit = (fact: BiteItem | null = null) => {
    setSelectedFact(fact);
    setIsEditorOpen(true);
  };

  const handleSave = async (updatedFact: BiteItem) => {
    if (!db || !adminUser) {
        toast.error('Security protocol not initialized');
        return;
    }

    try {
      const batch = writeBatch(db);

      // Separate Collection Sync: Write to 'quizzes' collection
      const quizRef = doc(db, 'quizzes', updatedFact.id);
      const quizData: Partial<QuizQuestion> = {
        factId: updatedFact.id,
        question: updatedFact.quizQuestion || '',
        options: updatedFact.quizOptions || [],
        correctAnswerIndex: updatedFact.correctAnswerIndex || 0,
        teaserType: updatedFact.teaserType || 'Standard',
        isActive: updatedFact.isPublished,
        updatedAt: Date.now()
      };

      batch.set(quizRef, quizData, { merge: true });

      // Audit Log
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'UPDATE_QUIZ_SEPARATE',
        targetType: 'QUIZ',
        targetId: updatedFact.id,
        reason: 'Challenge anchored to separate collection (Spark Plan)',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Cognitive challenge anchored');
      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(`Anchor failure: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dissolve this cognitive challenge?')) return;
    if (!db || !adminUser) {
        toast.error('Security protocol not initialized');
        return;
    }

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'quizzes', id));

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      batch.set(doc(db, 'audit_logs', logId), {
        adminUid: adminUser.uid,
        action: 'DELETE_QUIZ_SEPARATE',
        targetType: 'QUIZ',
        targetId: id,
        reason: 'Cognitive challenge dissolved',
        createdAt: Date.now()
      });

      await batch.commit();
      toast.success('Challenge dissolved');
      loadData();
    } catch (err: any) {
      toast.error(`Dissolve failed: ${err.message}`);
    }
  };

  // Merge Facts and Quizzes for Display
  const mergedQuizzes = facts.map(f => {
    const q = quizzes.find(quiz => quiz.factId === f.id);
    if (!q) return null;
    return {
      ...f,
      quizQuestion: q.question,
      quizOptions: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      teaserType: q.teaserType,
      isPublished: q.isActive
    };
  }).filter(Boolean) as BiteItem[];

  const filteredQuizzes = mergedQuizzes.filter(f =>
    f.quizQuestion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.fact.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 glass rounded-[3rem] animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))
        ) : filteredQuizzes.length === 0 ? (
          <EmptyBuffer
            icon={BrainCircuit}
            title="Zero Challenges Active"
            message="No cognitive inquiry nodes found in the current challenge nexus buffer."
          />
        ) : (
          <AnimatePresence>
            {filteredQuizzes.map((fact, idx) => {
              const isPremium = fact.teaserType === 'Premium';
              const isLogicHeavy = fact.teaserType === 'Logic-Heavy';

              return (
                <PremiumCard
                  key={fact.id}
                  glowColor={
                    isPremium ? 'rgba(233, 196, 106, 0.12)' :
                    isLogicHeavy ? 'rgba(109, 104, 117, 0.12)' :
                    'rgba(45, 106, 79, 0.12)'
                  }
                  className={cn(
                    "flex flex-col gap-6 p-6 transition-all duration-500",
                    isPremium && "border-brand-gold/20 shadow-[0_20px_50px_rgba(233, 196, 106,0.08)]",
                    isLogicHeavy && "border-indigo-500/10"
                  )}
                >
                  {/* Universal Header Block */}
                  <div className="flex justify-between items-start mb-2">
                     <div className={cn("w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 relative bg-brand-bg/50 border-2 border-brand-sage/20 text-brand-primary/60")}>
                        <Trophy size={32} />
                     </div>

                     <div className="flex flex-col items-end gap-3">
                        <span className="text-[12px] font-mono text-sub opacity-50 font-bold tracking-[0.1em]">UID: {fact.id.slice(0, 8)}</span>
                        <ActionBadge variant={fact.isPublished ? 'success' : 'warning'} className="font-black text-[11px]">
                          {fact.isPublished ? 'Active' : 'Draft'}
                        </ActionBadge>
                        <div className="flex gap-2">
                           <motion.button
                             whileHover={{ scale: 1.1 }}
                             onClick={(e) => { e.stopPropagation(); handleEdit(fact); }}
                             className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-brand-primary rounded-xl border border-brand-sage/10 transition-all shadow-md"
                           >
                             <Edit3 size={16} />
                           </motion.button>
                           <motion.button
                             whileHover={{ scale: 1.1 }}
                             onClick={(e) => { e.stopPropagation(); handleDelete(fact.id); }}
                             className="p-2.5 bg-brand-bg/5 dark:bg-brand-bg text-sub hover:text-red-500 rounded-xl border border-brand-sage/10 transition-all shadow-md"
                           >
                             <Trash2 size={16} />
                           </motion.button>
                        </div>
                     </div>
                  </div>

                  {/* Fact Context Segment */}
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary opacity-40">Fact Context • {fact.category}</p>
                     </div>
                     <p className="text-[14px] font-semibold leading-relaxed italic border-l-4 border-brand-primary/20 pl-5 text-sub/80 line-clamp-3">
                        "{fact.fact}"
                     </p>
                  </div>

                  {/* Challenge Logic Segment */}
                  <div className={cn(
                    "flex-1 rounded-[2rem] p-6 border space-y-6 shadow-inner relative overflow-hidden flex flex-col justify-center mt-2 border-t-brand-primary/10",
                    theme === 'dark' ? "bg-black/30 border-brand-primary/10" : "bg-brand-primary/5 border-brand-primary/5"
                  )}>
                     <div className="space-y-2">
                        <p className="text-[11px] font-black text-brand-gold uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                          <BrainCircuit size={14} /> Challenge Prompt
                        </p>
                        <p className="text-base font-bold tracking-tight leading-snug text-brand-white/90">{fact.quizQuestion}</p>
                     </div>

                     <div className="grid grid-cols-1 gap-2.5">
                        {fact.quizOptions?.map((opt, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-3 px-5 rounded-xl border flex items-center justify-between transition-all group/opt shadow-sm",
                              fact.correctAnswerIndex === i
                                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                                : theme === 'dark' ? "bg-black/40 border-brand-sage/5 text-sub/60" : "bg-white border-brand-primary/5 text-sub/60"
                            )}
                          >
                            <span className="text-[12px] font-medium">{opt}</span>
                            {fact.correctAnswerIndex === i && <CheckCircle2 size={14} className="text-brand-primary" />}
                          </div>
                        ))}
                     </div>
                  </div>
                </PremiumCard>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <QuizEditorDrawer
            fact={selectedFact}
            existingQuizzes={quizzes.map(q => q.factId)}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizzesPage;
