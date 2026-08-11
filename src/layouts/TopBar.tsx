import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, User, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOutAdmin, observeAuthState } from '../services/firebaseService';
import type { User as FirebaseUser } from 'firebase/auth';
import { cn } from '../utils/cn';

interface TopBarProps {
  title: string;
  setIsSearchOpen: (open: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, setIsSearchOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = observeAuthState((currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn(
      "sticky top-0 right-0 z-20 flex items-center justify-between px-8 py-6 transition-all duration-500",
      isScrolled ? "bg-brand-bg/40 backdrop-blur-2xl border-b border-brand-sage/20 shadow-2xl" : "bg-transparent"
    )}>
      <div className="flex items-center gap-4">
        <motion.h2
          key={title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black text-brand-white tracking-tighter capitalize"
        >
          {title}
        </motion.h2>
      </div>

      <div className="flex items-center gap-8 flex-1 justify-end">
        {/* Floating Glass Search Trigger */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 bg-brand-surface/40 backdrop-blur-md border border-brand-sage/20 px-5 py-3 rounded-2xl text-brand-white/30 hover:border-brand-primary/50 transition-all group w-full max-w-lg shadow-xl"
        >
          <Search size={18} className="group-hover:text-brand-primary transition-colors duration-300" />
          <span className="text-sm font-medium tracking-wide">Quick Command Palette...</span>
          <div className="ml-auto flex items-center gap-1 bg-brand-bg/50 px-2 py-1 rounded-lg border border-brand-sage/30">
            <Command size={12} className="opacity-50" />
            <span className="text-[10px] font-black opacity-50">K</span>
          </div>
        </motion.button>

        <div className="flex items-center gap-4 border-l border-brand-sage/20 pl-8">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 text-brand-secondary hover:text-brand-primary transition-colors rounded-xl bg-brand-surface/30 border border-brand-sage/10 shadow-lg"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-brand-bg shadow-[0_0_10px_rgba(233,196,106,0.6)]"></span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/settings')}
            className="p-2.5 text-brand-secondary hover:text-brand-primary transition-colors rounded-xl bg-brand-surface/30 border border-brand-sage/10 shadow-lg"
          >
            <Settings size={22} />
          </motion.button>

          <div className="group relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 pl-4"
            >
              <div className="w-11 h-11 bg-brand-primary/20 border-2 border-brand-primary/30 rounded-2xl flex items-center justify-center text-brand-primary font-black text-sm shadow-[0_0_20px_rgba(45,106,79,0.2)]">
                BB
              </div>
            </motion.button>

            <div className="absolute right-0 mt-3 w-64 bg-brand-surface/90 backdrop-blur-3xl border border-brand-sage/30 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 p-3 z-50">
               <div className="px-5 py-4 border-b border-brand-sage/10 mb-2">
                 <p className="text-xs font-black text-brand-white tracking-widest uppercase opacity-40 mb-1">Authenticated As</p>
                 <p className="text-sm font-bold text-brand-white truncate">{user?.email || 'master@brainbites.com'}</p>
                 <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(45,106,79,1)]" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">System Root Access</span>
                 </div>
               </div>
               <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-white/70 hover:text-brand-white hover:bg-brand-primary/20 rounded-2xl transition-all duration-300"
               >
                 <User size={18} className="text-brand-secondary" /> Profile Dashboard
               </button>
               <button
                onClick={() => signOutAdmin()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-accent/70 hover:text-brand-white hover:bg-brand-accent/10 rounded-2xl transition-all duration-300 mt-1"
               >
                 <LogOut size={18} className="text-brand-accent" /> Terminate Session
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
