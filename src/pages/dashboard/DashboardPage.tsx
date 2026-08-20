import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
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
  BellRing,
  Send,
  Radio
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
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
import { sendGlobalNotification } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import { AuditLog, AnalyticsEvent, AppNotification } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
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
  const [lifecycleData, setLifecycleData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickMessage, setQuickMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
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

        // Domain Inventory Aggregation
        const distMap: Record<string, number> = {};
        facts.forEach(f => {
            distMap[f.category] = (distMap[f.category] || 0) + 1;
        });

        const distChart = categories
            .filter(cat => distMap[cat.name] > 0)
            .map(cat => ({
                name: cat.name,
                value: distMap[cat.name],
                color: cat.color || '#2D6A4F'
            }))
            .sort((a, b) => b.value - a.value);

        setCategoryData(distChart);

        // User Lifecycle Aggregation (Last 7 Days)
        const lifecycleMap: Record<string, { installs: number, uninstalls: number, active: number }> = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            lifecycleMap[dateStr] = { installs: 0, uninstalls: 0, active: 0 };
        }

        analytics.forEach(event => {
            const dateStr = new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (lifecycleMap[dateStr]) {
                if (event.name === 'app_install') {
                    lifecycleMap[dateStr].installs++;
                } else if (event.name === 'app_remove' || event.name === 'app_uninstall') {
                    lifecycleMap[dateStr].uninstalls++;
                } else if (event.name === 'app_open' || event.name === 'session_start') {
                    lifecycleMap[dateStr].active++;
                }
            }
        });

        const chart = Object.keys(lifecycleMap).map(date => ({
            name: date,
            installs: lifecycleMap[date].installs,
            uninstalls: lifecycleMap[date].uninstalls,
            active: lifecycleMap[date].active
        })).reverse();

        setLifecycleData(chart);
      } catch (err) {
        console.error('Dashboard synchronization failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleQuickDispatch = async () => {
    if (!quickMessage.trim()) {
      toast.error('Dispatch Payload Empty');
      return;
    }

    setIsDispatching(true);
    const newNotif: AppNotification = {
      id: `n-${Math.random().toString(36).slice(2, 11)}`,
      title: 'Flash Broadcast',
      message: quickMessage,
      type: 'GENERAL',
      isGlobal: true,
      timestamp: Date.now()
    };

    try {
      await sendGlobalNotification(newNotif, `Quick Dispatch: ${quickMessage}`);
      toast.success('Atomic Dispatch Dispatched');
      setQuickMessage('');
    } catch (err: any) {
      toast.error(`Transmission Failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const stats = [
    { label: 'Facts', value: counts.facts, icon: BookOpen, color: 'text-brand-primary', path: '/facts' },
    { label: 'Categories', value: counts.categories, icon: LayoutGrid, color: 'text-brand-secondary', path: '/categories' },
    { label: 'Quiz', value: counts.quizzes, icon: Puzzle, color: 'text-brand-primary', path: '/quizzes' },
    { label: 'Quotes', value: counts.quotes, icon: ScrollText, color: 'text-brand-gold', path: '/quotes' },
    { label: 'Users', value: counts.users, icon: UserRound, color: 'text-brand-secondary', path: '/users' },
    { label: 'Achievements', value: counts.achievements, icon: Trophy, color: 'text-brand-gold', path: '/achievements' },
    { label: 'Collections', value: counts.collections, icon: FolderHeart, color: 'text-brand-primary', path: '/collections' },
    { label: 'Notifications', value: counts.notifications, icon: BellRing, color: 'text-brand-secondary', path: '/notifications' },
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
           <div className="mt-3">
              <p className="text-sub font-black uppercase tracking-[0.4em] text-[10px] opacity-40 italic">Insight Management & Command Registry</p>
           </div>
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
            </div>
            <p className="text-sub text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{stat.label}</p>
            <h3 className="text-5xl font-black mt-2 tracking-tighter tabular-nums group-hover:text-brand-primary transition-colors duration-500">
              {loading ? '--' : <Counter value={stat.value} />}
            </h3>
          </PremiumCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* User Lifecycle Metrics */}
        <PremiumCard
          className="xl:col-span-3 p-12 relative overflow-hidden"
          glowColor="rgba(45, 106, 79, 0.05)"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
            <div>
              <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                 <ActivityIcon size={28} className="text-brand-primary" /> User Lifecycle
              </h3>
              <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 opacity-40">Growth, Retention & Churn Dynamics</p>
            </div>
          </div>

          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lifecycleData}>
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  content={({ payload }) => (
                    <div className="flex gap-6 mb-8">
                      {payload?.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            entry.value === 'installs' ? "bg-brand-primary" :
                            entry.value === 'uninstalls' ? "bg-red-500" : "bg-brand-gold"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-sub opacity-60">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="installs"
                  stroke="var(--brand-primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: 'var(--brand-primary)', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={2500}
                />
                <Line
                  type="monotone"
                  dataKey="uninstalls"
                  stroke="#EF4444"
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={3000}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="var(--brand-gold)"
                  strokeWidth={3}
                  strokeDasharray="2 4"
                  dot={{ r: 4, fill: 'var(--brand-gold)', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={3500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Domain Inventory Chart */}
        <PremiumCard
          className="xl:col-span-2 p-12 relative overflow-hidden"
          glowColor="rgba(45, 106, 79, 0.05)"
        >
          <div className="mb-12 relative z-10">
            <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
               <LayoutGrid size={28} className="text-brand-primary" /> Domain Inventory
            </h3>
            <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 opacity-40">Content Balance Analysis</p>
          </div>

          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={2000}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 43, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                      {payload?.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-sub opacity-60">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* System Pulse */}
            <PremiumCard className="p-10 lg:col-span-1" glowColor="rgba(45, 106, 79, 0.1)">
                <SystemPulse />
            </PremiumCard>

            {/* Quick Dispatch Node */}
            <PremiumCard
              className="p-10 lg:col-span-2 relative overflow-hidden"
              glowColor="rgba(45, 106, 79, 0.05)"
            >
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary shadow-lg">
                            <Radio size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-sub opacity-40">Quick Dispatch Node</h3>
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">High-Velocity Broadcast</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 items-center relative z-10">
                    <div className="flex-1 relative group">
                        <Bell className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="Input flash broadcast headline..."
                            className="w-full bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/20 rounded-2xl pl-14 pr-8 py-5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner font-medium"
                            value={quickMessage}
                            onChange={(e) => setQuickMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickDispatch()}
                        />
                    </div>
                    <ElasticButton
                        onClick={handleQuickDispatch}
                        disabled={isDispatching}
                        className="px-10 py-5 rounded-2xl shadow-xl h-full flex items-center justify-center gap-3"
                    >
                        {isDispatching ? (
                            <div className="w-4 h-4 border-2 border-brand-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Execute</span>
                            </>
                        )}
                    </ElasticButton>
                </div>

                <div className="mt-8 flex items-center gap-4 relative z-10 opacity-30">
                    <div className="h-px flex-1 bg-brand-sage/20" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">Protocol: Universal Handshake</p>
                    <div className="h-px flex-1 bg-brand-sage/20" />
                </div>
            </PremiumCard>
        </div>
    </div>
  );
};

export default DashboardPage;
