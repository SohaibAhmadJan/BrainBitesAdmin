import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, User, Command, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOutAdmin, observeAuthState } from '../services/firebaseService';
import type { User as FirebaseUser } from 'firebase/auth';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  title: string;
  setIsSearchOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ title, setIsSearchOpen, isSidebarCollapsed }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { theme, toggleTheme } = useTheme();
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
      "shrink-0 flex items-center justify-between px-8 h-16 transition-all duration-500 relative z-20 border-b",
      isScrolled
        ? theme === 'dark'
          ? "bg-brand-bg/60 backdrop-blur-xl border-brand-sage/20 shadow-xl"
          : "bg-white/60 backdrop-blur-xl border-brand-primary/10 shadow-md"
        : theme === 'dark' ? "border-brand-sage/10" : "border-brand-primary/5"
    )}>
      <div className="flex items-center gap-4">
        <motion.h2
          key={title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "text-xl font-bold tracking-tight capitalize",
            theme === 'dark' ? "text-brand-white" : "text-brand-surface"
          )}
        >
          {title}
        </motion.h2>
      </div>

      <div className="flex items-center gap-8 justify-end">
        {/* Floating Glass Search Trigger */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSearchOpen(true)}
          className={cn(
            "flex items-center gap-3 backdrop-blur-md border px-4 py-1.5 rounded-xl transition-all group w-full max-w-md shadow-sm",
            theme === 'dark'
              ? "bg-brand-surface/40 border-brand-sage/20 text-brand-white/30 hover:border-brand-primary/50"
              : "bg-white/80 border-brand-primary/10 text-brand-surface/40 hover:border-brand-primary/30"
          )}
        >
          <Search size={16} className="group-hover:text-brand-primary transition-colors duration-300" />
          <span className="text-xs font-medium tracking-wide">Search...</span>
          <div className={cn(
            "ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded border",
            theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/30" : "bg-brand-primary/5 border-brand-primary/10"
          )}>
            <Command size={10} className="opacity-50" />
            <span className="text-[9px] font-black opacity-50">K</span>
          </div>
        </motion.button>

        <div className={cn("flex items-center gap-4 border-l pl-8", theme === 'dark' ? "border-brand-sage/20" : "border-brand-primary/10")}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={cn(
              "p-2.5 rounded-xl transition-all border shadow-lg duration-500",
              theme === 'dark'
                ? "bg-brand-surface/30 border-brand-sage/10 text-brand-gold hover:text-brand-primary"
                : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary hover:bg-brand-primary/10"
            )}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/notifications')}
            className={cn(
              "relative p-2.5 rounded-xl border shadow-lg transition-all",
              theme === 'dark'
                ? "bg-brand-surface/30 border-brand-sage/10 text-brand-secondary hover:text-brand-primary"
                : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary hover:bg-brand-primary/10"
            )}
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-brand-bg shadow-[0_0_10px_rgba(233,196,106,0.6)]"></span>
          </motion.button>

          <div className="group relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 pl-4"
            >
              <div className={cn(
                "w-8 h-8 border rounded-xl flex items-center justify-center font-bold text-xs transition-all",
                theme === 'dark'
                  ? "bg-brand-primary/20 border-brand-primary/30 text-brand-primary"
                  : "bg-brand-primary border-brand-primary text-white"
              )}>
                BB
              </div>
            </motion.button>

            <div className={cn(
              "absolute right-0 mt-3 w-64 backdrop-blur-3xl border rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 p-2 z-50",
              theme === 'dark' ? "bg-brand-surface/95 border-brand-sage/30" : "bg-white/95 border-brand-primary/10"
            )}>
               <div className={cn("px-5 py-4 border-b mb-2", theme === 'dark' ? "border-brand-sage/10" : "border-brand-primary/5")}>
                 <p className="text-xs font-black tracking-widest uppercase opacity-40 mb-1">Authenticated As</p>
                 <p className={cn("text-sm font-bold truncate", theme === 'dark' ? "text-brand-white" : "text-brand-surface")}>{user?.email || 'master@brainbites.com'}</p>
                 <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(45,106,79,1)]" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">System Root Access</span>
                 </div>
               </div>
               <button
                onClick={() => navigate('/settings')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all duration-300",
                  theme === 'dark' ? "text-brand-white/70 hover:text-brand-white hover:bg-brand-primary/20" : "text-brand-surface/70 hover:text-brand-primary hover:bg-brand-primary/5"
                )}
               >
                 <User size={18} className="text-brand-secondary" /> Profile Dashboard
               </button>
               <button
                onClick={() => signOutAdmin()}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all duration-300 mt-1",
                  theme === 'dark' ? "text-brand-accent/70 hover:text-brand-white hover:bg-brand-accent/10" : "text-red-500/70 hover:text-red-500 hover:bg-red-500/5"
                )}
               >
                 <LogOut size={18} /> Terminate Session
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
