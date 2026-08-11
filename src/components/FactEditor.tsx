import React, { useState } from 'react';
import { BiteItem, BiteCategories, BiteCategory } from '../types';

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
  const selectedFact = facts.find((f) => f.id === selectedFactId) || facts[0];

  return (
    <div className="flex h-[calc(100vh-180px)] gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* List Panel */}
      <div className="w-80 flex flex-col bg-slate-800/40 border border-slate-700 rounded-3xl overflow-hidden">
        <div className="p-4 border-bottom border-slate-700 flex justify-between items-center bg-slate-800/20">
          <h3 className="font-bold text-slate-300">Facts List</h3>
          <button
            onClick={onAddFact}
            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {facts.map((fact) => (
            <button
              key={fact.id}
              onClick={() => onSelectFact(fact.id)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedFactId === fact.id
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'hover:bg-slate-700/50 text-slate-400 border border-transparent'
              }`}
            >
              <p className="font-medium truncate text-sm">{fact.fact || 'Untitled Fact'}</p>
              <p className="text-[10px] uppercase tracking-widest mt-1 opacity-60 font-bold">{fact.category.replace('_', ' ')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-hide">
        {selectedFact ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Core Content</h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Short Insight</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={selectedFact.fact}
                    onChange={(e) => onUpdateFact({ fact: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Explanation</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    rows={4}
                    value={selectedFact.fullFact}
                    onChange={(e) => onUpdateFact({ fullFact: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                      value={selectedFact.category}
                      onChange={(e) => onUpdateFact({ category: e.target.value as BiteCategory })}
                    >
                      {BiteCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Read Time (Min)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      value={selectedFact.readTimeMinutes}
                      onChange={(e) => onUpdateFact({ readTimeMinutes: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="https://images.unsplash.com/..."
                    value={selectedFact.imageUrl || ''}
                    onChange={(e) => onUpdateFact({ imageUrl: e.target.value || null })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Keywords (comma separated)</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="mind, growth, psychology"
                    value={selectedFact.keywords || ''}
                    onChange={(e) => onUpdateFact({ keywords: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Quiz Details</h3>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question</label>
                   <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={selectedFact.quizQuestion || ''}
                    onChange={(e) => onUpdateFact({ quizQuestion: e.target.value || null })}
                    placeholder="Enter quiz question..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   {Array.from({ length: 4 }).map((_, i) => (
                     <input
                       key={i}
                       className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                       placeholder={`Option ${i+1}`}
                       value={selectedFact.quizOptions?.[i] || ''}
                       onChange={(e) => {
                         const options = [...(selectedFact.quizOptions || ['', '', '', ''])];
                         options[i] = e.target.value;
                         onUpdateFact({ quizOptions: options });
                       }}
                     />
                   ))}
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Correct Answer Index (0-3)</label>
                   <input
                    type="number"
                    min="0"
                    max="3"
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={selectedFact.correctAnswerIndex ?? ''}
                    onChange={(e) => onUpdateFact({ correctAnswerIndex: e.target.value === '' ? null : parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-6">
               <div className="sticky top-0">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Mobile Preview</h3>
                  <div className="w-[300px] h-[550px] mx-auto bg-black rounded-[3rem] p-3 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                     <div className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col relative">
                        {/* Mock Image */}
                        <div className="h-40 bg-emerald-500/20 flex items-center justify-center border-b border-emerald-500/10">
                           {selectedFact.imageUrl ? (
                             <img src={selectedFact.imageUrl} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <span className="text-emerald-500/40 font-bold tracking-tighter">BITE IMAGE</span>
                           )}
                        </div>
                        <div className="p-6 space-y-4">
                           <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded inline-block">
                             {selectedFact.category.replace('_', ' ')}
                           </div>
                           <h4 className="text-white text-xl font-bold leading-tight">{selectedFact.fact || 'Bite Fact Title'}</h4>
                           <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">{selectedFact.fullFact || 'Full explanation will appear here on the device...'}</p>

                           <div className="pt-4 border-t border-slate-800">
                             <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Why it matters</div>
                             <p className="text-emerald-400/80 text-[11px] italic leading-snug">{selectedFact.whyItMatters || 'Practical application insight...'}</p>
                           </div>
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      onClick={() => onDeleteFact(selectedFact.id)}
                      className="px-6 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                    >
                      Delete Fact
                    </button>
                    <button className="px-8 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                      Save Changes
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 font-medium">
            Select a fact from the left to start editing.
          </div>
        )}
      </div>
    </div>
  );
};

export default FactEditor;
