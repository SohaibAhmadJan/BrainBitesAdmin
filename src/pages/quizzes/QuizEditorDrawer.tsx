import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Info,
  Search,
  BookOpen,
  AlertCircle,
  Puzzle,
  Edit3,
  ChevronDown
} from 'lucide-react';
import { BiteItem } from '../../types';
import { cn } from '../../utils/cn';
import { fetchBites } from '../../services/firestoreService';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ElasticButton from '../../components/ui/ElasticButton';
import toast from 'react-hot-toast';

interface QuizEditorDrawerProps {
  fact: BiteItem | null;
  existingQuizzes: string[];
  onClose: () => void;
  onSave: (fact: BiteItem) => void;
}

const QuizEditorDrawer: React.FC<QuizEditorDrawerProps> = ({ fact, existingQuizzes, onClose, onSave }) => {
  const { theme } = useTheme();
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [formData, setFormData] = useState<BiteItem>(fact || {
    id: '',
    fact: '',
    category: '',
    categoryId: '',
    title: null,
    snippet: null,
    fullFact: null,
    whyItMatters: null,
    quizQuestion: '',
    quizOptions: ['', '', '', ''],
    correctAnswerIndex: 0,
    teaserType: 'Standard',
    imageUrl: null,
    keywords: null,
    readTimeMinutes: 1,
    isPublished: true,
    isFeatured: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  useEffect(() => {
    fetchBites().then(setFacts);
  }, []);

  const filteredFacts = facts.filter(f =>
    (f.fact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 8);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id || !formData.fact) {
        newErrors.factId = "Fact association is required";
        toast.error("Please select a fact first");
    }
    if (!formData.quizQuestion?.trim()) newErrors.question = "Challenge prompt is required";
    if (!formData.quizOptions || formData.quizOptions.some(opt => !opt.trim())) {
        newErrors.options = "All 4 vectors must be defined";
        toast.error("Please fill all 4 response vectors");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSyncing(true);
      try {
        await onSave(formData);
      } catch (err: any) {
        toast.error(`Sync failed: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const content = (
    <div className="fixed inset-0 z-[1000] flex flex-col overflow-hidden bg-black/60 backdrop-blur-xl p-0">
      <motion.div
        {...DRAWER_TRANSITION}
        className={cn(
          "w-full h-full flex flex-col overflow-hidden border-[16px] relative rounded-[4.5rem] transition-colors duration-700",
          theme === 'dark'
            ? "bg-brand-bg border-brand-primary/60 shadow-[inset_0_0_150px_rgba(45,106,79,0.5)]"
            : "bg-[#F4F8F6] border-brand-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-10 flex items-center justify-between backdrop-blur-3xl sticky top-0 z-50 transition-colors duration-500",
          theme === 'dark' ? "bg-brand-surface/90" : "bg-white/95 shadow-sm"
        )}>
          <AnimatePresence>
            {isSyncing && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                className="absolute top-0 left-0 right-0 h-1 bg-brand-primary z-[100] origin-left shadow-[0_0_20px_rgba(45,106,79,0.8)]"
              />
            )}
          </AnimatePresence>
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={cn(
                "p-4 glass rounded-2xl transition-all shadow-xl",
                theme === 'dark' ? "text-sub hover:text-brand-primary border-brand-sage/10" : "text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20"
              )}
            >
              <X size={28} />
            </motion.button>
            <div>
              <h2 className={cn("text-4xl font-black tracking-tighter uppercase", theme === 'dark' ? "text-white" : "text-brand-primary")}>
                {fact ? 'Refine Logic' : 'Anchor Challenge'}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                 <p className={cn("text-xs font-black uppercase tracking-[0.2em] opacity-60", theme === 'dark' ? "text-sub" : "text-brand-primary")}>
                   {formData.id || 'NEW'} • Cognitive Protocol
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <ElasticButton onClick={handleSave} disabled={isSyncing} className="px-16 py-5 rounded-2xl text-base shadow-[0_0_30px_rgba(45,106,79,0.4)]">
               {isSyncing ? "Syncing..." : "Execute Sync"}
             </ElasticButton>
          </div>
        </div>

        {/* Matrix View */}
        <div className={cn("flex-1 overflow-hidden flex flex-col min-h-0", theme === 'dark' ? "bg-brand-bg" : "bg-transparent")}>
              <div
                className={cn("flex w-full h-full min-h-0 divide-x-2", theme === 'dark' ? "divide-brand-primary/20" : "divide-brand-primary/10")}
              >
                {/* Column 1: Identity & Context Matrix */}
                <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
                   <section className="flex-1 flex flex-col space-y-4 min-h-0">
                      <div className="flex items-center gap-3 text-brand-primary font-black">
                        <div className="p-2 bg-brand-primary/10 rounded-lg"><Info size={18} /></div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] opacity-70">Identity Node</h3>
                      </div>

                      <div className={cn("p-10 rounded-[3.5rem] flex-1 flex flex-col justify-start space-y-12 border-4 relative overflow-hidden transition-all duration-500 group/tile", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>
                         <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary"><BookOpen size={18} /></div>
                              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-sub opacity-60">Fact Association</h3>
                            </div>

                            <div className="relative">
                                {formData.fact ? (
                                  <div className={cn("p-8 rounded-3xl border-2 flex justify-between items-center group/link transition-all", theme === 'dark' ? "bg-black/40 border-brand-primary/30" : "bg-brand-primary/5 border-brand-primary/20")}>
                                     <div className="space-y-1">
                                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-70">Linked Sequence</p>
                                        <p className={cn("text-xl font-bold italic line-clamp-2 leading-relaxed", theme === 'dark' ? "text-brand-white" : "text-brand-primary")}>"{formData.fact}"</p>
                                     </div>
                                     {!fact && (
                                       <button
                                        onClick={() => setFormData({ ...formData, id: '', fact: '' })}
                                        className="p-3 hover:bg-red-500/10 text-sub hover:text-red-500 rounded-xl transition-all"
                                       >
                                         <X size={20} />
                                       </button>
                                     )}
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                     <div className="relative group/search">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within/search:text-brand-primary group-focus-within/search:opacity-100 transition-all" size={20} />
                                        <input
                                          onFocus={() => setIsSearchFocused(true)}
                                          className={cn("w-full border-2 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold uppercase tracking-widest focus:outline-none transition-all shadow-inner", theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}
                                          placeholder="Type keywords to find a fact..."
                                          value={searchTerm}
                                          onChange={e => setSearchTerm(e.target.value)}
                                        />
                                     </div>

                                     {/* Fact Search Dropdown Overlay */}
                                     <AnimatePresence>
                                      {isSearchFocused && (searchTerm.length > 0 || filteredFacts.length > 0) && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className={cn(
                                                "absolute left-0 right-0 top-full mt-4 z-[110] p-4 rounded-[2.5rem] border-4 shadow-2xl backdrop-blur-3xl overflow-hidden max-h-[400px] overflow-y-auto scrollbar-thin",
                                                theme === 'dark' ? "bg-brand-surface/95 border-brand-primary/30" : "bg-white/95 border-brand-primary/20"
                                            )}
                                          >
                                            {filteredFacts.length > 0 ? filteredFacts.map(f => (
                                              <button
                                                key={f.id}
                                                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss before click
                                                onClick={() => {
                                                    setFormData({ ...formData, id: f.id, fact: f.fact });
                                                    setIsSearchFocused(false);
                                                    setSearchTerm('');
                                                }}
                                                className={cn("w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-2 group/item shadow-md mb-2", theme === 'dark' ? "bg-black/20 border-brand-primary/10 hover:border-brand-primary/40" : "bg-white border-brand-primary/10 hover:border-brand-primary/30")}
                                              >
                                                  <span className="text-[12px] font-bold leading-relaxed">{f.fact}</span>
                                                  <div className="flex items-center gap-3">
                                                     <span className="text-[10px] font-mono opacity-40 uppercase">UID: {f.id.slice(0, 8)}</span>
                                                     {existingQuizzes.includes(f.id) && (
                                                         <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded-lg">Has Quiz</span>
                                                     )}
                                                  </div>
                                              </button>
                                            )) : (
                                                <div className="p-8 text-center text-sub opacity-40 font-bold uppercase tracking-widest text-[10px]">No matching facts found</div>
                                            )}
                                          </motion.div>
                                      )}
                                     </AnimatePresence>
                                  </div>
                                )}
                            </div>
                            {errors.factId && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4 animate-pulse"><AlertCircle size={14} /> Fact link required</p>}
                         </div>

                         <div className="space-y-4 pt-6">
                            <label className={cn("text-[11px] font-black uppercase tracking-[0.2em] ml-2", theme === 'dark' ? "text-brand-primary/70" : "text-brand-primary/90")}>Publication Protocol</label>
                            <button
                              onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                              className={cn(
                                "w-full py-5 rounded-2xl border-2 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-md",
                                formData.isPublished ? "bg-brand-primary/15 border-brand-primary/30 text-brand-primary" : "bg-brand-primary/5 border-brand-primary/10 text-sub opacity-60"
                              )}
                            >
                              <div className={cn("w-2.5 h-2.5 rounded-full", formData.isPublished ? "bg-brand-primary animate-pulse" : "bg-sub")} />
                              {formData.isPublished ? 'Active' : 'Draft'}
                            </button>
                         </div>
                      </div>
                   </section>
                </div>

                {/* Column 2: Challenge Logic Engine */}
                <div className="flex-1 flex flex-col h-full min-h-0 p-10 space-y-10">
                   <section className="flex-1 flex flex-col space-y-4 min-h-0">
                      <div className="flex items-center gap-3 text-brand-gold font-black">
                        <div className="p-2 bg-brand-gold/10 rounded-lg"><Puzzle size={18} /></div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] opacity-70">Challenge Logic</h3>
                      </div>

                      <div className={cn("p-10 rounded-[4rem] flex-1 flex flex-col border-4 transition-all duration-500 min-h-0 space-y-10 overflow-y-auto scrollbar-thin", theme === 'dark' ? "bg-brand-surface/40 border-brand-primary/15 shadow-2xl backdrop-blur-2xl" : "bg-white/90 border-brand-primary/10 shadow-xl")}>
                         <div className="space-y-4">
                            <label className={cn("text-[11px] font-black uppercase tracking-[0.2em] ml-6", theme === 'dark' ? "text-brand-primary/70" : "text-brand-primary/90")}>Challenge Prompt</label>
                            <textarea
                              className={cn("w-full border-2 rounded-[2.5rem] p-10 text-2xl font-black tracking-tighter focus:outline-none transition-all resize-none shadow-inner leading-tight", errors.question ? "border-red-500/50 bg-red-500/5" : "focus:border-brand-primary/50", theme === 'dark' ? "bg-black/30 border-brand-primary/10 text-brand-white" : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary")}
                              rows={3}
                              placeholder="Define the psychometric challenge..."
                              value={formData.quizQuestion || ''}
                              onChange={(e) => setFormData({...formData, quizQuestion: e.target.value})}
                            />
                         </div>

                         <div className="space-y-6">
                            <label className={cn("text-[11px] font-black uppercase tracking-[0.2em] ml-6", theme === 'dark' ? "text-brand-primary/70" : "text-brand-primary/90")}>Truth Vectors (Options)</label>
                            <div className="grid grid-cols-1 gap-6">
                               {formData.quizOptions?.map((opt, idx) => (
                                 <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center px-6">
                                       <span className="text-[10px] font-black text-sub opacity-50 uppercase tracking-[0.2em]">Vector {idx + 1}</span>
                                       <button
                                          onClick={() => setFormData({...formData, correctAnswerIndex: idx})}
                                          className={cn(
                                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border shadow-sm",
                                            formData.correctAnswerIndex === idx
                                              ? "bg-brand-primary text-white border-brand-primary/30 shadow-[0_0_15px_rgba(45,106,79,0.4)]"
                                              : "bg-black/5 border-transparent text-sub opacity-50 hover:opacity-100 hover:border-brand-primary/20"
                                          )}
                                       >
                                          {formData.correctAnswerIndex === idx ? 'Correct Response' : 'Mark Truth'}
                                       </button>
                                    </div>
                                    <input
                                      className={cn("w-full border-2 rounded-2xl px-8 py-5 text-[14px] font-bold tracking-wide transition-all shadow-inner focus:outline-none", formData.correctAnswerIndex === idx ? "border-brand-primary/40 ring-2 ring-brand-primary/10" : "border-brand-primary/20 focus:border-brand-primary/40", theme === 'dark' ? "bg-black/30 text-brand-white" : "bg-brand-primary/5 text-brand-primary")}
                                      value={opt}
                                      placeholder={`Enter response vector ${idx + 1}...`}
                                      onChange={(e) => {
                                        const newOpts = [...(formData.quizOptions || ['', '', '', ''])];
                                        newOpts[idx] = e.target.value;
                                        setFormData({...formData, quizOptions: newOpts});
                                      }}
                                    />
                                 </div>
                               ))}
                            </div>
                            {errors.options && <p className="text-[11px] text-red-500 font-black uppercase flex items-center gap-2 ml-6 animate-pulse"><AlertCircle size={14} /> Complete all response vectors</p>}
                         </div>
                      </div>
                   </section>
                </div>
              </div>
        </div>
      </motion.div>
    </div>
  );
  return createPortal(content, document.body);
};

export default QuizEditorDrawer;
