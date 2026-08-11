import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Users, Layers, Command, X, ArrowRight } from 'lucide-react';
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
          users: users.filter(u => u.email.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
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
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl glass rounded-[2.5rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center px-8 py-6 border-b border-brand-sage/10">
              <Search className="text-brand-primary mr-4" size={24} />
              <input
                autoFocus
                className="flex-1 bg-transparent border-none focus:ring-0 placeholder-sub text-xl outline-none font-medium"
                placeholder="Search BrainBites..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-sub bg-brand-bg/5 dark:bg-brand-bg/50 px-2 py-1 rounded-lg border border-brand-sage/10">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {query.length < 2 ? (
                <div className="py-16 text-center space-y-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Command className="text-brand-primary opacity-30" size={40} />
                  </motion.div>
                  <div>
                    <p className="font-bold text-lg opacity-60">System Intelligence Active</p>
                    <p className="text-sub text-[10px] uppercase tracking-[0.4em] font-black mt-1">Global Query Protocol</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {results.facts.length > 0 && (
                    <div className="space-y-3 mb-8">
                      <h3 className="px-4 text-[10px] font-black text-sub uppercase tracking-[0.4em]">Insights</h3>
                      {results.facts.map(fact => (
                        <button
                          key={fact.id}
                          onClick={() => { navigate('/facts'); setIsOpen(false); }}
                          className="w-full text-left p-4 rounded-[1.5rem] hover:bg-brand-primary/10 transition-all flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-white transition-all shadow-sm">
                            <FileText size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold truncate block">{fact.fact}</span>
                            <span className="text-[10px] text-sub uppercase font-black tracking-tighter">#{fact.id.slice(0, 8)} • {fact.category}</span>
                          </div>
                          <ArrowRight size={14} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div className="space-y-3 mb-8">
                      <h3 className="px-4 text-[10px] font-black text-sub uppercase tracking-[0.4em]">Users</h3>
                      {results.users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => { navigate('/users'); setIsOpen(false); }}
                          className="w-full text-left p-4 rounded-[1.5rem] hover:bg-brand-secondary/10 transition-all flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-brand-secondary/10 rounded-xl flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary transition-all shadow-sm">
                            <Users size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold truncate block">{user.email}</span>
                            <span className="text-[10px] text-sub uppercase font-black tracking-tighter">Level {user.level || 1} • {user.status}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.collections.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="px-4 text-[10px] font-black text-sub uppercase tracking-[0.4em]">Collections</h3>
                      {results.collections.map(col => (
                        <button
                          key={col.id}
                          onClick={() => { navigate('/collections'); setIsOpen(false); }}
                          className="w-full text-left p-4 rounded-[1.5rem] hover:bg-brand-accent/10 transition-all flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent group-hover:bg-brand-accent transition-all shadow-sm">
                            <Layers size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold truncate block">{col.title}</span>
                            <span className="text-[10px] text-sub uppercase font-black tracking-tighter">{col.factIds.length} Linked Items</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.facts.length === 0 && results.users.length === 0 && results.collections.length === 0 && (
                    <div className="py-20 text-center space-y-3 opacity-20">
                      <Search size={64} className="mx-auto" />
                      <p className="font-bold italic">No system matches for "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
