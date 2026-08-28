import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  ArrowRight,
  MoreVertical,
  Flag,
  Tag,
  ShieldAlert,
  Zap,
  Check,
  X,
  RefreshCcw
} from 'lucide-react';
import { UserReport, ReportStatus, ReportType, ReportPriority } from '../../types';
import { fetchReports, subscribeToReports } from '../../services/firestoreService';
import { updateReportStatus } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';

const ReportsPage = () => {
  const { theme } = useTheme();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('OPEN');

  useEffect(() => {
    // Initial fetch
    loadReports();

    // Subscribe for real-time updates
    const unsubscribe = subscribeToReports(setReports);
    return () => unsubscribe();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      console.error('Load reports failed', err);
      toast.error('Telemetry Sync Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: ReportStatus) => {
    try {
      await updateReportStatus(id, newStatus, `Manual triage to ${newStatus}`);
      toast.success(`Protocol: ${newStatus}`);
    } catch (err: any) {
      toast.error(`Sync Failure: ${err.message}`);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.uid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (p: ReportPriority) => {
    switch (p) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-brand-gold bg-brand-gold/10 border-brand-gold/20';
      case 'LOW': return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
    }
  };

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'BUG': return <ShieldAlert size={14} />;
      case 'CONTENT': return <Flag size={14} />;
      case 'FEEDBACK': return <MessageSquare size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-brand-white">
             <div className="p-3 bg-red-500/10 rounded-2xl">
                <AlertCircle className="text-red-500" size={32} />
             </div>
             Feedback <span className="text-red-500">Telemetry</span>
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">User-Driven Exception Monitoring • Behavioral Feedback Loop</p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
           <div className="flex items-center gap-3 px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl shadow-inner">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-ping" />
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Monitoring Protocol Active</span>
           </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Search \u0026 Filter Bar */}
      <div className="glass p-8 rounded-[2rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-3xl">
        <div className="relative flex-1 md:w-[32rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search reports by content or user ID..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-brand-bg/5 dark:bg-brand-bg/50 p-1.5 rounded-2xl border border-brand-sage/10">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-6 py-2.5 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest",
                statusFilter === s ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub opacity-40 hover:opacity-100"
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <LoadingNode message="Accessing Feedback Buffer..." />
        ) : filteredReports.length === 0 ? (
          <EmptyBuffer
            icon={MessageSquare}
            title="Telemetry Stream Clean"
            message="No active user reports found in the current monitoring segment."
          />
        ) : (
          <AnimatePresence>
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-[3rem] p-10 shadow-xl group border-transparent hover:border-red-500/20 transition-all flex flex-col xl:flex-row gap-10 relative overflow-hidden"
              >
                {/* Meta Column */}
                <div className="xl:w-64 space-y-6">
                   <div className="flex items-center gap-3">
                      <span className={cn("px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border", getPriorityColor(report.priority))}>
                        {report.priority}
                      </span>
                      <div className="px-3 py-1.5 bg-brand-bg/50 border border-brand-sage/10 rounded-xl text-[9px] font-black text-sub uppercase flex items-center gap-2">
                        {getTypeIcon(report.type)} {report.type}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sub opacity-40 group-hover:opacity-100 transition-opacity">
                         <User size={14} className="text-brand-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest truncate">Agent: {report.uid.slice(0, 12)}...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sub opacity-40">
                         <Clock size={14} className="text-brand-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{formatTimeAgo(new Date(report.createdAt).toISOString())}</span>
                      </div>
                   </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-4">
                   <h3 className="text-2xl font-black tracking-tight text-brand-white uppercase">{report.subject}</h3>
                   <div className={cn("p-8 rounded-[2.5rem] border italic text-sm leading-relaxed", theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/10 text-brand-white/80" : "bg-brand-primary/5 border-brand-primary/5 text-brand-surface")}>
                      "{report.message}"
                   </div>
                </div>

                {/* Actions Column */}
                <div className="xl:w-56 flex flex-col justify-between items-end gap-6 pt-4">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-sub opacity-30 uppercase tracking-[0.3em]">Protocol State</p>
                      <p className={cn(
                        "text-xs font-black tracking-widest uppercase mt-1",
                        report.status === 'RESOLVED' ? "text-brand-primary" :
                        report.status === 'OPEN' ? "text-red-500" : "text-brand-gold"
                      )}>
                        {report.status.replace('_', ' ')}
                      </p>
                   </div>

                   <div className="flex gap-3">
                      {report.status !== 'RESOLVED' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                          className="p-4 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-brand-white rounded-2xl border border-brand-primary/20 transition-all shadow-xl"
                          title="Execute Resolution"
                        >
                          <Check size={20} />
                        </motion.button>
                      )}
                      {report.status === 'OPEN' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleStatusUpdate(report.id, 'IN_PROGRESS')}
                          className="p-4 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-white rounded-2xl border border-brand-gold/20 transition-all shadow-xl"
                          title="Initiate Triage"
                        >
                          <RefreshCcw size={20} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
                        className="p-4 bg-brand-bg/5 hover:bg-red-500/10 text-sub hover:text-red-500 rounded-2xl border border-brand-sage/10 transition-all shadow-xl"
                        title="Dismiss Trace"
                      >
                        <X size={20} />
                      </motion.button>
                   </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-red-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
