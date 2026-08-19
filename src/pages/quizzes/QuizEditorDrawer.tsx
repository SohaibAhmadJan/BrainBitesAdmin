import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, HelpCircle, CheckCircle2, Info, Search, BookOpen, AlertCircle } from 'lucide-react';
import { QuizQuestion, BiteItem } from '../../types';
import { cn } from '../../utils/cn';
import { fetchBites } from '../../services/firestoreService';
import { useTheme } from '../../context/ThemeContext';
import { DRAWER_TRANSITION } from '../../utils/animations';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';

interface QuizEditorDrawerProps {
  quiz: QuizQuestion | null;
  onClose: () => void;
  onSave: (quiz: QuizQuestion) => void;
}

const QuizEditorDrawer: React.FC<QuizEditorDrawerProps> = ({ quiz, onClose, onSave }) => {
  const { theme } = useTheme();
  const [facts, setFacts] = useState<BiteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<QuizQuestion>({
    id: quiz?.id || `q-${Math.random().toString(36).slice(2, 11)}`,
    factId: quiz?.factId || '',
    question: quiz?.question || '',
    options: quiz?.options || ['', '', '', ''],
    correctAnswerIndex: quiz?.correctAnswerIndex ?? 0,
    teaserType: quiz?.teaserType || 'Standard',
    isActive: quiz?.isActive ?? true,
    createdAt: quiz?.createdAt || Date.now(),
    updatedAt: quiz?.updatedAt || Date.now()
  });

  useEffect(() => {
    fetchBites().then(setFacts);
  }, []);

  const selectedFact = facts.find(f => f.id === formData.factId);
  const filteredFacts = facts.filter(f =>
    f.fact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.factId) newErrors.factId = "Fact link is required";
    if (!formData.question.trim()) newErrors.question = "Question text is required";
    if (formData.options.some(opt => !opt.trim())) newErrors.options = "All 4 options must be filled";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        {...DRAWER_TRANSITION}
        className={cn(
          "relative w-full max-w-2xl border-l shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden",
          theme === 'dark' ? "bg-brand-surface border-brand-sage/20" : "bg-white border-brand-primary/10"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-10 border-b flex items-center justify-between backdrop-blur-3xl sticky top-0 z-10",
          theme === 'dark' ? "bg-brand-surface/80 border-brand-sage/10" : "bg-white/80 border-brand-primary/5"
        )}>
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-4 glass rounded-2xl text-sub hover:text-brand-primary transition-all border-brand-sage/10 shadow-xl"
            >
              <X size={28} />
            </motion.button>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">
                {quiz ? 'Refine Logic' : 'Anchor Challenge'}
              </h2>
            </div>
          </div>
          <ElasticButton onClick={handleSave} className="px-8 py-4 rounded-2xl">
            <Save size={20} /> Execute Sync
          </ElasticButton>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">

          {/* Fact Association */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary"><BookOpen size={18} /></div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Fact Association</h3>
            </div>

            {selectedFact ? (
              <div className="glass p-6 rounded-3xl border-brand-primary/30 flex justify-between items-center group">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-primary uppercase">Linked Sequence</p>
                    <p className="text-sm font-bold italic line-clamp-1">"{selectedFact.fact}"</p>
                 </div>
                 <button
                  onClick={() => setFormData({...formData, factId: ''})}
                  className="p-2 hover:bg-red-500/10 text-sub hover:text-red-500 rounded-lg transition-all"
                 >
                   <X size={16} />
                 </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
                    <input
                      className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
                      placeholder="Search Fact Repository by title or ID..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {searchTerm.length > 1 && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                       {filteredFacts.map(f => (
                         <button
                           key={f.id}
                           onClick={() => setFormData({...formData, factId: f.id})}
                           className="w-full text-left p-4 rounded-xl glass border-brand-sage/5 hover:border-brand-primary/30 transition-all flex justify-between items-center group"
                         >
                            <span className="text-xs font-bold truncate pr-4">{f.fact}</span>
                            <span className="text-[9px] font-mono opacity-40 uppercase shrink-0">ID: {f.id.slice(0, 8)}</span>
                         </button>
                       ))}
                    </div>
                 )}
              </div>
            )}
            {errors.factId && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4"><AlertCircle size={12} /> {errors.factId}</p>}
          </section>

          {/* Logic Matrix */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-gold/10 rounded-xl text-brand-gold"><HelpCircle size={18} /></div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Challenge Logic</h3>
            </div>

            <div className="glass p-8 rounded-[3rem] space-y-10 shadow-inner border-brand-sage/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Question Sequence</label>
                  <textarea
                    className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl p-6 text-base font-bold focus:outline-none focus:border-brand-primary/50 transition-all resize-none shadow-inner"
                    rows={3}
                    value={formData.question}
                    onChange={e => setFormData({...formData, question: e.target.value})}
                  />
                  {errors.question && <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-2 ml-4"><AlertCircle size={12} /> {errors.question}</p>}
                </div>

                <div className="grid grid-cols-1 gap-6">
                   {formData.options.map((opt, idx) => (
                     <div key={idx} className="space-y-3">
                        <div className="flex justify-between items-center ml-2">
                           <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em]">Option {idx + 1}</label>
                           <button
                             onClick={() => setFormData({...formData, correctAnswerIndex: idx})}
                             className={cn(
                               "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                               formData.correctAnswerIndex === idx
                                 ? "bg-brand-primary text-brand-white border-brand-primary/50 shadow-lg"
                                 : "glass border-brand-sage/10 text-sub opacity-40 hover:opacity-100"
                             )}
                           >
                             {formData.correctAnswerIndex === idx ? 'Correct Answer' : 'Mark Correct'}
                           </button>
                        </div>
                        <input
                          className={cn(
                            "w-full bg-brand-bg/5 dark:bg-brand-bg/50 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all shadow-inner",
                            formData.correctAnswerIndex === idx ? "border-brand-primary/40" : "border-brand-sage/20 focus:border-brand-primary/30"
                          )}
                          value={opt}
                          onChange={e => {
                            const newOpts = [...formData.options];
                            newOpts[idx] = e.target.value;
                            setFormData({...formData, options: newOpts});
                          }}
                        />
                     </div>
                   ))}
                </div>
            </div>
          </section>

          {/* Metadata */}
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Teaser Sequence Tier</label>
                  <select
                    className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:outline-none appearance-none cursor-pointer"
                    value={formData.teaserType}
                    onChange={e => setFormData({...formData, teaserType: e.target.value})}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Logic-Heavy">Logic-Heavy</option>
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Deployment Status</label>
                  <button
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={cn(
                      "w-full py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3",
                      formData.isActive ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-brand-bg/5 dark:bg-brand-bg/50 border-brand-sage/20 text-sub"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", formData.isActive ? "bg-brand-primary animate-pulse" : "bg-sub")} />
                    {formData.isActive ? 'Logical Node Active' : 'Offline State'}
                  </button>
               </div>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default QuizEditorDrawer;
