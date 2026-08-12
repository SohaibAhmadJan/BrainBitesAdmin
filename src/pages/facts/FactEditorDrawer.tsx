import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, Smartphone, AlertCircle, Info, Hash, Clock, Edit3, CheckCircle2, Image as ImageIcon, Heart, Trash2, Lightbulb, ChevronLeft, HelpCircle } from 'lucide-react';
import { BiteItem, Category } from '../../types';
import { cn } from '../../utils/cn';
import { fetchCategories } from '../../services/firestoreService';
import { useTheme } from '../../context/ThemeContext';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';

interface FactEditorDrawerProps {
  fact: BiteItem | null;
  onClose: () => void;
  onSave: (fact: BiteItem) => void;
}

const FactEditorDrawer: React.FC<FactEditorDrawerProps> = ({ fact, onClose, onSave }) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<BiteItem>({
    id: fact?.id || `f-${Math.random().toString(36).slice(2, 11)}`,
    fact: fact?.fact || '',
    category: fact?.category || 'Human Behavior',
    fullFact: fact?.fullFact || '',
    whyItMatters: fact?.whyItMatters || '',
    quizQuestion: fact?.quizQuestion || null,
    quizOptions: fact?.quizOptions || ['', '', '', ''],
    correctAnswerIndex: fact?.correctAnswerIndex ?? null,
    readTimeMinutes: fact?.readTimeMinutes || 1,
    imageUrl: fact?.imageUrl || '',
    keywords: fact?.keywords || ''
  });

  const [showQuiz, setShowQuiz] = useState(!!fact?.quizQuestion);
  const [activeTab, setActivePage] = useState<'edit' | 'preview'>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
    if (data.length > 0 && !fact) {
       setFormData(prev => ({ ...prev, category: data[0].name }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fact.trim()) newErrors.fact = "Short fact title is required";
    if (formData.fact.length > 120) newErrors.fact = "Fact title too long for mobile UI";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.whyItMatters?.trim()) newErrors.whyItMatters = "Practical bridge is required for premium UX";

    if (formData.quizQuestion) {
      if (!formData.quizOptions?.every(opt => opt.trim())) newErrors.quiz = "All 4 quiz options must be filled";
      if (formData.correctAnswerIndex === null) newErrors.quiz = "Please select the correct answer";
    }

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
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative w-full max-w-5xl border-l shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col h-full overflow-hidden",
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
              <h2 className="text-3xl font-black tracking-tighter">
                {fact ? 'Refine Sequence' : 'Anchor Node'}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(45,106,79,1)]" />
                 <p className="text-[10px] text-sub font-black uppercase tracking-[0.3em] opacity-40">
                   {formData.id.slice(0, 14)} • Content Integrity
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="glass p-1.5 rounded-2xl flex border-brand-sage/10 shadow-inner">
               <button
                onClick={() => setActivePage('edit')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                  activeTab === 'edit' ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub opacity-40 hover:opacity-100"
                )}
               >
                 <Edit3 size={14} /> Matrix
               </button>
               <button
                onClick={() => setActivePage('preview')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                  activeTab === 'preview' ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub opacity-40 hover:opacity-100"
                )}
               >
                 <Smartphone size={14} /> Hub Preview
               </button>
             </div>
             <ElasticButton
              onClick={handleSave}
              className="px-10 py-4 rounded-2xl"
             >
               <Save size={20} /> Deploy to Cloud
             </ElasticButton>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'edit' ? (
              <motion.div
                key="edit-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-12 pb-20"
              >

                {/* Basic Info Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-primary/10 rounded-xl">
                      <Info size={20} className="text-brand-primary" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Identity Node</h3>
                  </div>

                  <div className="glass p-10 rounded-[3rem] space-y-8 shadow-inner border-brand-sage/5">
                    <div className="space-y-3">
                      <div className="flex justify-between ml-2">
                        <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em]">Insight Headline</label>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30", formData.fact.length > 100 ? "text-brand-gold opacity-100" : "")}>
                          {formData.fact.length} / 120 Units
                        </span>
                      </div>
                      <textarea
                        className={cn(
                          "w-full bg-brand-bg/5 dark:bg-brand-bg/50 border rounded-[2rem] p-8 text-xl font-bold leading-tight focus:outline-none transition-all resize-none shadow-inner",
                          errors.fact ? "border-red-500/50 bg-red-500/5" : "border-brand-sage/10 focus:border-brand-primary/50"
                        )}
                        rows={3}
                        placeholder="Anchor the core psychological insight..."
                        value={formData.fact}
                        onChange={(e) => setFormData({...formData, fact: e.target.value})}
                      />
                      {errors.fact && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 mt-2 ml-4"><AlertCircle size={12} /> {errors.fact}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Domain Sector</label>
                        <div className="relative group">
                          <select
                            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 appearance-none shadow-inner cursor-pointer"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                             <Clock size={16} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                           Stream Latency <span className="opacity-30">(Mins)</span>
                        </label>
                        <input
                          type="number"
                          className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:outline-none focus:border-brand-primary/50 shadow-inner"
                          value={formData.readTimeMinutes}
                          onChange={(e) => setFormData({...formData, readTimeMinutes: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Supplemental Context Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-gold/10 rounded-xl">
                      <Lightbulb size={20} className="text-brand-gold" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Supplemental Context</h3>
                  </div>

                  <div className="glass p-10 rounded-[3rem] space-y-10 shadow-inner border-brand-sage/5">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Deep Insight (Full Fact)</label>
                      <textarea
                        className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-[2rem] p-8 text-sm focus:outline-none focus:border-brand-primary/50 transition-all resize-none shadow-inner leading-relaxed"
                        rows={4}
                        placeholder="Elaborate on the scientific background..."
                        value={formData.fullFact || ''}
                        onChange={(e) => setFormData({...formData, fullFact: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Practical Bridge (Why It Matters)</label>
                      <textarea
                        className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-[2rem] p-8 text-sm focus:outline-none focus:border-brand-primary/50 transition-all resize-none shadow-inner italic leading-relaxed"
                        rows={3}
                        placeholder="How can the user apply this insight today?"
                        value={formData.whyItMatters || ''}
                        onChange={(e) => setFormData({...formData, whyItMatters: e.target.value})}
                      />
                      {errors.whyItMatters && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 mt-2 ml-4"><AlertCircle size={12} /> {errors.whyItMatters}</p>}
                    </div>
                  </div>
                </section>

                {/* Challenge Matrix (Quiz) */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-brand-primary/10 rounded-xl">
                        <HelpCircle size={20} className="text-brand-primary" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Challenge Matrix</h3>
                    </div>
                    <div
                      onClick={() => {
                        const newShow = !showQuiz;
                        setShowQuiz(newShow);
                        if (!newShow) {
                          setFormData({...formData, quizQuestion: null});
                        } else if (!formData.quizQuestion) {
                          setFormData({...formData, quizQuestion: ''});
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer border transition-all shadow-lg",
                        showQuiz ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "glass border-brand-sage/10 text-sub opacity-40 hover:opacity-100"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full transition-all", showQuiz ? "bg-brand-primary animate-pulse" : "bg-sub")} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{showQuiz ? 'Logic Active' : 'Logic Bypassed'}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showQuiz && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass p-10 rounded-[3rem] space-y-10 shadow-inner border-brand-sage/5 overflow-hidden"
                      >
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Sequence Challenge Question</label>
                          <input
                            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-8 py-5 text-sm font-bold focus:outline-none focus:border-brand-primary/50 shadow-inner"
                            placeholder="What is the core takeaway of this insight?"
                            value={formData.quizQuestion || ''}
                            onChange={(e) => setFormData({...formData, quizQuestion: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          {(formData.quizOptions || ['', '', '', '']).map((option, idx) => (
                            <div key={idx} className="space-y-3">
                              <div className="flex justify-between items-center ml-2">
                                <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em]">Option {idx + 1}</label>
                                <button
                                  type="button"
                                  onClick={() => setFormData({...formData, correctAnswerIndex: idx})}
                                  className={cn(
                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                    formData.correctAnswerIndex === idx ? "bg-brand-primary text-brand-white" : "glass border-brand-sage/10 text-sub opacity-30 hover:opacity-100"
                                  )}
                                >
                                  {formData.correctAnswerIndex === idx ? 'Correct Node' : 'Set as Correct'}
                                </button>
                              </div>
                              <input
                                className={cn(
                                  "w-full bg-brand-bg/5 dark:bg-brand-bg/50 border rounded-2xl px-6 py-4 text-xs focus:outline-none transition-all shadow-inner",
                                  formData.correctAnswerIndex === idx ? "border-brand-primary/50" : "border-brand-sage/10 focus:border-brand-primary/50"
                                )}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(formData.quizOptions || ['', '', '', ''])];
                                  newOptions[idx] = e.target.value;
                                  setFormData({...formData, quizOptions: newOptions});
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* Media & Meta */}
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-secondary/10 rounded-xl">
                      <Hash size={20} className="text-brand-secondary" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Resource Metadata</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-8 glass p-10 rounded-[3rem] border-brand-sage/5 shadow-inner">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Visual Asset Node (URL)</label>
                      <input
                        className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-secondary/50 shadow-inner"
                        value={formData.imageUrl || ''}
                        placeholder="https://cloud.storage/asset-hash..."
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Contextual Tags</label>
                      <input
                        className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-secondary/50 shadow-inner italic"
                        value={formData.keywords || ''}
                        placeholder="e.g. neuro-plasticity, social-validation, focus-matrix..."
                        onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

              </motion.div>
            ) : (
              <motion.div
                key="preview-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex items-center justify-center pb-20"
              >
                 <div className="space-y-10">
                    <ActionBadge variant="info" className="mx-auto block w-fit py-2 px-6">End-Point Handshake Simulation</ActionBadge>
                    <div className="w-[340px] h-[680px] bg-black rounded-[4rem] p-4 border-[10px] border-brand-surface shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-brand-sage/20">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-b-[2.5rem] z-20" />
                       <div className="w-full h-full bg-brand-bg rounded-[3rem] overflow-hidden flex flex-col relative shadow-inner">
                          {/* App UI */}
                          <div className="h-60 bg-brand-surface relative flex items-center justify-center">
                             {formData.imageUrl ? (
                               <img src={formData.imageUrl} className="w-full h-full object-cover opacity-90 transition-opacity duration-1000" alt="" />
                             ) : (
                               <ImageIcon size={64} className="text-brand-primary opacity-20" />
                             )}
                             <div className="absolute top-12 left-8 right-8 flex justify-between">
                                <div className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ChevronLeft size={20} /></div>
                                <div className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><Heart size={20} /></div>
                             </div>
                          </div>

                          <div className="flex-1 p-8 space-y-6 -mt-10 bg-brand-bg rounded-t-[3.5rem] border-t border-brand-sage/10 shadow-[0_-30px_60px_rgba(0,0,0,0.5)] z-10">
                             <span className="inline-flex px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
                               {formData.category}
                             </span>
                             <h4 className="text-brand-white text-2xl font-black leading-tight tracking-tighter italic">"{formData.fact || 'Sequence Headline'}"</h4>

                             <div className="flex items-center gap-6 text-[10px] font-black text-sub uppercase tracking-[0.2em] opacity-40">
                               <span className="flex items-center gap-2"><Clock size={12} className="text-brand-primary" /> {formData.readTimeMinutes}m Read</span>
                               <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-primary" /> Verified</span>
                             </div>

                             <div className="pt-8 border-t border-brand-sage/5">
                               <p className="text-[10px] text-brand-primary font-black uppercase tracking-[0.4em] mb-3">Logic Bridge</p>
                               <p className="text-brand-white/70 text-[12px] italic leading-relaxed font-medium">"{formData.whyItMatters || 'Practical node breakdown...'}"</p>
                             </div>
                          </div>

                          <div className="p-8 bg-brand-surface/40 backdrop-blur-3xl border-t border-brand-sage/10 relative z-20">
                             <button
                                disabled={!showQuiz}
                                className={cn(
                                    "w-full py-5 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all",
                                    showQuiz
                                        ? "bg-brand-primary text-brand-white shadow-[0_15px_40px_rgba(45,106,79,0.3)]"
                                        : "bg-brand-bg/20 text-sub opacity-20 cursor-not-allowed"
                                )}
                             >
                               {showQuiz ? 'Initiate Challenge' : 'No Logic Node'}
                             </button>
                          </div>
                       </div>
                    </div>
                    <p className="text-[10px] text-sub font-black text-center uppercase tracking-[0.4em] opacity-30">Sequence: {formData.id.slice(0, 16)}</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default FactEditorDrawer;
