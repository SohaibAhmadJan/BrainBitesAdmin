import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Save, Smartphone, Heart, ChevronLeft, BookOpen } from 'lucide-react';
import { BiteItem, BiteCategory } from '../types';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

interface FactEditorProps {
  facts: BiteItem[];
  selectedFactId: string;
  onSelectFact: (id: string) => void;
  onUpdateFact: (updates: Partial<BiteItem>) => void;
  onAddFact: () => void;
  onDeleteFact: (id: string) => void;
}

const FactEditor: React.FC<FactEditorProps> = ({
  facts,
  selectedFactId,
  onSelectFact,
  onUpdateFact,
  onAddFact,
  onDeleteFact,
}) => {
  const { theme } = useTheme();
  const selectedFact = facts.find((f) => f.id === selectedFactId) || facts[0];

  return (
    <div className="flex h-[calc(100vh-200px)] gap-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* List Panel */}
      <div className="w-96 flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-brand-sage/10 flex justify-between items-center bg-brand-primary/5">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-sub">Sequence Repository</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAddFact}
            className="p-2 bg-brand-primary text-brand-white rounded-xl shadow-lg shadow-brand-primary/20"
          >
            <Plus size={18} strokeWidth={3} />
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {facts.map((fact) => (
            <button
              key={fact.id}
              onClick={() => onSelectFact(fact.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all border group",
                selectedFactId === fact.id
                  ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-inner"
                  : "hover:bg-brand-primary/5 border-transparent text-sub"
              )}
            >
              <p className="font-bold truncate text-sm">{fact.fact || 'Untitled Sequence'}</p>
              <p className="text-[9px] uppercase tracking-widest mt-1.5 opacity-40 font-black">{fact.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-8 scrollbar-hide pb-20">
        {selectedFact ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="glass p-8 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
                <h3 className="text-lg font-black tracking-tight border-b border-brand-sage/10 pb-4">Core Definition</h3>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Sequence Insight</label>
                  <textarea
                    className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl p-5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner leading-relaxed"
                    rows={4}
                    value={selectedFact.fact}
                    onChange={(e) => onUpdateFact({ fact: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Analytical Breakdown</label>
                  <textarea
                    className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl p-5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner leading-relaxed"
                    rows={6}
                    value={selectedFact.fullFact || ''}
                    onChange={(e) => onUpdateFact({ fullFact: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Domain</label>
                    <select
                      className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:border-brand-primary appearance-none"
                      value={selectedFact.category}
                      onChange={(e) => onUpdateFact({ category: e.target.value as BiteCategory, categoryId: e.target.value })}
                    >
                      <option value="HUMAN_BEHAVIOR">Human Behavior</option>
                      <option value="MENTAL_HEALTH">Mental Health</option>
                      <option value="BRAIN_SCIENCE">Brain Science</option>
                      <option value="LOVE_ATTRACTION">Love & Attraction</option>
                      <option value="PERSONALITY">Personality Traits</option>
                      <option value="BODY_LANGUAGE">Body Language</option>
                      <option value="SUBCONSCIOUS">Subconscious Mind</option>
                      <option value="SOCIAL_PSYCHOLOGY">Social Psychology</option>
                      <option value="HABITS_MOTIVATION">Habits & Motivation</option>
                      <option value="MEMORY_LEARNING">Memory & Learning</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Read Time</label>
                    <input
                      type="number"
                      className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:border-brand-primary shadow-inner"
                      value={selectedFact.readTimeMinutes}
                      onChange={(e) => onUpdateFact({ readTimeMinutes: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-2xl rounded-full" />
              </div>

              <div className="glass p-8 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
                <h3 className="text-lg font-black tracking-tight border-b border-brand-sage/10 pb-4">Challenge Logic</h3>
                <p className="text-xs italic opacity-40 text-center py-4">Quiz normalized to external collection. Handle via Transaction API.</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-2xl rounded-full" />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-8">
               <div className="sticky top-6">
                  <h3 className="text-[10px] font-black text-sub uppercase tracking-[0.3em] mb-6 text-center">Identity Hub Simulation</h3>
                  <div className="w-[320px] h-[600px] mx-auto bg-black rounded-[3.5rem] p-4 border-8 border-brand-surface shadow-2xl relative overflow-hidden ring-1 ring-brand-sage/20">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-20"></div>
                     <div className="w-full h-full bg-brand-bg rounded-[2.8rem] overflow-hidden flex flex-col relative">
                        {/* Mock Image */}
                        <div className="h-48 bg-brand-surface relative flex items-center justify-center overflow-hidden">
                           {selectedFact.imageUrl ? (
                             <img src={selectedFact.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                           ) : (
                             <BookOpen size={48} className="text-brand-primary/20" />
                           )}
                           <div className="absolute top-10 left-6 right-6 flex justify-between">
                              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"><ChevronLeft size={16} /></div>
                              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white"><Heart size={16} /></div>
                           </div>
                        </div>
                        <div className="p-7 space-y-5">
                           <div className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-3 py-1 rounded-full border border-brand-primary/20 inline-block uppercase tracking-widest">
                             {selectedFact.category}
                           </div>
                           <h4 className="text-brand-white text-xl font-black leading-tight tracking-tight italic">{selectedFact.fact || 'Bite Fact Title'}</h4>
                           <p className="text-brand-white/40 text-xs leading-relaxed line-clamp-5">{selectedFact.fullFact || 'Payload sequence description...'}</p>
                        </div>
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(45,106,79,1)]"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-sage/40"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-sage/40"></div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 flex justify-center gap-4 max-w-[320px] mx-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDeleteFact(selectedFact.id)}
                      className="flex-1 py-3.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-xl"
                    >
                      Delete node
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-[2] py-3.5 rounded-2xl bg-brand-primary text-brand-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20"
                    >
                      Commit Changes
                    </motion.button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-sub opacity-20 gap-4">
            <BookOpen size={64} />
            <p className="font-black uppercase tracking-[0.4em]">Select sequence node</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactEditor;
