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
import { QuoteItem, Category } from '../../types';
import {
  fetchQuotes,
  fetchCategories
} from '../../services/firestoreService';
import { updateQuote, deleteQuote } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import ActionBadge from '../../components/ui/ActionBadge';
import ElasticButton from '../../components/ui/ElasticButton';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';

const QuotesPage = () => {
  const { theme } = useTheme();
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);

  const [formData, setFormData] = useState({
    text: '',
    author: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quoteData, catData] = await Promise.all([
        fetchQuotes(),
        fetchCategories()
      ]);
      setQuotes(quoteData.sort((a, b) => b.createdAt - a.createdAt));
      setCategories(catData);
      if (catData.length > 0) {
        setFormData(prev => ({ ...prev, category: catData[0].name }));
      }
    } catch (err) {
      toast.error('Failed to load insights');
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
        category: categories.length > 0 ? categories[0].name : '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text || !formData.author || !formData.category) {
      toast.error('Validation error: Identity missing');
      return;
    }

    const quoteData: QuoteItem = {
      id: editingQuote?.id || `q-${Date.now()}`,
      text: formData.text,
      author: formData.author,
      category: formData.category,
      isActive: formData.isActive,
      createdAt: editingQuote?.createdAt || Date.now()
    };

    try {
      await updateQuote(quoteData.id, quoteData, `Registry sync: ${quoteData.author}`);
      toast.success(editingQuote ? 'Wisdom updated (Atomic)' : 'Wisdom published (Atomic)');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (window.confirm(`Expunge wisdom by ${author}?`)) {
      try {
        await deleteQuote(id, `Manual wisdom removal: ${author}`);
        toast.success('Wisdom expunged');
        loadData();
      } catch (err: any) {
        toast.error(`Expunge failed: ${err.message}`);
      }
    }
  };

  const toggleActive = async (quote: QuoteItem) => {
    const updated = { ...quote, isActive: !quote.isActive };
    try {
      await updateQuote(updated.id, updated, `State toggle: ${updated.isActive ? 'ACTIVATE' : 'VAULT'}`);
      toast.success(updated.isActive ? 'Insight featured' : 'Insight retracted');
      loadData();
    } catch (err: any) {
      toast.error(`State toggle failed: ${err.message}`);
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

      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black tracking-tighter uppercase"
           >
             Insight <span className="text-brand-primary">Repository</span>
           </motion.h1>
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="info" className="px-5 py-1.5">Wisdom Nexus</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Psychological Theoretical Snippets</p>
           </div>
        </div>
        <div className="flex gap-4">
           <ElasticButton onClick={() => handleOpenModal()}>
              <Plus size={18} strokeWidth={3} />
              Deposit Wisdom
           </ElasticButton>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search wisdom profiles by author or content..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/40 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Modern Filter Strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
         <button
           onClick={() => setCategoryFilter('All')}
           className={cn(
             "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
             categoryFilter === 'All' ? "bg-brand-primary text-brand-white border-brand-primary" : "glass text-sub border-transparent hover:text-brand-primary"
           )}
         >
           All Disciplines
         </button>
         {categories.map(cat => (
           <button
             key={cat.id}
             onClick={() => setCategoryFilter(cat.name)}
             className={cn(
               "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm whitespace-nowrap",
               categoryFilter === cat.name ? "bg-brand-primary text-brand-white border-brand-primary" : "glass text-sub border-transparent hover:text-brand-primary"
             )}
           >
             {cat.name}
           </button>
         ))}
      </div>

      {/* Wisdom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 glass rounded-[3rem] animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))
        ) : filteredQuotes.length === 0 ? (
          <EmptyBuffer
            icon={Quote}
            title="Wisdom Repository Empty"
            message="No curated theoretical snippets or psychological insights found in the current sector."
          />
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
                className="glass p-10 rounded-[3rem] shadow-xl group border-transparent hover:border-brand-primary/20 transition-all flex flex-col relative overflow-hidden h-full"
              >
                <Quote className="absolute -top-6 -right-6 w-32 h-32 text-brand-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700" />

                <div className="flex-1 space-y-6 relative z-10">
                   <div className="flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">
                        {quote.category}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleActive(quote)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all border",
                          quote.isActive ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-brand-bg/5 dark:bg-brand-bg/50 border-brand-sage/20 text-sub opacity-40"
                        )}
                      >
                        {quote.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </motion.button>
                   </div>

                   <p className="text-xl font-medium leading-relaxed italic line-clamp-5 text-glow">
                     {quote.text}
                   </p>

                   <div className="flex items-center gap-3">
                      <div className="h-[2px] w-6 bg-brand-primary/30" />
                      <p className="text-brand-primary font-black text-[11px] uppercase tracking-widest">{quote.author}</p>
                   </div>
                </div>

                <div className="mt-10 pt-8 border-t border-brand-sage/5 flex justify-between items-center relative z-10">
                   <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-widest">
                     Deposited: {new Date(quote.createdAt).toLocaleDateString()}
                   </p>

                   <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleOpenModal(quote)}
                        className="p-3 bg-brand-bg/5 dark:bg-brand-bg hover:bg-brand-primary/10 text-sub hover:text-brand-primary rounded-2xl transition-all border border-brand-sage/5"
                      >
                        <Edit3 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(quote.id, quote.author)}
                        className="p-3 bg-brand-bg/5 dark:bg-brand-bg hover:bg-red-500/10 text-sub hover:text-red-400 rounded-2xl transition-all border border-brand-sage/5"
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
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              className="relative w-full max-w-xl glass rounded-[3rem] shadow-2xl overflow-hidden"
            >
               <div className="p-10 border-b border-brand-sage/10 flex justify-between items-center bg-brand-primary/5">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">{editingQuote ? 'Refine Wisdom' : 'Anchor New Insight'}</h3>
                    <p className="text-[10px] text-sub font-black uppercase tracking-[0.3em] mt-1">System Deposition Sequence</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-brand-bg/5 dark:bg-brand-bg hover:text-brand-primary transition-colors rounded-2xl border border-brand-sage/10">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] text-sub font-black uppercase tracking-[0.3em] ml-2">Wisdom Content</label>
                    <textarea
                      className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-[2rem] p-6 text-base focus:outline-none focus:border-brand-primary/50 transition-all leading-relaxed shadow-inner"
                      rows={5}
                      placeholder="Input snippet..."
                      value={formData.text}
                      onChange={e => setFormData({...formData, text: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] text-sub font-black uppercase tracking-[0.3em] ml-2">Attribution Authority</label>
                    <input
                      className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
                      placeholder="e.g. Victor Frankl"
                      value={formData.author}
                      onChange={e => setFormData({...formData, author: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] text-sub font-black uppercase tracking-[0.3em] ml-2">Domain Target</label>
                        <select
                          className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-brand-primary/50 appearance-none uppercase tracking-widest"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-2">Publish Status</label>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                          className={cn(
                            "w-full py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg",
                            formData.isActive
                              ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                              : "bg-brand-bg/5 dark:bg-brand-bg/50 border-brand-sage/20 text-sub"
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
                      className="w-full py-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-white font-black rounded-3xl transition-all shadow-xl text-xs uppercase tracking-[0.3em]"
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
