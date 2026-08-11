import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Layers,
  Bell,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Database,
  ShieldCheck,
  Zap,
  Activity as ActivityIcon,
  History as HistoryIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchBites, fetchCollections, fetchNotifications, fetchAuditLogs } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { AuditLog, BiteCategories } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';

const Counter = ({ value }: { value: number | string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/,/g, ''));

  useEffect(() => {
    let start = 0;
    const end = numValue;
    if (start === end) return;

    let totalMiliseconds = 1000;
    let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;

    let timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numValue]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const DashboardPage = () => {
  const { theme } = useTheme();
  const [counts, setCounts] = useState({ facts: 0, collections: 0, notifications: 0 });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [facts, collections, notifications, auditLogs] = await Promise.all([
          fetchBites(),
          fetchCollections(),
          fetchNotifications(),
          fetchAuditLogs()
        ]);
        setCounts({
          facts: facts.length,
          collections: collections.length,
          notifications: notifications.length
        });
        setLogs(auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8));

        const chart = facts.slice(0, 7).map(f => ({
          name: f.id,
          views: (f as any).views || Math.floor(Math.random() * 500) + 200,
          likes: (f as any).likes || Math.floor(Math.random() * 100) + 50
        }));
        setEngagementData(chart);
      } catch (err) {
        console.error('Dashboard data load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'UPDATE_SYSTEM_SETTINGS': return { icon: Settings, color: 'text-brand-primary' };
      case 'CREATE_BITE':
      case 'UPDATE_BITE': return { icon: FileText, color: 'text-brand-secondary' };
      case 'DELETE_BITE': return { icon: FileText, color: 'text-red-400' };
      case 'CREATE_NOTIFICATION': return { icon: Bell, color: 'text-brand-accent' };
      case 'IMPORT_DATA': return { icon: Database, color: 'text-brand-gold' };
      default: return { icon: ShieldCheck, color: 'text-brand-secondary' };
    }
  };

  const stats = [
    { label: 'Total Facts', value: counts.facts, icon: FileText, color: 'text-brand-primary', bg: 'bg-brand-primary/10', trend: '+12.5%', isUp: true },
    { label: 'Psych Domains', value: BiteCategories.length, icon: Layers, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10', trend: 'Fixed', isUp: true },
    { label: 'Collections', value: counts.collections, icon: Database, color: 'text-brand-accent', bg: 'bg-brand-accent/10', trend: '+3', isUp: true },
    { label: 'Reach', value: counts.notifications * 450, icon: Zap, color: 'text-brand-gold', bg: 'bg-brand-gold/10', trend: 'Active', isUp: true },
    { label: 'Total Users', value: 1284, icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10', trend: '+18%', isUp: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <motion.h1
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-4xl font-black tracking-tight"
           >
             Welcome Back, <span className="text-brand-primary">Administrator</span>
           </motion.h1>
           <p className="text-sub font-bold mt-1 uppercase tracking-[0.2em] text-xs">Intelligence Center • Real-time Operations</p>
        </div>
        <div className="flex gap-4">
           <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(45,106,79,1)]" />
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Network Secure</span>
           </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass p-6 rounded-[2.5rem] shadow-xl hover:border-brand-primary/40 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg)}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[9px] font-black px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/5",
                stat.isUp ? "bg-brand-primary/10 text-brand-primary" : "bg-red-500/10 text-red-500"
              )}>
                {stat.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <p className="text-sub text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-4xl font-black mt-1.5 tracking-tighter">
                {loading ? '...' : <Counter value={stat.value} />}
              </h3>
            </div>
            {/* Ambient Background Glow */}
            <div className={cn(
              "absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity rounded-full",
              stat.color.replace('text-', 'bg-')
            )}></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                 <ActivityIcon size={24} className="text-brand-primary" /> System Throughput
              </h3>
              <p className="text-sub text-xs font-bold uppercase tracking-widest mt-1">Cross-platform Engagement Dynamics</p>
            </div>
            <div className="flex bg-brand-bg/5 dark:bg-brand-bg/50 p-1.5 rounded-2xl border border-brand-sage/10">
               <button className="px-5 py-2 text-[10px] font-black text-brand-white bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20 uppercase tracking-widest transition-all">Real-time</button>
               <button className="px-5 py-2 text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest transition-all">Snapshot</button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#95D5B2" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#95D5B2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={theme === 'dark' ? '#274C3A' : '#E6F4EA'} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#95D5B2', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#95D5B2', fontSize: 11, fontWeight: 700}} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1A2B22' : '#FFFFFF',
                    borderColor: '#2D6A4F',
                    borderRadius: '20px',
                    fontSize: '12px',
                    border: '1px solid rgba(45,106,79,0.3)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                  itemStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#2D6A4F" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" animationDuration={2000} />
                <Area type="monotone" dataKey="likes" stroke="#95D5B2" strokeWidth={3} strokeDasharray="10 10" fillOpacity={1} fill="url(#colorLikes)" animationDuration={2500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Event Stream */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col border-brand-secondary/5"
        >
          <div className="flex items-center gap-3 mb-10">
             <div className="p-2.5 bg-brand-primary/10 rounded-2xl">
               <HistoryIcon size={20} className="text-brand-primary" />
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight">Audit Stream</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                   <p className="text-[9px] font-black text-sub uppercase tracking-[0.2em]">Monitoring Active</p>
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
            <AnimatePresence>
              {logs.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 italic py-10">
                  <Clock size={40} className="rotate-12" />
                  <p className="text-sm font-bold tracking-tighter">Event sequence empty</p>
                </div>
              ) : logs.map((log, idx) => {
                const { icon: Icon, color } = getLogIcon(log.action);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (idx * 0.05) }}
                    className="flex gap-5 group"
                  >
                    <div className="shrink-0 w-12 h-12 bg-brand-bg/5 dark:bg-brand-bg/50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all border border-brand-sage/10 duration-500">
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0 border-b border-brand-sage/10 pb-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black truncate pr-4 uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</h4>
                        <span className="text-[10px] text-sub font-black whitespace-nowrap bg-brand-bg/5 dark:bg-brand-bg/50 px-2 py-0.5 rounded-lg border border-brand-sage/10">{formatTimeAgo(log.timestamp)}</span>
                      </div>
                      <p className="text-[11px] text-sub mt-1.5 font-medium leading-relaxed italic line-clamp-1">"{log.details}"</p>
                      <p className="text-[10px] opacity-40 mt-1 uppercase font-black tracking-tighter">Agent: <span className="text-brand-primary/60">{log.adminEmail}</span></p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/audit-logs')}
            className="mt-10 w-full py-5 bg-brand-bg/5 dark:bg-brand-bg/50 hover:bg-brand-primary text-sub hover:text-brand-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] transition-all border border-brand-sage/10 hover:border-brand-primary shadow-xl"
          >
            Sequence Manifest
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
};

export default DashboardPage;
