import React, { useState } from 'react';
import { X, Save, Eye, Smartphone, AlertCircle, Info, Hash, Clock, Edit3, CheckCircle2, Image as ImageIcon, Heart, Trash2, Lightbulb } from 'lucide-react';
import { BiteItem, BiteCategory, BiteCategories } from '../../types';
import { cn } from '../../utils/cn';

interface FactEditorDrawerProps {
  fact: BiteItem | null;
  onClose: () => void;
  onSave: (fact: BiteItem) => void;
}

const FactEditorDrawer: React.FC<FactEditorDrawerProps> = ({ fact, onClose, onSave }) => {
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

  const [activeTab, setActivePage] = useState<'edit' | 'preview'>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fact.trim()) newErrors.fact = "Short fact title is required";
    if (formData.fact.length > 120) newErrors.fact = "Fact title too long for mobile UI";
    if (!formData.category) newErrors.category = "Please select a category";

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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-4xl bg-brand-surface border-l border-brand-sage/20 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-500">

        {/* Header */}
        <div className="p-6 border-b border-brand-sage/10 flex items-center justify-between bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-bg rounded-xl text-brand-secondary/60 transition-colors"
            >
              <X size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black text-brand-white tracking-tight">
                {fact ? 'Edit Psychology Fact' : 'Draft New Fact'}
              </h2>
              <p className="text-xs text-brand-secondary/40 font-bold uppercase tracking-widest mt-0.5">
                {formData.id.slice(0, 8)} • Content Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-brand-bg p-1 rounded-xl flex">
               <button
                onClick={() => setActivePage('edit')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'edit' ? "bg-brand-primary text-brand-white shadow-lg" : "text-brand-secondary/40 hover:text-brand-white"
                )}
               >
                 <Edit3 size={14} /> Editor
               </button>
               <button
                onClick={() => setActivePage('preview')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'preview' ? "bg-brand-primary text-brand-white shadow-lg" : "text-brand-secondary/40 hover:text-brand-white"
                )}
               >
                 <Smartphone size={14} /> App Preview
               </button>
             </div>
             <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
             >
               <Save size={18} /> Save & Publish
             </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {activeTab === 'edit' ? (
            <div className="max-w-3xl mx-auto space-y-10 pb-20">

              {/* Basic Info Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Info size={18} />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Core Insight</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest">Short Fact / Headline</label>
                      <span className={cn("text-[10px] font-bold", formData.fact.length > 100 ? "text-brand-gold" : "text-brand-secondary/20")}>
                        {formData.fact.length} / 120
                      </span>
                    </div>
                    <textarea
                      className={cn(
                        "w-full bg-brand-bg/50 border rounded-2xl p-4 text-brand-white text-lg font-bold leading-tight focus:outline-none transition-all resize-none",
                        errors.fact ? "border-red-500/50 bg-red-500/5" : "border-brand-sage/20 focus:border-brand-primary/50 shadow-inner"
                      )}
                      rows={3}
                      placeholder="Enter the core psychological insight..."
                      value={formData.fact}
                      onChange={(e) => setFormData({...formData, fact: e.target.value})}
                    />
                    {errors.fact && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.fact}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest">Category</label>
                      <select
                        className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-4 py-3 text-sm text-brand-white focus:outline-none focus:border-brand-primary/50 appearance-none shadow-inner"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      >
                        {BiteCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest flex items-center gap-2">
                         <Clock size={12} /> Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-4 py-3 text-sm text-brand-white focus:outline-none focus:border-brand-primary/50 shadow-inner"
                        value={formData.readTimeMinutes}
                        onChange={(e) => setFormData({...formData, readTimeMinutes: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Extended Explanation */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-secondary">
                  <BookOpen size={18} />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Detailed Breakdown</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest">Full Explanation</label>
                    <textarea
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl p-4 text-sm text-brand-white/80 leading-relaxed focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
                      rows={6}
                      placeholder="Explain the science or psychology behind this fact in detail..."
                      value={formData.fullFact || ''}
                      onChange={(e) => setFormData({...formData, fullFact: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest text-brand-primary">Practical Application (Why it matters)</label>
                    <textarea
                      className="w-full bg-brand-bg/50 border border-brand-primary/10 rounded-2xl p-4 text-sm text-brand-white/70 italic leading-relaxed focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
                      rows={3}
                      placeholder="How can a user apply this in real life?"
                      value={formData.whyItMatters || ''}
                      onChange={(e) => setFormData({...formData, whyItMatters: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Media & Meta */}
              <section className="space-y-6">
                 <div className="flex items-center gap-2 text-brand-primary">
                  <Hash size={18} />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Media & Discovery</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 bg-brand-bg/30 p-6 rounded-3xl border border-brand-sage/20">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest">Image URL (Unsplash Seed/Direct)</label>
                    <input
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl px-4 py-2.5 text-sm text-brand-white focus:outline-none focus:border-brand-primary"
                      value={formData.imageUrl || ''}
                      placeholder="https://images.unsplash.com/..."
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest">Keywords</label>
                    <input
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-xl px-4 py-2.5 text-sm text-brand-white focus:outline-none focus:border-brand-primary"
                      value={formData.keywords || ''}
                      placeholder="brain, memory, focus..."
                      onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Quiz Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-gold">
                  <Lightbulb size={18} />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Quiz Challenge</h3>
                </div>
                <div className={cn(
                  "p-8 rounded-[2rem] border transition-all",
                  formData.quizQuestion ? "bg-brand-gold/5 border-brand-gold/20" : "bg-brand-bg/30 border-brand-sage/20 border-dashed"
                )}>
                  {!formData.quizQuestion ? (
                    <button
                      onClick={() => setFormData({...formData, quizQuestion: ' ', quizOptions: ['', '', '', ''], correctAnswerIndex: 0})}
                      className="w-full py-4 text-xs font-black uppercase tracking-widest text-brand-secondary/40 hover:text-brand-gold transition-colors"
                    >
                      + Add Quiz Challenge to this Fact
                    </button>
                  ) : (
                    <div className="space-y-6">
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-brand-gold/50 uppercase tracking-widest">Question</label>
                         <input
                          className="w-full bg-brand-bg/50 border border-brand-gold/20 rounded-xl px-4 py-3 text-brand-white focus:outline-none focus:border-brand-gold/50"
                          value={formData.quizQuestion}
                          onChange={(e) => setFormData({...formData, quizQuestion: e.target.value})}
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         {formData.quizOptions?.map((opt, i) => (
                           <div key={i} className="space-y-1">
                             <div className="flex items-center gap-2">
                               <input
                                type="radio"
                                name="correct"
                                className="text-brand-primary focus:ring-brand-primary"
                                checked={formData.correctAnswerIndex === i}
                                onChange={() => setFormData({...formData, correctAnswerIndex: i})}
                               />
                               <label className="text-[10px] font-black text-brand-secondary/40 uppercase">Option {i + 1}</label>
                             </div>
                             <input
                              className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-lg px-3 py-2 text-xs text-brand-white focus:outline-none focus:border-brand-gold/50"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(formData.quizOptions || [])];
                                newOpts[i] = e.target.value;
                                setFormData({...formData, quizOptions: newOpts});
                              }}
                             />
                           </div>
                         ))}
                       </div>
                       <button
                        onClick={() => setFormData({...formData, quizQuestion: null, quizOptions: null, correctAnswerIndex: null})}
                        className="text-[10px] font-bold text-red-500/60 hover:text-red-500 uppercase tracking-widest flex items-center gap-1"
                       >
                         <Trash2 size={10} /> Remove Quiz
                       </button>
                    </div>
                  )}
                </div>
              </section>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center animate-in zoom-in duration-500 pb-20">
               <div className="space-y-6">
                  <h3 className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest text-center">Android App View</h3>
                  <div className="w-[320px] h-[650px] bg-black rounded-[3rem] p-3 border-8 border-brand-surface shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-brand-sage/20">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                     <div className="w-full h-full bg-brand-bg rounded-[2.5rem] overflow-hidden flex flex-col relative">
                        {/* Mock App UI */}
                        <div className="h-56 bg-brand-surface relative">
                           {formData.imageUrl ? (
                             <img src={formData.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
                                <ImageIcon size={48} className="text-brand-bg" />
                             </div>
                           )}
                           <div className="absolute top-10 left-6 right-6 flex justify-between">
                              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"><ChevronLeft size={16} /></div>
                              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"><Heart size={16} /></div>
                           </div>
                        </div>

                        <div className="flex-1 p-6 space-y-4 -mt-8 bg-brand-bg rounded-t-[2.5rem] border-t border-brand-sage/20 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
                           <div className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                             {formData.category}
                           </div>
                           <h4 className="text-brand-white text-2xl font-black leading-tight tracking-tight">{formData.fact || 'Fact Title'}</h4>

                           <div className="flex items-center gap-4 text-[10px] font-bold text-brand-secondary/40 uppercase tracking-widest pb-2">
                             <span className="flex items-center gap-1"><Clock size={10} /> {formData.readTimeMinutes} min</span>
                             <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Fact Verified</span>
                           </div>

                           <p className="text-brand-white/60 text-xs leading-relaxed line-clamp-6">{formData.fullFact || 'No breakdown available...'}</p>

                           <div className="pt-6 border-t border-brand-sage/10">
                             <p className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] mb-2">Practical Logic</p>
                             <p className="text-brand-white/80 text-[11px] italic leading-snug">{formData.whyItMatters || 'Add practical application...'}</p>
                           </div>
                        </div>

                        <div className="p-6 bg-brand-surface/50 backdrop-blur-md border-t border-brand-sage/20">
                           <button className="w-full py-4 bg-brand-primary text-brand-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                             {formData.quizQuestion ? 'Take the Challenge' : 'Complete Reading'}
                           </button>
                        </div>
                     </div>
                  </div>
                  <p className="text-[10px] text-brand-secondary/20 text-center uppercase tracking-widest">Draft: {formData.id.slice(0, 12)}</p>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FactEditorDrawer;
