import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  Clock,
  Filter,
  Eye,
  Heart,
  CheckCircle2,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Zap,
  Radio,
  Fingerprint
} from 'lucide-react';
import { UserActivity } from '../../types';
import { fetchRecentActivity } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';

const UserActivityPage = () => {
  const { theme } = useTheme();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentActivity();
      setActivities(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error('Load activity failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(act =>
    act.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Activity className="text-brand-primary" size={32} />
             </div>
             Activity Radar
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Real-time Behavioral Stream • Identity Sequence Monitoring</p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
           <div className="flex items-center gap-3 px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl shadow-inner">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-ping" />
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Live Feed Active</span>
           </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative">
        <div className="p-8 bg-brand-primary/5 border-b border-brand-sage/10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="relative w-full md:w-[30rem] group z-10">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-primary transition-colors" size={20} />
             <input
               type="text"
               placeholder="Query identity sequence..."
               className="w-full bg-brand-bg/5 dark:bg-brand-bg/40 border border-brand-sage/20 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex gap-3 z-10">
              <motion.button whileHover={{ scale: 1.05 }} className="p-3 glass rounded-xl text-sub hover:text-brand-primary border-brand-sage/10"><Filter size={20} /></motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                onClick={loadActivity}
                className="p-3 glass rounded-xl text-sub hover:text-brand-primary border-brand-sage/10 transition-all duration-700"
              >
                <Clock size={20} />
              </motion.button>
           </div>
        </div>

        <div className="divide-y divide-brand-sage/5">
          {loading ? (
            <div className="p-40 text-center flex flex-col items-center justify-center gap-6 animate-pulse opacity-20">
               <Fingerprint size={64} className="text-brand-primary" />
               <p className="font-black uppercase tracking-[0.5em] text-sm">Decoding Event Buffer...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-40 text-center text-sub opacity-20 uppercase font-black tracking-[0.3em]">No activity matches in current sequence</div>
          ) : (
            <AnimatePresence>
              {filteredActivities.map((act, idx) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-8 hover:bg-brand-white/5 transition-all group flex gap-8 relative overflow-hidden"
                >
                  <div className={cn(
                    "shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:scale-110",
                    act.type === 'READ_FACT' ? "bg-brand-primary/10 text-brand-primary" :
                    act.type === 'LIKE_FACT' ? "bg-pink-500/10 text-pink-500" :
                    act.type === 'COMPLETE_QUIZ' ? "bg-brand-gold/10 text-brand-gold" :
                    "bg-brand-secondary/10 text-brand-secondary"
                  )}>
                    {act.type === 'READ_FACT' && <Eye size={22} />}
                    {act.type === 'LIKE_FACT' && <Heart size={22} />}
                    {act.type === 'COMPLETE_QUIZ' && <CheckCircle2 size={22} />}
                    {act.type === 'APP_OPEN' && <Smartphone size={22} />}
                  </div>

                  <div className="flex-1 space-y-2 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-base font-bold tracking-tight">
                             Agent <span className="text-brand-primary font-black">#{act.userId.slice(0, 8)}...</span> {
                               act.type === 'READ_FACT' ? 'executed reading of' :
                               act.type === 'LIKE_FACT' ? 'anchored appreciation for' :
                               act.type === 'COMPLETE_QUIZ' ? 'verified challenge logic for' : 'initiated sequence access'
                             }
                          </p>
                          {act.targetName && (
                            <p className="text-sm font-black text-brand-primary italic opacity-80">{act.targetName}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-sub opacity-40 bg-brand-bg/5 dark:bg-brand-bg px-2 py-0.5 rounded-md border border-brand-sage/10 tabular-nums">
                          {new Date(act.timestamp).toLocaleTimeString()} • {formatTimeAgo(act.timestamp)}
                        </span>
                     </div>
                     <div className="flex items-center gap-6 text-[9px] font-black text-sub uppercase tracking-[0.2em] opacity-30 group-hover:opacity-60 transition-opacity">
                        <span className="flex items-center gap-2"><Zap size={10} className="text-brand-primary animate-pulse" /> Signal Latency: 42ms</span>
                        <span>Sequence Trace: {act.id.slice(0, 16)}</span>
                     </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-10 border-t border-brand-sage/5 flex justify-center gap-4 bg-brand-primary/5">
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="px-10 py-3 rounded-2xl glass border-brand-sage/10 text-[10px] font-black uppercase tracking-widest text-sub hover:text-brand-primary transition-all"
           >
             Older Sequences
           </motion.button>
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="px-10 py-3 rounded-2xl glass border-brand-sage/10 text-[10px] font-black uppercase tracking-widest text-sub hover:text-brand-primary transition-all"
           >
             Newer Sequences
           </motion.button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage;
