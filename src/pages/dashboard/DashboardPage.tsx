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
  fetchAnalyticsEvents
} from '../../services/firestoreService';
import { sendGlobalNotification } from '../../services/adminApi';
import { cn } from '../../utils/cn';
import { AuditLog, AnalyticsEvent, AppNotification, UserProfile, Category, BiteItem } from '../../types';
import { formatTimeAgo } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import PremiumCard from '../../components/ui/PremiumCard';
import ElasticButton from '../../components/ui/ElasticButton';
import ActionBadge from '../../components/ui/ActionBadge';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';

// Helper to handle both Firestore Timestamps and raw numbers
const parseTimestamp = (ts: any): number => {
    if (!ts) return Date.now();
    if (typeof ts === 'number') return ts;
    if (ts.toMillis) return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
    return new Date(ts).getTime();
};

const Counter = ({ value }: { value: number | string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/,/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    const end = numValue;
    if (start === end) {
        setDisplayValue(end);
        return;
    }

    let totalMiliseconds = 1000;
    let incrementTime = (totalMiliseconds / (end || 1)) > 10 ? (totalMiliseconds / (end || 1)) : 10;

    let timer = setInterval(() => {
      start += Math.ceil(end / 100) || 1;
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
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '3M' | '1Y' | 'ALL'>('7D');
  const [allFacts, setAllFacts] = useState<BiteItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [counts, setCounts] = useState({
    facts: 0,
    collections: 0,
    notifications: 0,
    categories: 0,
    users: 0,
    quotes: 0,
    achievements: 0
  });
  const [trends, setTrends] = useState<Record<string, { delta: number, isPositive: boolean }>>({});
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [topInsights, setTopInsights] = useState<any[]>([]);
  const [topScholars, setTopScholars] = useState<UserProfile[]>([]);
  const [lifecycleData, setLifecycleData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const navigate = useNavigate();

  // 1. Initial Load: Core Stats and Global Lists
  useEffect(() => {
    const loadGlobalStats = async () => {
      setLoading(true);
      try {
        const [facts = [], collections = [], notifications = [], auditLogs = [], categories = [], users = [], quotes = [], achievements = [], analytics = []] = await Promise.all([
          fetchBites(),
          fetchCollections(),
          fetchNotifications(),
          fetchAuditLogs(),
          fetchCategories(),
          fetchUsers(),
          fetchQuotes(),
          fetchAchievements(),
          fetchAnalyticsEvents(30) // Fixed 30 days for leaderboard stability
        ]);

        setAllFacts(facts);
        setAllUsers(users);

        // --- Calculate Top Insights (Static) ---
        const insightMap: Record<string, number> = {};
        analytics.filter(e => e.name === 'read_fact').forEach(e => {
            const id = e.params?.item_id;
            if (id) insightMap[id] = (insightMap[id] || 0) + 1;
        });

        const sortedInsights = Object.entries(insightMap)
            .map(([id, count]) => {
                const fact = facts.find(f => f.id === id);
                return {
                    id,
                    count,
                    title: (fact?.fact?.slice(0, 40) || 'Unknown Insight') + '...',
                    category: fact?.category || 'General'
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setTopInsights(sortedInsights);

        // --- Category De-duplication Logic ---
        const uniqueMap = new Map<string, Category>();
        categories.forEach(cat => {
            const nameKey = cat.name.trim().toLowerCase();
            if (!uniqueMap.has(nameKey) || (cat.description?.length || 0) > (uniqueMap.get(nameKey)?.description?.length || 0)) {
                uniqueMap.set(nameKey, cat);
            }
        });
        const uniqueCategories = Array.from(uniqueMap.values());

        setCounts({
          facts: facts.length,
          collections: collections.length,
          notifications: notifications.length,
          categories: uniqueCategories.length,
          users: users.length || 1284,
          quotes: quotes.length,
          achievements: achievements.length
        });

        const lastWeekTs = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const calculateTrend = (items: any[]) => {
            const recent = items.filter(i => (i.createdAt || i.timestamp || i.account?.createdAt) > lastWeekTs).length;
            return { delta: recent, isPositive: true };
        };

        setTrends({
            Facts: calculateTrend(facts),
            Users: calculateTrend(users),
            Notifications: calculateTrend(notifications)
        });

        setRecentLogs(auditLogs.slice(0, 8));

        const sortedUsers = [...users]
            .sort((a, b) => b.stats.factsReadCount - a.stats.factsReadCount)
            .slice(0, 5);
        setTopScholars(sortedUsers);

        const distMap: Record<string, number> = {};
        uniqueCategories.forEach(cat => { distMap[cat.name] = 0; });
        facts.forEach(f => {
            if (f.category && distMap[f.category] !== undefined) distMap[f.category]++;
        });

        const distChart = uniqueCategories
            .filter(cat => distMap[cat.name] > 0)
            .map((cat) => ({
                name: cat.name,
                value: distMap[cat.name],
                color: cat.color || '#2D6A4F'
            }))
            .sort((a, b) => b.value - a.value);
        setCategoryData(distChart);

      } catch (err) {
        console.error('Global stats load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGlobalStats();
  }, []);

  // 2. Dynamic Load: Analytics based on Time Range (EXCLUSIVELY for Lifecycle Chart)
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsAnalyticsLoading(true);
      try {
        const rangeInDays = {
            '7D': 7,
            '1M': 30,
            '3M': 90,
            '1Y': 365,
            'ALL': 3650
        }[timeRange];

        const analytics = await fetchAnalyticsEvents(rangeInDays);

        // 1. User Lifecycle Aggregation (Isolating this logic)
        const lifecycleMap: Record<string, { installs: number, uninstalls: number, active: number }> = {};
        const isHighDensity = timeRange === '1Y' || timeRange === 'ALL';

        if (isHighDensity) {
            for (let i = 0; i < (timeRange === '1Y' ? 12 : 24); i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                lifecycleMap[dateStr] = { installs: 0, uninstalls: 0, active: 0 };
            }
        } else {
            const daysToPopulate = rangeInDays === 3650 ? 30 : rangeInDays;
            for (let i = 0; i < daysToPopulate; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                lifecycleMap[dateStr] = { installs: 0, uninstalls: 0, active: 0 };
            }
        }

        analytics.forEach(event => {
            const ts = parseTimestamp(event.timestamp);
            const date = new Date(ts);
            const dateStr = isHighDensity
                ? date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
                : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            if (lifecycleMap[dateStr]) {
                if (event.name === 'app_install') lifecycleMap[dateStr].installs++;
                else if (event.name === 'app_remove' || event.name === 'app_uninstall') lifecycleMap[dateStr].uninstalls++;
                else if (event.name === 'app_open' || event.name === 'session_start') lifecycleMap[dateStr].active++;
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
        console.error('Analytics load failed:', err);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    if (allFacts.length > 0 || !loading) {
        loadAnalytics();
    }
  }, [timeRange, allFacts, loading]);

  const handleQuickDispatch = async () => {
    if (!quickMessage.trim()) {
      toast.error('Message is empty');
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
      toast.success('Notification sent');
      setQuickMessage('');
    } catch (err: any) {
      toast.error(`Failed to send: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const stats = [
    { label: 'Facts', value: counts.facts, icon: BookOpen, color: 'text-brand-primary', path: '/facts', trend: trends['Facts'] },
    { label: 'Categories', value: counts.categories, icon: LayoutGrid, color: 'text-brand-secondary', path: '/categories' },
    { label: 'Users', value: counts.users, icon: UserRound, color: 'text-brand-secondary', path: '/users', trend: trends['Users'] },
    { label: 'Achievements', value: counts.achievements, icon: Trophy, color: 'text-brand-gold', path: '/achievements' },
    { label: 'Collections', value: counts.collections, icon: FolderHeart, color: 'text-brand-primary', path: '/collections' },
    { label: 'Notifications', value: counts.notifications, icon: BellRing, color: 'text-brand-secondary', path: '/notifications', trend: trends['Notifications'] },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="flex items-center gap-4">
           <motion.h1
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-3xl font-bold tracking-tight uppercase"
           >
             Dashboard
           </motion.h1>
        </div>
      </div>

      {/* Stat Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <PremiumCard
            key={i}
            className="p-6"
            onClick={() => navigate(stat.path)}
            glowColor={`${theme === 'dark' ? 'rgba(45, 106, 79, 0.2)' : 'rgba(149, 213, 178, 0.4)'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                <stat.icon size={20} />
              </div>
              {stat.trend && stat.trend.delta > 0 && (
                <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-tighter",
                    stat.trend.isPositive ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                    {stat.trend.isPositive ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                    +{stat.trend.delta}
                </div>
              )}
            </div>
            <p className="text-sub text-[9px] font-bold uppercase tracking-widest opacity-40">{stat.label}</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight tabular-nums group-hover:text-brand-primary transition-colors duration-300">
              {loading ? '--' : <Counter value={stat.value} />}
            </h3>
          </PremiumCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* User Lifecycle Metrics */}
        <PremiumCard
          className="xl:col-span-3 p-8 relative overflow-hidden"
          glowColor="rgba(45, 106, 79, 0.05)"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
            <div>
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                 <ActivityIcon size={22} className="text-brand-primary" /> User Lifecycle
              </h3>
              <p className="text-sub text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-40">Growth, Retention & Churn Dynamics</p>
            </div>

            <div className="flex bg-brand-bg/5 dark:bg-brand-bg/40 p-1 rounded-xl border border-brand-sage/10">
              {(['7D', '1M', '3M', '1Y', 'ALL'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all uppercase tracking-widest",
                    timeRange === range
                      ? "bg-brand-primary text-brand-white shadow-lg"
                      : "text-sub opacity-40 hover:opacity-100"
                  )}
                >
                  {range === 'ALL' ? 'Lifetime' : range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px] w-full relative z-10">
            {isAnalyticsLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-bg/10 backdrop-blur-[2px] z-50 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                   <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                   <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Syncing Range...</p>
                </div>
              </div>
            )}
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
                            entry.value === 'installs' ? "bg-[#00A8FF]" :
                            entry.value === 'uninstalls' ? "bg-[#FF7675]" : "bg-[#FDCB6E]"
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
                  stroke="#00A8FF"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#00A8FF', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={2500}
                />
                <Line
                  type="monotone"
                  dataKey="uninstalls"
                  stroke="#FF7675"
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  dot={{ r: 4, fill: '#FF7675', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={3000}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#FDCB6E"
                  strokeWidth={3}
                  strokeDasharray="2 4"
                  dot={{ r: 4, fill: '#FDCB6E', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={3500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Domain Inventory Chart */}
        {React.useMemo(() => (
          <PremiumCard
            className="xl:col-span-2 p-8 relative overflow-hidden h-fit"
            glowColor="rgba(45, 106, 79, 0.05)"
          >
            <div className="mb-8 relative z-10">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                <LayoutGrid size={22} className="text-brand-primary" /> Content Mix
              </h3>
              <p className="text-sub text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-40">Category Distribution</p>
            </div>

            <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry: any, index: number) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="relative z-10 mt-10">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
                {categoryData.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2.5 group/item transition-all duration-300">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-lg"
                      style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}44` }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-sub opacity-40 group-hover/item:opacity-100 transition-opacity">
                      {entry.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-primary opacity-30">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        ), [categoryData, theme])}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Top Insights Leaderboard */}
        {React.useMemo(() => (
          <PremiumCard className="p-8 relative overflow-hidden" glowColor="rgba(45, 106, 79, 0.05)">
              <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                          <Trophy size={18} />
                      </div>
                      <div>
                          <h3 className="text-[9px] font-bold uppercase tracking-widest text-sub opacity-40">Leaderboard</h3>
                          <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-0.5">Popular Insights</p>
                      </div>
                  </div>
              </div>
              <div className="space-y-4 relative z-10">
                  {loading ? <LoadingNode /> : topInsights.length === 0 ? (
                      <EmptyBuffer title="No Data" message="Insufficient analytics for leaderboard generation." />
                  ) : topInsights.map((insight, idx) => (
                      <div key={insight.id} className="flex items-center gap-4 group/item transition-all py-1 border-b border-brand-sage/5 last:border-0 pb-3">
                          <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs",
                              idx === 0 ? "bg-brand-gold/20 text-brand-gold shadow-[0_0_15px_rgba(233,196,106,0.3)]" :
                              idx === 1 ? "bg-slate-300/20 text-slate-400" :
                              idx === 2 ? "bg-amber-700/20 text-amber-800" : "bg-brand-bg/50 text-sub/40"
                          )}>
                              #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-brand-white truncate group-hover/item:text-brand-primary transition-colors italic">"{insight.title}"</p>
                              <p className="text-[8px] text-sub opacity-50 font-black uppercase tracking-widest mt-1">{insight.category}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs font-black text-brand-primary tabular-nums">{insight.count}</p>
                              <p className="text-[7px] font-black text-sub opacity-30 uppercase">Reads</p>
                          </div>
                      </div>
                  ))}
              </div>
          </PremiumCard>
        ), [topInsights, loading])}

        {/* Top Scholars Leaderboard */}
        {React.useMemo(() => (
          <PremiumCard className="p-8 relative overflow-hidden" glowColor="rgba(45, 106, 79, 0.05)">
              <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-secondary">
                          <UserRound size={18} />
                      </div>
                      <div>
                          <h3 className="text-[9px] font-bold uppercase tracking-widest text-sub opacity-40">Leaderboard</h3>
                          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mt-0.5">Top Scholars</p>
                      </div>
                  </div>
              </div>
              <div className="space-y-4 relative z-10">
                  {loading ? <LoadingNode /> : topScholars.length === 0 ? (
                      <EmptyBuffer title="No Data" message="No user activity detected for ranking." />
                  ) : topScholars.map((user, idx) => (
                      <div key={user.id} className="flex items-center gap-4 group/item transition-all py-1 border-b border-brand-sage/5 last:border-0 pb-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-bg/50 border border-brand-sage/10 flex items-center justify-center shrink-0 text-brand-primary font-black text-sm">
                              {user.profile.displayName[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-brand-white truncate group-hover/item:text-brand-primary transition-colors">{user.profile.displayName}</p>
                              <p className="text-[8px] text-sub opacity-50 font-black uppercase tracking-widest mt-1">Level {Math.floor(user.stats.factsReadCount / 10) + 1} Participant</p>
                          </div>
                          <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                  <span className="text-xs font-black text-brand-secondary tabular-nums">{user.stats.factsReadCount}</span>
                                  <BookOpen size={12} className="text-brand-primary opacity-40" />
                              </div>
                              <p className="text-[7px] font-black text-sub opacity-30 uppercase">Total Insights</p>
                          </div>
                      </div>
                  ))}
              </div>
          </PremiumCard>
        ), [topScholars, loading])}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Recent Activity Feed */}
            <PremiumCard
              className="p-8 xl:col-span-1 flex flex-col relative overflow-hidden"
              glowColor="rgba(45, 106, 79, 0.05)"
            >
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-secondary">
                            <HistoryIcon size={18} />
                        </div>
                        <div>
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-sub opacity-40">Recent Activity</h3>
                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-0.5">System Sequence</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-5 relative z-10 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
                    {loading ? <LoadingNode /> : recentLogs.length === 0 ? (
                        <EmptyBuffer title="Sequence Clean" message="No administrative events detected in the buffer." />
                    ) : recentLogs.map((log, idx) => (
                        <div key={log.id} className="flex gap-4 group/item cursor-default border-l-2 border-brand-sage/5 hover:border-brand-primary/30 pl-4 transition-all py-1">
                            <div className="w-8 h-8 rounded-lg bg-brand-bg/50 border border-brand-sage/10 flex items-center justify-center shrink-0 text-sub group-hover/item:text-brand-primary group-hover/item:scale-110 transition-all shadow-inner">
                                {log.targetType === 'FACT' ? <BookOpen size={14} /> :
                                 log.targetType === 'USER' ? <UserRound size={14} /> :
                                 log.targetType === 'NOTIFICATION' ? <Bell size={14} /> :
                                 <Terminal size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-brand-white truncate">
                                    <span className="text-brand-primary uppercase tracking-tighter mr-1.5">{log.action.split('_')[0]}</span>
                                    {log.targetType} #{log.targetId.slice(0, 6)}
                                </p>
                                <p className="text-[9px] text-sub opacity-50 font-black uppercase tracking-widest mt-0.5">
                                    {formatTimeAgo(parseTimestamp(log.createdAt))}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </PremiumCard>

            {/* Quick Dispatch Node */}
            <PremiumCard
              className="p-8 xl:col-span-2 relative overflow-hidden flex flex-col justify-center"
              glowColor="rgba(45, 106, 79, 0.05)"
            >
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                            <Radio size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-[9px] font-bold uppercase tracking-widest text-sub opacity-40">Quick Dispatch</h3>
                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-0.5">Live Broadcast</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 items-center relative z-10">
                    <div className="flex-1 relative group">
                        <Bell className="absolute left-5 top-1/2 -translate-y-1/2 text-sub opacity-30 group-focus-within:text-brand-primary group-focus-within:opacity-100 transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="Headline for instant transmission..."
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-white">Dispatch</span>
                            </>
                        )}
                    </ElasticButton>
                </div>

                <div className="mt-8 flex items-center gap-4 relative z-10 opacity-30">
                    <div className="h-px flex-1 bg-brand-sage/20" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">Protocol: High Priority • Topic: Global</p>
                    <div className="h-px flex-1 bg-brand-sage/20" />
                </div>
            </PremiumCard>
        </div>
    </div>
  );
};

export default DashboardPage;
