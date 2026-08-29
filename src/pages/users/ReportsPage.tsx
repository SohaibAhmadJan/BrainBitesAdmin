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
      <div className="glass p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 flex items-center gap-4">
           <div className="p-2.5 bg-red-500/10 rounded-xl">
              <AlertCircle className="text-red-500" size={24} />
           </div>
           <div>
             <h2 className="text-2xl font-bold tracking-tight text-brand-white">Feedback Telemetry</h2>
             <p className="text-[10px] text-sub font-bold uppercase tracking-widest mt-0.5 opacity-60">Exception Monitoring Loop</p>
           </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
           <div className="flex items-center gap-3 px-4 py-2 bg-brand-primary/5 border border-brand-primary/10 rounded-xl shadow-sm">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Active Monitoring</span>
           </div>
        </div>
      </div>

      {/* Search \u0026 Filter Bar */}
      <div className="glass p-4 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4 backdrop-blur-xl">
        <div className="relative flex-1 md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-brand-bg/5 dark:bg-brand-bg/50 p-1 rounded-xl border border-brand-sage/10">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-1.5 text-[9px] font-bold rounded-lg transition-all uppercase tracking-widest",
                statusFilter === s ? "bg-brand-primary text-brand-white" : "text-sub opacity-40 hover:opacity-100"
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <LoadingNode message="Accessing Buffer..." />
        ) : filteredReports.length === 0 ? (
          <EmptyBuffer
            icon={MessageSquare}
            title="Telemetry Stream Clean"
            message="No active reports found."
          />
        ) : (
          <AnimatePresence>
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 shadow-lg group border-transparent hover:border-red-500/10 transition-all flex flex-col xl:flex-row gap-8 relative overflow-hidden"
              >
                {/* Meta Column */}
                <div className="xl:w-48 space-y-4">
                   <div className="flex flex-col gap-2">
                      <span className={cn("px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border w-fit", getPriorityColor(report.priority))}>
                        {report.priority}
                      </span>
                      <div className="px-2 py-1 bg-brand-bg/50 border border-brand-sage/10 rounded-lg text-[9px] font-bold text-sub uppercase flex items-center gap-2 w-fit">
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
                <div className="flex-1 space-y-3">
                   <h3 className="text-xl font-bold tracking-tight text-brand-white uppercase">{report.subject}</h3>
                   <div className={cn("p-6 rounded-2xl border italic text-sm leading-relaxed", theme === 'dark' ? "bg-brand-bg/50 border-brand-sage/10 text-brand-white/80" : "bg-brand-primary/5 border-brand-primary/5 text-brand-surface")}>
                      "{report.message}"
                   </div>
                </div>

                {/* Actions Column */}
                <div className="xl:w-48 flex flex-col justify-between items-end gap-4 pt-2">
                   <div className="text-right">
                      <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">State</p>
                      <p className={cn(
                        "text-[10px] font-bold tracking-widest uppercase mt-0.5",
                        report.status === 'RESOLVED' ? "text-brand-primary" :
                        report.status === 'OPEN' ? "text-red-500" : "text-brand-gold"
                      )}>
                        {report.status.replace('_', ' ')}
                      </p>
                   </div>

                   <div className="flex gap-2">
                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                          className="p-3 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-brand-white rounded-xl border border-brand-primary/20 transition-all shadow-sm"
                          title="Execute Resolution"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {report.status === 'OPEN' && (
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'IN_PROGRESS')}
                          className="p-3 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-white rounded-xl border border-brand-gold/20 transition-all shadow-sm"
                          title="Initiate Triage"
                        >
                          <RefreshCcw size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
                        className="p-3 bg-brand-bg/5 hover:bg-red-500/10 text-sub hover:text-red-500 rounded-xl border border-brand-sage/10 transition-all shadow-sm"
                        title="Dismiss Trace"
                      >
                        <X size={18} />
                      </button>
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
