import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Quote,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Sparkles
} from 'lucide-react';
import { QuoteItem, BiteCategory, BiteCategories } from '../../types';
import { fetchQuotes, createOrUpdateQuote, deleteQuote, createAuditLog } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BiteCategory | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);

  const [formData, setFormData] = useState({
    text: '',
    author: '',
    category: 'Human Behavior' as BiteCategory,
    isActive: true
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await fetchQuotes();
      setQuotes(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (quote: QuoteItem | null = null) => {
    if (quote) {
      setEditingQuote(quote);
      setFormData({
        text: quote.text,
        author: quote.author,
        category: quote.category,
        isActive: quote.isActive
      });
    } else {
      setEditingQuote(null);
      setFormData({
        text: '',
        author: '',
        category: 'Human Behavior',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text || !formData.author) {
      toast.error('Text and Author are required');
      return;
    }

    const quoteData: QuoteItem = {
      id: editingQuote?.id || `q-${Date.now()}`,
      text: formData.text,
      author: formData.author,
      category: formData.category,
      isActive: formData.isActive,
      createdAt: editingQuote?.createdAt || new Date().toISOString()
    };

    try {
      await createOrUpdateQuote(quoteData);
      await createAuditLog({
        adminEmail: 'master@brainbites.com',
        action: editingQuote ? 'UPDATE_QUOTE' : 'CREATE_QUOTE',
        details: `${editingQuote ? 'Updated' : 'Created'} quote by ${quoteData.author}`
      });

      toast.success(editingQuote ? 'Wisdom updated' : 'Wisdom published');
      setIsModalOpen(false);
      loadQuotes();
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (window.confirm(`Expunge wisdom by ${author}?`)) {
      try {
        await deleteQuote(id);
        await createAuditLog({
          adminEmail: 'master@brainbites.com',
          action: 'DELETE_QUOTE',
          details: `Deleted quote by ${author}`
        });
        toast.success('Wisdom expunged');
        setQuotes(prev => prev.filter(q => q.id !== id));
      } catch (err) {
        toast.error('Expunge failed');
      }
    }
  };

  const toggleActive = async (quote: QuoteItem) => {
    const updated = { ...quote, isActive: !quote.isActive };
    try {
      await createOrUpdateQuote(updated);
      setQuotes(prev => prev.map(q => q.id === quote.id ? updated : q));
      toast.success(updated.isActive ? 'Insight featured' : 'Insight retracted');
    } catch (err) {
      toast.error('State toggle failed');
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-brand-white tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Sparkles className="text-brand-primary" size={32} />
             </div>
             Insight Repository
          </h2>
          <p className="text-brand-secondary/40 text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Curated Psychological Wisdom & Theoretical Snippets</p>
        </div>

        <div className="flex items-center gap-6 w-full xl:w-auto relative z-10">
          <div className="relative flex-1 xl:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search wisdom or authors..."
              className="w-full bg-brand-bg/40 border border-brand-sage/20 rounded-2xl pl-12 pr-6 py-4 text-sm text-brand-white focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/30 text-xs uppercase tracking-widest whitespace-nowrap"
          >
            <Plus size={20} strokeWidth={3} />
            Deposit Wisdom
          </motion.button>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Modern Filter Strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
         <button
           onClick={() => setCategoryFilter('All')}
           className={cn(
             "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
             categoryFilter === 'All' ? "bg-brand-primary text-brand-white border-brand-primary shadow-lg shadow-brand-primary/20" : "glass text-brand-secondary/40 border-transparent hover:text-brand-white"
           )}
         >
           All Disciplines
         </button>
         {BiteCategories.map(cat => (
           <button
             key={cat}
             onClick={() => setCategoryFilter(cat)}
             className={cn(
               "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
               categoryFilter === cat ? "bg-brand-primary text-brand-white border-brand-primary shadow-lg shadow-brand-primary/20" : "glass text-brand-secondary/40 border-transparent hover:text-brand-white"
             )}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Wisdom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 glass rounded-[3rem] animate-pulse" />
          ))
        ) : filteredQuotes.length === 0 ? (
          <div className="col-span-full py-40 glass rounded-[3rem] border border-dashed border-brand-sage/20 text-center space-y-4">
             <MessageSquare size={64} className="mx-auto text-brand-secondary/10" />
             <p className="text-xl font-black text-brand-secondary/20 uppercase tracking-widest">Repository section empty</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredQuotes.map((quote, idx) => (
              <motion.div
                key={quote.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="glass p-10 rounded-[3rem] shadow-2xl group hover:border-brand-primary/20 transition-all flex flex-col relative overflow-hidden"
              >
                <Quote className="absolute -top-6 -right-6 w-32 h-32 text-brand-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />

                <div className="flex-1 space-y-6 relative z-10">
                   <div className="flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-brand-bg/50 text-[8px] font-black text-brand-secondary/60 uppercase tracking-[0.2em] border border-brand-sage/20">
                        {quote.category}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleActive(quote)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all border",
                          quote.isActive ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-brand-bg/50 border-brand-sage/20 text-brand-secondary/30"
                        )}
                      >
                        {quote.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </motion.button>
                   </div>

                   <p className="text-xl font-medium text-brand-white leading-relaxed italic line-clamp-5 text-glow">
                     "{quote.text}"
                   </p>

                   <div className="flex items-center gap-3">
                      <div className="h-[2px] w-6 bg-brand-primary/30" />
                      <p className="text-brand-primary font-black text-[11px] uppercase tracking-widest">{quote.author}</p>
                   </div>
                </div>

                <div className="mt-10 pt-8 border-t border-brand-sage/10 flex justify-between items-center relative z-10">
                   <p className="text-[9px] font-black text-brand-secondary/30 uppercase tracking-widest">
                     Deposited: {new Date(quote.createdAt).toLocaleDateString()}
                   </p>

                   <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleOpenModal(quote)}
                        className="p-3 glass hover:bg-brand-primary/10 text-brand-secondary/60 hover:text-brand-primary rounded-2xl transition-all"
                      >
                        <Edit3 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(quote.id, quote.author)}
                        className="p-3 glass hover:bg-red-500/10 text-brand-secondary/60 hover:text-red-400 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modern Modal Overhaul */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              className="relative w-full max-w-xl bg-brand-surface border border-brand-sage/20 rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden"
            >
               <div className="p-10 border-b border-brand-sage/10 flex justify-between items-center bg-brand-primary/5">
                  <div>
                    <h3 className="text-2xl font-black text-brand-white tracking-tighter">{editingQuote ? 'Refine Wisdom' : 'Anchor New Insight'}</h3>
                    <p className="text-[10px] font-black text-brand-secondary/40 uppercase tracking-[0.3em] mt-1">System Deposition Sequence</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 glass hover:text-brand-white transition-colors rounded-2xl">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Wisdom Content</label>
                    <textarea
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-[2rem] p-6 text-brand-white text-base focus:outline-none focus:border-brand-primary transition-all leading-relaxed shadow-inner"
                      rows={5}
                      placeholder="Input the psychological snippet here..."
                      value={formData.text}
                      onChange={e => setFormData({...formData, text: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Attribution Authority</label>
                    <input
                      className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-brand-white text-sm focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                      placeholder="e.g. Victor Frankl"
                      value={formData.author}
                      onChange={e => setFormData({...formData, author: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Domain Target</label>
                        <select
                          className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-5 py-4 text-brand-white text-xs font-bold focus:outline-none focus:border-brand-primary appearance-none uppercase tracking-widest"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value as BiteCategory})}
                        >
                          {BiteCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-secondary/50 uppercase tracking-[0.3em] ml-2">Publish Status</label>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                          className={cn(
                            "w-full py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg",
                            formData.isActive
                              ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                              : "bg-brand-bg/50 border-brand-sage/20 text-brand-secondary/30"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", formData.isActive ? "bg-brand-primary animate-pulse" : "bg-brand-secondary/20")} />
                          {formData.isActive ? 'Broadcast Active' : 'Hidden in Vault'}
                        </button>
                     </div>
                  </div>

                  <div className="pt-6">
                     <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-3xl transition-all shadow-[0_20px_50px_rgba(45,106,79,0.3)] text-xs uppercase tracking-[0.3em]"
                     >
                       {editingQuote ? 'Synchronize Updates' : 'Commit to Cloud'}
                     </motion.button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuotesPage;
