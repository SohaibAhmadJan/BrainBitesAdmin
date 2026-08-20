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
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import ActionBadge from '../../components/ui/ActionBadge';
import AuditDetailDrawer from '../../components/ui/AuditDetailDrawer';

const AuditLogsPage = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState<number>(7); // Days
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [dateRange]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(300); // Increased limit for better filtering
      setLogs(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('Load logs failed', err);
    } finally {
      setLoading(false);
    }
  };

  const targetTypes = ['All', ...new Set(logs.map(l => l.targetType))];
  const actions = ['All', ...new Set(logs.map(l => l.action))];

  const filteredLogs = logs.filter(log => {
    const startTime = Date.now() - (dateRange * 24 * 60 * 60 * 1000);
    const matchesDate = log.createdAt >= startTime;
    return matchesDate &&
    (typeFilter === 'All' || log.targetType === typeFilter) &&
    (actionFilter === 'All' || log.action === actionFilter) &&
    (log.adminUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase()));
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
             Administrative <span className="text-brand-primary">Audit</span>
           </motion.h1>
           <div className="mt-3">
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Secure Immutability Trace Logs</p>
           </div>
        </div>
      </div>

      {/* Search \u0026 Action Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="relative flex-1 md:w-[30rem] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search log sequence..."
              className="w-full bg-brand-bg/5 dark:bg-brand-bg/40 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-56 group">
             <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 pointer-events-none" size={20} />
             <select
                className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                {targetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
          </div>

          <div className="relative w-full md:w-56 group">
             <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 pointer-events-none" size={20} />
             <select
                className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer"
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
              >
                {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
              </select>
          </div>

          <div className="relative w-full md:w-48 group">
             <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 pointer-events-none" size={20} />
             <select
                className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer"
                value={dateRange}
                onChange={e => setDateRange(parseInt(e.target.value))}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-sub uppercase tracking-[0.3em] opacity-40">Chain Length</p>
              <p className="text-2xl font-black text-brand-primary tabular-nums">{filteredLogs.length}</p>
           </div>
        </div>
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
            <LoadingNode message="Decrypting Security Stream..." />
          ) : filteredLogs.length === 0 ? (
            <EmptyBuffer
              icon={Terminal}
              title="Audit Log Empty"
              message="No administrative events found in the current security imutability stream."
            />
          ) : (
            <AnimatePresence>
              {filteredLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedLog(log)}
                  className="p-8 hover:bg-brand-white/5 transition-all group flex gap-8 relative overflow-hidden cursor-pointer"
                >
                  <div className="shrink-0 w-14 h-14 bg-brand-bg/5 dark:bg-brand-bg rounded-2xl flex items-center justify-center text-sub group-hover:text-brand-primary group-hover:border-brand-primary/40 border border-brand-sage/10 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(45,106,79,0.2)]">
                    <Clock size={22} />
                  </div>
                  <div className="flex-1 space-y-3 relative z-10">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <span className="text-sm font-black tracking-tight group-hover:text-brand-primary transition-colors uppercase">{log.action.replace(/_/g, ' ')}</span>
                          <span className="px-3 py-1 rounded-lg bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/10 text-[9px] font-black text-sub uppercase tracking-widest shadow-sm">{log.adminUid}</span>
                       </div>
                       <span className="text-[10px] font-black text-sub opacity-40 bg-brand-bg/5 dark:bg-brand-bg px-2 py-0.5 rounded-md border border-brand-sage/10 tabular-nums">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={cn(
                      "p-5 rounded-2xl border text-sm font-medium leading-relaxed relative",
                      theme === 'dark' ? "bg-brand-bg/30 border-brand-sage/10 text-brand-white/70" : "bg-brand-primary/5 border-brand-primary/5 text-brand-surface/80"
                    )}>
                       <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/20 rounded-l-2xl" />
                       <span className="italic">{log.reason || 'No reason provided'}</span>
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

      <AnimatePresence>
        {selectedLog && (
          <AuditDetailDrawer
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLogsPage;
