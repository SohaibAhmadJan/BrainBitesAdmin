import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, Users, Command, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BiteItem, UserProfile, CollectionSet } from '../types';
import { fetchBites, fetchUsers, fetchCollections } from '../services/firestoreService';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';

interface GlobalSearchProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const GlobalSearch = ({ isOpen, setIsOpen }: GlobalSearchProps) => {
  const { theme } = useTheme();
  const { isAuthorized } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<{
    facts: BiteItem[];
    users: UserProfile[];
    collections: CollectionSet[];
  }>({ facts: [], users: [], collections: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // 1. Keyboard Handshake
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isOpen, setIsOpen]);

  // 2. Focus Enforcement
  useEffect(() => {
    if (isOpen) {
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(t);
    } else {
        setSearchQuery('');
        setHasSearched(false);
    }
  }, [isOpen]);

  // 3. Search Logic
  const performSearch = useCallback(async () => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const [f, u, c] = await Promise.allSettled([fetchBites(1000), fetchUsers(500), fetchCollections()]);
      const facts = f.status === 'fulfilled' ? f.value : [];
      const users = u.status === 'fulfilled' ? u.value : [];

      setResults({
        facts: facts.filter(item => item?.fact?.toLowerCase().includes(q)).slice(0, 5),
        users: users.filter(user => {
            const email = user?.profile?.email || '';
            const name = user?.profile?.displayName || '';
            return email.toLowerCase().includes(q) || name.toLowerCase().includes(q);
        }).slice(0, 5),
        collections: []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 200);
    }
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => { if (searchQuery.length >= 2) performSearch(); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, performSearch]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-start justify-center pt-[15vh] px-4"
      style={{ zIndex: 9999999, pointerEvents: 'auto' }}
    >
      {/* SOLID BACKDROP - No animation to rule out transition blocks */}
      <div
        className="absolute inset-0 bg-black/95"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsOpen(false)}
      />

      {/* CORE MODAL CONTAINER */}
      <div
        className={cn(
            "relative w-full max-w-2xl rounded-[2rem] shadow-2xl border-4 z-[10000000]",
            theme === 'dark' ? "bg-[#0A1610] border-brand-primary/50" : "bg-white border-brand-primary/20"
        )}
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-10 py-10 border-b border-brand-sage/10">
          <Search className="text-brand-primary mr-6 shrink-0" size={36} />
          <input
            ref={inputRef}
            type="text"
            className={cn(
              "flex-1 bg-transparent border-none focus:ring-0 text-3xl outline-none font-black tracking-tight",
              theme === 'dark' ? "text-white" : "text-brand-surface"
            )}
            placeholder="Type to search..."
            value={searchQuery}
            onKeyDown={(e) => e.stopPropagation()} // Stop keys from leaking to layout
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-6 ml-4">
            {isSearching && <RefreshCw size={24} className="text-brand-primary animate-spin" />}
            <button
              onClick={() => setIsOpen(false)}
              className="p-3 bg-white/5 rounded-2xl hover:text-brand-primary transition-all"
            >
               <X size={32} />
            </button>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-10 space-y-8 scrollbar-hide">
           {searchQuery.length < 2 ? (
               <div className="py-10 text-center opacity-20 italic uppercase font-black tracking-widest">
                   Enter at least 2 characters...
               </div>
           ) : (
               <div className="space-y-10">
                  {results.facts.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] opacity-40 px-4">Insights</p>
                      {results.facts.map(fact => (
                        <button key={fact.id} onClick={() => { navigate(`/facts`); setIsOpen(false); }} className="w-full text-left p-6 rounded-3xl bg-white/5 border border-brand-sage/10 hover:border-brand-primary/40 transition-all flex items-center gap-6 group">
                          <FileText className="text-brand-primary" size={24} />
                          <div className="flex-1 min-w-0"><span className="text-base font-bold truncate block">{fact.fact}</span></div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.users.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em] opacity-40 px-4">Agents</p>
                      {results.users.map(user => (
                        <button key={user.id} onClick={() => { navigate(`/users`); setIsOpen(false); }} className="w-full text-left p-6 rounded-3xl bg-white/5 border border-brand-sage/10 hover:border-brand-secondary/40 transition-all flex items-center gap-6 group">
                          <Users className="text-brand-secondary" size={24} />
                          <div className="flex-1 min-w-0"><span className="text-base font-black truncate block">{user.profile?.email}</span></div>
                        </button>
                      ))}
                    </div>
                  )}
               </div>
           )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlobalSearch;
