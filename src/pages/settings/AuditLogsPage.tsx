import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  Terminal,
  User,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { AuditLog } from '../../types';
import { fetchAuditLogs } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';

const AuditLogsPage = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error('Load logs failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Terminal className="text-brand-primary" size={32} />
             </div>
             Administrative Audit
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Secure Immutability Stream • Identity Access Logs</p>
        </div>

        <div className="relative w-full md:w-[30rem] group z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search log sequence..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/40 border border-brand-sage/20 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] relative">
        <div className="p-8 bg-brand-primary/5 border-b border-brand-sage/10 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary shadow-inner">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[10px] font-black text-sub uppercase tracking-[0.3em] opacity-40">Chain Integrity</p>
                 <p className="text-xs font-mono text-brand-primary font-black uppercase tracking-widest">SEQ-882-VERIFIED-NODE</p>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-8">
              <div className="flex flex-col items-end">
                 <p className="text-[8px] font-black text-sub uppercase opacity-40">Global Events</p>
                 <p className="text-sm font-black text-brand-primary">{logs.length.toLocaleString()}</p>
              </div>
              <div className="w-[1px] h-8 bg-brand-sage/10" />
              <div className="flex flex-col items-end">
                 <p className="text-[8px] font-black text-sub uppercase opacity-40">Agent Identity</p>
                 <p className="text-sm font-black text-brand-primary">ROOT</p>
              </div>
           </div>
        </div>

        <div className="divide-y divide-brand-sage/5">
          {loading ? (
            <div className="p-40 text-center flex flex-col items-center justify-center gap-6 animate-pulse opacity-20">
               <Fingerprint size={64} className="text-brand-primary" />
               <p className="font-black uppercase tracking-[0.5em] text-sm">Decrypting Security Stream...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-40 text-center text-sub opacity-20 uppercase font-black tracking-[0.3em]">No matching events in sequence</div>
          ) : (
            <AnimatePresence>
              {filteredLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-8 hover:bg-brand-white/5 transition-all group flex gap-8 relative overflow-hidden"
                >
                  <div className="shrink-0 w-14 h-14 bg-brand-bg/5 dark:bg-brand-bg rounded-2xl flex items-center justify-center text-sub group-hover:text-brand-primary group-hover:border-brand-primary/40 border border-brand-sage/10 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(45,106,79,0.2)]">
                    <Clock size={22} />
                  </div>
                  <div className="flex-1 space-y-3 relative z-10">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <span className="text-sm font-black tracking-tight group-hover:text-brand-primary transition-colors uppercase">{log.action.replace(/_/g, ' ')}</span>
                          <span className="px-3 py-1 rounded-lg bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/10 text-[9px] font-black text-sub uppercase tracking-widest shadow-sm">{log.adminEmail}</span>
                       </div>
                       <span className="text-[10px] font-black text-sub opacity-40 bg-brand-bg/5 dark:bg-brand-bg px-2 py-0.5 rounded-md border border-brand-sage/10 tabular-nums">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className={cn(
                      "p-5 rounded-2xl border text-sm font-medium leading-relaxed relative",
                      theme === 'dark' ? "bg-brand-bg/30 border-brand-sage/10 text-brand-white/70" : "bg-brand-primary/5 border-brand-primary/5 text-brand-surface/80"
                    )}>
                       <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/20 rounded-l-2xl" />
                       <span className="italic">"{log.details}"</span>
                    </div>
                    {log.targetId && (
                      <div className="flex items-center gap-2 text-[9px] font-black text-sub uppercase tracking-[0.2em] opacity-30">
                         <Cpu size={10} /> Target Hash: <span className="text-brand-primary">#{log.targetId.slice(0, 16)}</span>
                      </div>
                    )}
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
             className="px-8 py-3 rounded-2xl glass border-brand-sage/10 text-[10px] font-black uppercase tracking-widest text-sub hover:text-brand-primary transition-all"
           >
             <ChevronLeft size={16} className="inline mr-2" /> Previous Sequence
           </motion.button>
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="px-8 py-3 rounded-2xl glass border-brand-sage/10 text-[10px] font-black uppercase tracking-widest text-sub hover:text-brand-primary transition-all"
           >
             Next Sequence <ChevronRight size={16} className="inline ml-2" />
           </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
