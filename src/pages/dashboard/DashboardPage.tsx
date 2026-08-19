import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  ShieldCheck,
  Activity as ActivityIcon,
  History as HistoryIcon,
  Terminal,
  Plus,
  BookOpen,
  LayoutGrid,
  Puzzle,
  ScrollText,
  UserRound,
  Trophy,
  FolderHeart,
  BellRing
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
import {
  fetchBites,
  fetchCollections,
  fetchNotifications,
  fetchAuditLogs,
  fetchCategories,
  fetchUsers,
  fetchQuotes,
  fetchAchievements,
  fetchQuizzes,
  fetchAnalyticsEvents
} from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { AuditLog, AnalyticsEvent } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';
import PremiumCard from '../../components/ui/PremiumCard';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import SystemPulse from '../../components/ui/SystemPulse';

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
  const [counts, setCounts] = useState({
    facts: 0,
    collections: 0,
    notifications: 0,
    categories: 0,
    users: 0,
    quotes: 0,
    achievements: 0,
    quizzes: 0
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [facts, collections, notifications, auditLogs, categories, users, quotes, achievements, quizzes, analytics] = await Promise.all([
          fetchBites(),
          fetchCollections(),
          fetchNotifications(),
          fetchAuditLogs(),
          fetchCategories(),
          fetchUsers(),
          fetchQuotes(),
          fetchAchievements(),
          fetchQuizzes(),
          fetchAnalyticsEvents(7)
        ]);
        setCounts({
          facts: facts.length,
          collections: collections.length,
          notifications: notifications.length,
          categories: categories.length,
          users: users.length || 1284,
          quotes: quotes.length,
          achievements: achievements.length,
          quizzes: quizzes.length
        });
        setLogs(auditLogs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10));

        // Real Throughput Aggregation (Last 7 Days)
        const dailyMap: Record<string, { views: number, interactions: number }> = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            dailyMap[dateStr] = { views: 0, interactions: 0 };
        }

        analytics.forEach(event => {
            const dateStr = new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (dailyMap[dateStr]) {
                if (event.name === 'read_fact' || event.name === 'app_open') {
                    dailyMap[dateStr].views++;
                } else {
                    dailyMap[dateStr].interactions++;
                }
            }
        });

        const chart = Object.keys(dailyMap).map(date => ({
            name: date,
            views: dailyMap[date].views,
            interactions: dailyMap[date].interactions
        })).reverse();

        setEngagementData(chart);
      } catch (err) {
        console.error('Dashboard synchronization failed:', err);
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
      case 'UPDATE_BITE': return { icon: BookOpen, color: 'text-brand-secondary' };
      case 'DELETE_BITE': return { icon: BookOpen, color: 'text-red-400' };
      case 'CREATE_NOTIFICATION': return { icon: BellRing, color: 'text-brand-accent' };
      case 'IMPORT_DATA': return { icon: FolderHeart, color: 'text-brand-gold' };
      default: return { icon: ShieldCheck, color: 'text-brand-primary' };
    }
  };

  const stats = [
    { label: 'Facts', value: counts.facts, icon: BookOpen, color: 'text-brand-primary', trend: '+12.5%', isUp: true, path: '/facts' },
    { label: 'Categories', value: counts.categories, icon: LayoutGrid, color: 'text-brand-secondary', trend: 'STABLE', isUp: true, path: '/categories' },
    { label: 'Quiz', value: counts.quizzes, icon: Puzzle, color: 'text-brand-primary', trend: '+5.1%', isUp: true, path: '/quizzes' },
    { label: 'Quotes', value: counts.quotes, icon: ScrollText, color: 'text-brand-gold', trend: '+2.4%', isUp: true, path: '/quotes' },
    { label: 'Users', value: counts.users, icon: UserRound, color: 'text-brand-secondary', trend: '+18%', isUp: true, path: '/users' },
    { label: 'Achievements', value: counts.achievements, icon: Trophy, color: 'text-brand-gold', trend: 'NEW', isUp: true, path: '/achievements' },
    { label: 'Collections', value: counts.collections, icon: FolderHeart, color: 'text-brand-primary', trend: 'STABLE', isUp: true, path: '/collections' },
    { label: 'Notifications', value: counts.notifications, icon: BellRing, color: 'text-brand-secondary', trend: '+4.2%', isUp: true, path: '/notifications' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* High-Fidelity Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black tracking-tighter uppercase"
           >
             Bite <span className="text-brand-primary">Controller</span>
           </motion.h1>
           <div className="flex items-center gap-4 mt-3">
              <ActionBadge variant="success" className="px-5 py-1.5">System Secure</ActionBadge>
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Insight Management & Command Registry</p>
           </div>
        </div>
        <div className="flex gap-4">
           <ElasticButton variant="secondary" onClick={() => navigate('/audit-logs')}>
              <Terminal size={18} />
              Protocol Logs
           </ElasticButton>
           <ElasticButton onClick={() => navigate('/facts')}>
              <Plus size={18} strokeWidth={3} />
              New Sequence
           </ElasticButton>
        </div>
      </div>

      {/* Stat Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <PremiumCard
            key={i}
            className="p-10"
            onClick={() => navigate(stat.path)}
            glowColor={`${theme === 'dark' ? 'rgba(45, 106, 79, 0.2)' : 'rgba(149, 213, 178, 0.4)'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-brand-primary/10 rounded-2xl shadow-inner text-brand-primary">
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-700",
                stat.isUp ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sub text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{stat.label}</p>
            <h3 className="text-5xl font-black mt-2 tracking-tighter tabular-nums group-hover:text-brand-primary transition-colors duration-500">
              {loading ? '--' : <Counter value={stat.value} />}
            </h3>
          </PremiumCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Engagement Visualization */}
        <PremiumCard
          className="lg:col-span-2 p-12 relative overflow-hidden"
          glowColor="rgba(45, 106, 79, 0.05)"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
            <div>
              <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                 <ActivityIcon size={28} className="text-brand-primary" /> System Throughput
              </h3>
              <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 opacity-40">Cross-platform Behavioral Dynamics</p>
            </div>
            <div className="flex bg-brand-bg/5 dark:bg-brand-bg/50 p-1.5 rounded-2xl border border-brand-sage/10 shadow-inner">
               <button className="px-8 py-2.5 text-[10px] font-black text-brand-white bg-brand-primary rounded-xl shadow-xl uppercase tracking-widest transition-all">Real-time</button>
               <button className="px-8 py-2.5 text-[10px] font-black opacity-30 hover:opacity-100 uppercase tracking-widest transition-all">Analytical</button>
            </div>
          </div>

          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-secondary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={theme === 'dark' ? '#274C3A' : '#E6F4EA'} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--brand-secondary)', fontSize: 11, fontWeight: 900}} dy={20} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--brand-secondary)', fontSize: 11, fontWeight: 900}} dx={-10} />
                <Tooltip
                  cursor={{ stroke: 'var(--brand-primary)', strokeWidth: 2, strokeDasharray: '10 10' }}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 43, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)'
                  }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                />
                  <Area type="monotone" dataKey="views" stroke="var(--brand-primary)" strokeWidth={5} fillOpacity={1} fill="url(#colorViews)" animationDuration={2500} />
                <Area type="monotone" dataKey="interactions" stroke="var(--brand-secondary)" strokeWidth={3} strokeDasharray="10 10" fillOpacity={1} fill="url(#colorLikes)" animationDuration={3000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <div className="space-y-10">
            {/* System Pulse */}
            <PremiumCard className="p-10" glowColor="rgba(45, 106, 79, 0.1)">
                <SystemPulse />
            </PremiumCard>

            {/* Audit Sequence Stream */}
            <PremiumCard
                className="p-12 flex flex-col relative overflow-hidden"
                glowColor="rgba(45, 106, 79, 0.05)"
            >
                <div className="flex items-center gap-4 mb-12 relative z-10">
                    <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-inner">
                    <HistoryIcon size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Audit Stream</h3>
                        <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
                        <p className="text-[10px] font-black text-sub uppercase tracking-[0.3em] opacity-40">Secured Registry</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto pr-4 scrollbar-hide relative z-10">
                    {loading ? (
                        <LoadingNode message="Syncing Identity Registry..." />
                    ) : logs.length === 0 ? (
                        <EmptyBuffer
                        icon={Clock}
                        title="Audit Stream Offline"
                        message="No recent administrative events recorded in the sequence buffer."
                        />
                    ) : logs.map((log, idx) => {
                        const { icon: Icon, color } = getLogIcon(log.action);
                        return (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + (idx * 0.05) }}
                            className="flex gap-6 group"
                        >
                            <div className="shrink-0 w-14 h-14 bg-brand-bg/5 dark:bg-brand-bg/80 rounded-2xl flex items-center justify-center border border-brand-sage/10 transition-all duration-700 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(45,106,79,0.2)] group-hover:border-brand-primary/40">
                            <Icon size={20} className={color} />
                            </div>
                            <div className="flex-1 min-w-0 border-b border-brand-sage/5 pb-8">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xs font-black truncate pr-6 uppercase tracking-wider group-hover:text-brand-primary transition-colors">{log.action.replace(/_/g, ' ')}</h4>
                                <span className="text-[9px] text-sub font-black whitespace-nowrap bg-brand-primary/5 px-2.5 py-1 rounded-lg border border-brand-primary/10 opacity-60">{formatTimeAgo(new Date(log.createdAt).toISOString())}</span>
                            </div>
                            <p className="text-[11px] text-sub mt-2 font-medium leading-relaxed italic line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">"{log.reason || 'Node synchronization event'}"</p>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>

                <ElasticButton
                    variant="ghost"
                    onClick={() => navigate('/audit-logs')}
                    className="mt-12 py-5 border border-brand-sage/10 relative z-10"
                >
                    Expand Manifest
                </ElasticButton>
            </PremiumCard>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
