import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, Users, Layers, Command, X, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BiteItem, UserProfile, CollectionSet } from '../types';
import { fetchBites, fetchUsers, fetchCollections } from '../services/firestoreService';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

interface GlobalSearchProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const GlobalSearch = ({ isOpen, setIsOpen }: GlobalSearchProps) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    facts: BiteItem[];
    users: UserProfile[];
    collections: CollectionSet[];
  }>({ facts: [], users: [], collections: [] });

  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ facts: [], users: [], collections: [] });
      return;
    }

    const search = async () => {
      try {
        const [facts, users, collections] = await Promise.all([
          fetchBites(),
          fetchUsers(),
          fetchCollections()
        ]);

        setResults({
          facts: facts.filter(f => f.fact.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
          users: users.filter(u => u.profile.email.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
          collections: collections.filter(c => c.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        });
      } catch (err) {
        console.error('Search failed', err);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F1F17]/90 backdrop-blur-2xl"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl glass rounded-[2.5rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,1)] border border-brand-sage/20"
          >
            <div className="flex items-center px-8 py-8 border-b border-brand-sage/10">
              <Search className="text-brand-primary mr-5" size={28} />
              <input
                autoFocus
                className="flex-1 bg-transparent border-none focus:ring-0 placeholder-brand-secondary/30 text-2xl outline-none font-bold tracking-tight text-brand-white"
                placeholder="Synchronize Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 glass rounded-xl text-sub hover:text-brand-primary transition-all border-brand-sage/10"
                >
                   <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-10 space-y-12 scrollbar-thin pr-6">
              {query.length < 2 ? (
                <div className="py-20 text-center space-y-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner"
                  >
                    <Command className="text-brand-primary" size={48} />
                  </motion.div>
                  <div>
                    <p className="font-black text-xl tracking-tight text-brand-white">Protocol: Global Query</p>
                    <p className="text-brand-primary text-[10px] uppercase tracking-[0.5em] font-black mt-2">Input criteria to initiate scan</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {results.facts.length > 0 && (
                    <div className="space-y-4 mb-10">
                      <h3 className="px-4 text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] opacity-40">Insight Sequences</h3>
                      {results.facts.map(fact => (
                        <button
                          key={fact.id}
                          onClick={() => { navigate('/facts'); setIsOpen(false); }}
                          className="w-full text-left p-6 rounded-[2rem] bg-brand-bg/40 border border-brand-sage/5 hover:border-brand-primary/30 transition-all flex items-center gap-6 group"
                        >
                          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-white transition-all shadow-xl">
                            <FileText size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-base font-bold text-brand-white truncate block italic group-hover:text-brand-primary transition-colors">"{fact.fact}"</span>
                            <span className="text-[10px] text-sub uppercase font-black tracking-widest mt-1 block opacity-40 group-hover:opacity-100 transition-opacity">Trace: {fact.id.slice(0, 12)} • {fact.category}</span>
                          </div>
                          <ChevronRight size={18} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div className="space-y-4 mb-10">
                      <h3 className="px-4 text-[10px] font-black text-brand-secondary uppercase tracking-[0.5em] opacity-40">Agent Identities</h3>
                      {results.users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => { navigate('/users'); setIsOpen(false); }}
                          className="w-full text-left p-6 rounded-[2rem] bg-brand-bg/40 border border-brand-sage/5 hover:border-brand-secondary/30 transition-all flex items-center gap-6 group"
                        >
                          <div className="w-12 h-12 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-brand-white transition-all shadow-xl">
                            <Users size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-base font-black text-brand-white truncate block">{user.profile.email}</span>
                            <div className="flex items-center gap-3 mt-1 opacity-40 group-hover:opacity-100">
                               <div className={cn("w-1.5 h-1.5 rounded-full", user.account.status === 'ACTIVE' ? "bg-brand-primary" : "bg-red-500")} />
                               <span className="text-[10px] text-sub uppercase font-black tracking-widest">{user.account.status} NODE</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.facts.length === 0 && results.users.length === 0 && results.collections.length === 0 && (
                    <div className="py-20 text-center space-y-6 opacity-30">
                      <Search size={80} className="mx-auto text-brand-primary" strokeWidth={1} />
                      <p className="font-black text-xl tracking-tight">Zero system matches for sequence: "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
