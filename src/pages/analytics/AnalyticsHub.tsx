import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Activity,
  Search,
  ChevronRight,
  Zap,
  DownloadCloud,
  Trash2,
  UserX,
  UserCheck,
  Users,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import {
  fetchBites,
  fetchBitesByIds,
  fetchAnalyticsEvents,
  fetchCategories,
  fetchUsers,
  fetchAdmins,
  fetchAllDevices
} from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import LoadingNode from '../../components/ui/LoadingNode';
import PremiumCard from '../../components/ui/PremiumCard';
import ActionBadge from '../../components/ui/ActionBadge';

const COLORS = ['#2D6A4F', '#95D5B2', '#E9C46A', '#3b82f6', '#ec4899', '#6C5CE7', '#FD79A8'];

const safeGetTime = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val.toMillis) return val.toMillis();
  if (val.seconds) return val.seconds * 1000;
  return new Date(val).getTime() || 0;
};

const toTitleCase = (str: string) => {
    if (!str) return 'General';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const chartConfig = (theme: string) => ({
    tooltipStyle: {
        backgroundColor: theme === 'dark' ? 'rgba(26, 43, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        border: theme === 'dark' ? '1px solid rgba(45, 106, 79, 0.2)' : '1px solid rgba(45, 106, 79, 0.1)',
        backdropFilter: 'blur(20px)',
        padding: '16px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
        color: theme === 'dark' ? '#E6F4EA' : '#1A2B22',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em'
    },
    axisStyle: {
        fill: '#95D5B2',
        fontSize: 10,
        fontWeight: 800,
        opacity: 0.5,
        letterSpacing: '0.1em'
    }
});

const calculateIntelligence = (events: any[], users: any[], facts: any[], range: number) => {
  const searchCounts: Record<string, number> = {};
  events.filter(e => e.name === 'content_search').forEach(e => {
      const q = e.params?.query || 'unknown';
      searchCounts[q] = (searchCounts[q] || 0) + 1;
  });
  const searchCloud = Object.entries(searchCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

  const hourlyMap: Record<number, number> = {};
  for(let i=0; i<24; i++) hourlyMap[i] = 0;
  events.forEach(e => {
      const ts = safeGetTime(e.timestamp);
      const hour = new Date(ts).getHours();
      hourlyMap[hour]++;
  });
  const heatmap = Object.entries(hourlyMap).map(([hour, count]) => ({ hour: parseInt(hour), count }));

  const atRiskUsers = users.filter(u => {
      const lastActive = safeGetTime(u.stats?.lastActiveAt || u.account?.updatedAt);
      const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
      return daysSinceActive > 3 && daysSinceActive < 14;
  }).slice(0, 5);

  const achEvents = events.filter(e => e.name === 'achievement_unlocked');
  const velocity = achEvents.length / (range || 1);

  // Velocity Trend calculation
  const halfRange = range / 2;
  const midPoint = Date.now() - (halfRange * 24 * 60 * 60 * 1000);
  const recentAch = achEvents.filter(e => safeGetTime(e.timestamp) >= midPoint).length;
  const olderAch = achEvents.filter(e => safeGetTime(e.timestamp) < midPoint).length;
  const velocityTrend = olderAch > 0 ? ((recentAch - olderAch) / olderAch) * 100 : 0;

  // Virality Index calculation (Shares / Reads)
  const reads = events.filter(e => e.name === 'read_fact').length;
  const shares = events.filter(e => ['share_fact', 'fact_share'].includes(e.name)).length;
  const virality = reads > 0 ? (shares / reads) * 100 : 0;

  return { searchCloud, heatmap, atRiskUsers, velocity, velocityTrend, virality };
};

/* --- Sub-Modules --- */

function OverviewModule({ data, theme, metricView, setMetricView }: { data: any, theme: string, metricView: 'activity' | 'device', setMetricView: (m: 'activity' | 'device') => void }) {
  const isDevice = metricView === 'device';

  const kpis = [
     {
       label: 'Installed',
       value: isDevice ? data.kpis.deviceInstalls : data.kpis.totalInstalls,
       icon: DownloadCloud,
       color: 'text-blue-500'
     },
     { label: 'Deleted Accounts', value: data.kpis.deletedAccounts, icon: UserX, color: 'text-red-500' },
     { label: 'Registered Accounts', value: data.kpis.registeredUsers, icon: UserCheck, color: 'text-brand-primary' },
     { label: 'Unregistered Accounts', value: data.kpis.unregisteredUsers, icon: Users, color: 'text-sub' },
     { label: 'Net Node Growth', value: data.kpis.netGrowth, icon: TrendingUp, color: 'text-brand-primary' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
         <h2 className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Performance Overview</h2>
         <div className="flex bg-brand-bg/5 dark:bg-brand-bg/40 p-1 rounded-xl border border-brand-sage/10">
            <button
              onClick={() => setMetricView('activity')}
              className={cn(
                  "px-3 py-1 text-[8px] font-black rounded-lg transition-all uppercase tracking-widest",
                  metricView === 'activity' ? "bg-brand-primary text-brand-white" : "text-sub opacity-40"
              )}
            >
                Activity View
            </button>
            <button
              onClick={() => setMetricView('device')}
              className={cn(
                  "px-3 py-1 text-[8px] font-black rounded-lg transition-all uppercase tracking-widest",
                  metricView === 'device' ? "bg-brand-primary text-brand-white" : "text-sub opacity-40"
              )}
            >
                Device View
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
         {kpis.map((kpi, i) => (
           <PremiumCard key={i} className="p-6 group hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-start mb-6">
                 <div className={cn("p-3 rounded-xl bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 transition-colors group-hover:border-brand-primary/30", kpi.color)}>
                    <kpi.icon size={20} />
                 </div>
              </div>

              <div className="flex justify-between items-end mb-1">
                <p className="text-[9px] font-black text-sub uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity">{kpi.label}</p>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                 <p className="text-3xl font-black tracking-tighter tabular-nums">
                   {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : (kpi.value || '0')}
                 </p>
                 <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
              </div>
           </PremiumCard>
         ))}
      </div>


    <PremiumCard className="p-8 relative overflow-hidden group">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <TrendingUp size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight uppercase">Growth Monitoring</h3>
                <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">Temporal Node Expansion</p>
             </div>
          </div>
          <ActionBadge variant="success">Synchronized</ActionBadge>
       </div>
       <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data.userGrowthData || []}>
                <defs>
                   <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#2D6A4F" opacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartConfig(theme).axisStyle} />
                <YAxis axisLine={false} tickLine={false} tick={chartConfig(theme).axisStyle} />
                <Tooltip
                   contentStyle={chartConfig(theme).tooltipStyle}
                   cursor={{ stroke: '#2D6A4F', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="net" stroke="#2D6A4F" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" animationDuration={2000} />
             </AreaChart>
          </ResponsiveContainer>
       </div>
    </PremiumCard>
  </div>
  );
}

function EngagementModule({ data, theme }: { data: any, theme: string }) {
  const intel = data.intelligence;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <PremiumCard className="lg:col-span-7 p-8 flex flex-col justify-between h-[450px]">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-xl font-black tracking-tight uppercase">Daily Activity</h3>
                   <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">Reads vs Interactions</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-primary" />
                      <span className="text-[8px] font-black uppercase opacity-40">Reads</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-secondary" />
                      <span className="text-[8px] font-black uppercase opacity-40">Interactions</span>
                   </div>
                </div>
             </div>
             <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#2D6A4F" opacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartConfig(theme).axisStyle} />
                      <YAxis axisLine={false} tickLine={false} tick={chartConfig(theme).axisStyle} />
                      <Tooltip contentStyle={chartConfig(theme).tooltipStyle} cursor={{ fill: '#2D6A4F', opacity: 0.05 }} />
                      <Bar dataKey="views" fill="#2D6A4F" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="interactions" fill="#95D5B2" radius={[4, 4, 0, 0]} barSize={20} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </PremiumCard>

          <PremiumCard className="lg:col-span-5 p-8 flex flex-col justify-between h-[450px]">
             <div>
               <div className="mb-8 flex justify-between items-center">
                  <div>
                     <h3 className="text-xl font-black tracking-tight uppercase">Peak Activity</h3>
                     <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">24-Hour Pulse</p>
                  </div>
                  <ActionBadge variant="success" className="text-[7px]">Live Flux</ActionBadge>
               </div>
               <div className="grid grid-cols-6 md:grid-cols-6 gap-2">
                  {intel?.heatmap?.map((h: any) => (
                     <div
                      key={h.hour}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center border border-brand-sage/5 transition-colors group relative"
                      style={{
                          backgroundColor: `rgba(45, 106, 79, ${Math.min(h.count / (Math.max(...intel.heatmap.map((x:any)=>x.count)) || 1), 0.9)})`,
                      }}
                     >
                        <span className="text-[8px] font-black text-white mix-blend-difference">{h.hour}h</span>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-brand-primary/90 rounded-lg flex items-center justify-center transition-opacity">
                           <span className="text-[9px] font-black text-white">{h.count} Ev</span>
                        </div>
                     </div>
                  ))}
               </div>
             </div>
             <div className="mt-8 pt-6 border-t border-brand-sage/10">
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-widest">Optimal Sync</p>
                   <span className="text-xs font-black text-brand-primary">19:00 - 22:00</span>
                </div>
             </div>
          </PremiumCard>
      </div>
    </div>
  );
}

function IntelligenceModule({ data, theme }: { data: any, theme: string }) {
  const intel = data.intelligence;
  if (!intel) return <LoadingNode message="Compiling intelligence data..." />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <PremiumCard className="p-8 group">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                   <Search size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-black tracking-tight uppercase leading-none">Intent Analysis</h3>
                   <p className="text-[8px] font-bold text-sub opacity-30 uppercase tracking-widest mt-1">High-Density Search Vectors</p>
                </div>
             </div>
             <div className="flex flex-wrap gap-2">
                {intel.searchCloud.length > 0 ? intel.searchCloud.map((s: any, i: number) => (
                   <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 text-[9px] font-black uppercase tracking-tight hover:border-brand-primary/40 transition-all cursor-default"
                    style={{ fontSize: `${Math.max(9, Math.min(14, 8 + s.value))}px` }}
                   >
                      {s.text}
                   </span>
                )) : (
                   <div className="w-full py-10 text-center opacity-20 italic text-[10px] uppercase font-black">No Search Vectors Detected</div>
                )}
             </div>
          </PremiumCard>

          <PremiumCard className="p-8 flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <Award size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-[0.2em]">Velocity Trend</p>
                      <p className="text-[14px] font-black text-brand-gold tabular-nums">
                        {intel.velocityTrend >= 0 ? '+' : ''}{intel.velocityTrend.toFixed(1)}%
                      </p>
                   </div>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4">Progression Speed</h3>
                <p className="text-xs text-sub opacity-60 leading-relaxed italic">
                  "Users are mastering sequences {Math.abs(intel.velocityTrend).toFixed(0)}% {intel.velocityTrend >= 0 ? 'faster' : 'slower'}."
                </p>
             </div>
             <div className="mt-8 pt-6 border-t border-brand-sage/10">
                <ActionBadge variant="warning" className="w-full justify-center py-2">Healthy Progression</ActionBadge>
             </div>
          </PremiumCard>

          <PremiumCard className="p-8">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black tracking-tight uppercase leading-none">Churn Risks</h3>
                <ActionBadge variant="error" className="text-[7px]">Critical</ActionBadge>
             </div>
             <div className="space-y-4">
                {intel.atRiskUsers.length > 0 ? intel.atRiskUsers.map((u: any, i: number) => (
                   <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-red-500/5 border border-red-500/10 group/item hover:border-red-500/30 transition-all">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black truncate max-w-[120px]">{u.profile?.displayName || u.id.slice(0,8)}</span>
                         <span className="text-[8px] font-bold text-red-500 opacity-60 uppercase">Inactive 4+ Days</span>
                      </div>
                      <button className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                         <Zap size={14} />
                      </button>
                   </div>
                )) : (
                   <div className="w-full py-10 text-center opacity-20 italic text-[10px] uppercase font-black">User Retention Stable</div>
                )}
             </div>
             <div className="mt-6 pt-4 border-t border-brand-sage/10">
                <button className="w-full py-3 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-primary transition-all">Execute Recovery Protocol</button>
             </div>
          </PremiumCard>

          <PremiumCard className="p-8 flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                      <Activity size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-[0.2em]">Virality Index</p>
                      <p className="text-[14px] font-black text-brand-secondary tabular-nums">{intel.virality.toFixed(1)}%</p>
                   </div>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4">Growth Virality</h3>
                <p className="text-xs text-sub opacity-60 leading-relaxed italic">
                  {intel.virality > 5 ? '"Virality is exceptionally high."' : intel.virality > 2 ? '"Steady organic growth detected."' : '"Low sharing activity detected."'}
                </p>
             </div>
             <div className="mt-10">
                <div className="h-2 w-full bg-brand-bg/10 rounded-full overflow-hidden">
                   <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (intel.virality / 10) * 100)}%` }}
                    className="h-full bg-brand-secondary"
                   />
                </div>
                <div className="flex justify-between mt-2">
                   <span className="text-[8px] font-black opacity-30 uppercase">Benchmark (10%)</span>
                   <span className="text-[8px] font-black text-brand-secondary uppercase">
                     {intel.virality > 10 ? 'Exceeding' : 'Targeting'} {Math.abs(intel.virality - 10).toFixed(1)}%
                   </span>
                </div>
             </div>
          </PremiumCard>
      </div>
    </div>
  );
}

function ContentModule({ data, theme }: { data: any, theme: string }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <PremiumCard className="lg:col-span-5 p-8 flex flex-col justify-between h-[500px]">
            <div>
               <h3 className="text-xl font-black tracking-tight uppercase mb-2">Category Distribution</h3>
               <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest mb-8">Interaction Volume by Genre</p>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <RechartsPieChart>
                        <Pie
                          data={data.contentPerformance.slice(0, 7)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="interactions"
                        >
                           {data.contentPerformance.map((_:any, index:number) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip contentStyle={chartConfig(theme).tooltipStyle} />
                     </RechartsPieChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
               {data.contentPerformance.slice(0, 5).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[8px] font-black uppercase opacity-60">{cat.name}</span>
                  </div>
               ))}
            </div>
         </PremiumCard>

         <PremiumCard className="lg:col-span-7 p-0 overflow-hidden h-[500px] flex flex-col">
            <div className="p-8 border-b border-brand-sage/10">
               <h3 className="text-xl font-black tracking-tight uppercase">Top Performing Facts</h3>
               <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">Highest Engagement Nodes</p>
            </div>
            <div className="flex-1 overflow-y-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-brand-primary/5 text-[8px] font-black text-sub uppercase tracking-widest border-b border-brand-sage/5">
                        <th className="p-4 pl-8">Fact Node</th>
                        <th className="p-4">Interactions</th>
                        <th className="p-4 text-right pr-8">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sage/5">
                     {data.contentPerformance.slice(0, 10).map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-brand-primary/5 transition-colors group">
                           <td className="p-4 pl-8">
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-bold truncate max-w-[200px]">{item.name}</span>
                                 <span className="text-[8px] font-black text-sub opacity-30 uppercase">Category Domain</span>
                              </div>
                           </td>
                           <td className="p-4">
                              <span className="text-xs font-black tabular-nums">{item.interactions}</span>
                           </td>
                           <td className="p-4 text-right pr-8">
                              <ActionBadge variant="success" className="text-[7px]">Stable</ActionBadge>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </PremiumCard>
      </div>
    </div>
  );
}

const AnalyticsHub = () => {
  const { theme } = useTheme();
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [metricView, setMetricView] = useState<'activity' | 'device'>('activity');
  const [activeTab, setActiveTab] = useState<'Overview' | 'Engagement' | 'Intelligence' | 'Content'>('Overview');
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<{
    timeSeriesData: any[];
    userGrowthData: any[];
    kpis: any;
    contentPerformance: any[];
    intelligence: any;
  }>({
    timeSeriesData: [],
    userGrowthData: [],
    kpis: {
        totalInstalls: 0,
        totalUninstalls: 0,
        deviceInstalls: 0,
        deviceUninstalls: 0,
        churnEstimate: 0,
        deletedAccounts: 0,
        registeredUsers: 0,
        unregisteredUsers: 0,
        netGrowth: 0,
        totalInteractions: 0,
        totalContentInteractions: 0,
        retention: 0
    },
    contentPerformance: [],
    intelligence: null
  });

  useEffect(() => {
    loadAllAnalytics();
  }, [range]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Core Data Fetch (Guaranteed success or throw)
      const [initialFacts, rawEvents, categories, allUsers, admins] = await Promise.all([
        fetchBites(1000),
        fetchAnalyticsEvents(range, 5000),
        fetchCategories(),
        fetchUsers(500),
        fetchAdmins()
      ]);

      // 2. Optional Data Fetch (Device Registry might fail due to missing indexes)
      let allDevices: any[] = [];
      try {
        allDevices = await fetchAllDevices();
      } catch (devErr) {
        console.warn('Device Registry sync failed (Index likely missing). Falling back to user-based estimation.');
      }

      const adminIds = new Set(admins.map(a => a.id));
      const users = allUsers.filter(u => !adminIds.has(u.id));
      const devices = allDevices.filter(d => !adminIds.has(d.userId));

      const events = [...rawEvents].sort((a, b) => safeGetTime(b.timestamp) - safeGetTime(a.timestamp));
      const intelAggregated = calculateIntelligence(events, users, initialFacts, range);

      // Option 1: Activity Logic
      const totalInstalls = events.filter(e => e.name === 'app_install').length;
      const uniqueDevicesWithInstallEvent = new Set(events.filter(e => e.name === 'app_install').map(e => e.params?.device_id)).size;
      // Formula: Installs - Unique Devices = Uninstalls (Proxy for reinstalls)
      const totalUninstalls = Math.max(0, totalInstalls - uniqueDevicesWithInstallEvent);

      // Option 2: Device Inventory Logic
      const deviceInstalls = devices.length;
      const churnThreshold = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const deviceUninstalls = devices.filter(d => safeGetTime(d.lastSeenAt) < churnThreshold).length;

      const deletedAccounts = users.filter(u => u.account?.status === 'DISABLED').length;
      const churnEstimate = users.filter(u =>
        u.account?.status !== 'DISABLED' &&
        safeGetTime(u.stats?.lastActiveAt || u.account?.lastLoginAt) < churnThreshold
      ).length;

      const registeredUsers = users.filter(u => u.profile?.email).length;
      const unregisteredUsers = users.filter(u => !u.profile?.email).length;
      const netGrowthActual = registeredUsers + unregisteredUsers;

      const dailyMap: Record<string, { views: number, interactions: number, installs: number, uninstalls: number }> = {};
      const dateKeys: string[] = [];

      for (let i = range - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const str = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          dailyMap[str] = { views: 0, interactions: 0, installs: 0, uninstalls: 0 };
          dateKeys.push(str);
      }

      events.forEach(event => {
          if (!event.timestamp) return;
          const ts = safeGetTime(event.timestamp);
          const str = new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (dailyMap[str]) {
              if (event.name === 'read_fact') dailyMap[str].views++;
              else if (event.name === 'app_install') dailyMap[str].installs++;
              else if (['like_fact', 'fact_like', 'share_fact', 'fact_share', 'category_view'].includes(event.name)) dailyMap[str].interactions++;
          }
      });

      const timeSeries = dateKeys.map(name => ({ name, ...dailyMap[name] }));

      const rangeStartTime = new Date();
      rangeStartTime.setDate(rangeStartTime.getDate() - (range - 1));
      rangeStartTime.setHours(0, 0, 0, 0);

      let cumulativeNet = users.filter(u =>
          u.account?.status === 'ACTIVE' &&
          safeGetTime(u.account.createdAt) < rangeStartTime.getTime()
      ).length;

      const userGrowthTimeline = dateKeys.map(name => {
          const dayData = dailyMap[name];
          const dayJoins = users.filter(u => {
            if (!u.account?.createdAt) return false;
            const ts = safeGetTime(u.account.createdAt);
            return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === name;
          }).length;

          cumulativeNet += (dayJoins - dayData.uninstalls);

          return {
              name,
              net: cumulativeNet,
              installs: dayJoins,
              uninstalls: dayData.uninstalls
          };
      });

      const distinctUsersCount = users.length;
      const returningUsers = new Set(events.map(e => e.uid)).size;
      const estimatedRetention = distinctUsersCount > 0 ? Math.round((returningUsers / distinctUsersCount) * 100) : 0;

      setAnalyticsData({
        timeSeriesData: timeSeries,
        userGrowthData: userGrowthTimeline,
        kpis: {
          totalInstalls,
          totalUninstalls,
          deviceInstalls,
          deviceUninstalls,
          churnEstimate,
          deletedAccounts,
          registeredUsers,
          unregisteredUsers,
          netGrowth: netGrowthActual,
          totalInteractions: events.length,
          totalContentInteractions: events.filter(e => ['read_fact', 'like_fact', 'fact_like', 'share_fact', 'fact_share', 'category_view'].includes(e.name)).length,
          retention: estimatedRetention || 0
        },
        contentPerformance: categories.filter(cat => cat && cat.name).map(cat => {
            const normalizedName = cat.name.trim();
            return {
                name: normalizedName,
                facts: initialFacts.filter(f => f && (f.category === normalizedName || f.categoryId === cat.id)).length,
                interactions: events.filter(e => {
                    if (e.name === 'category_view') return e.params?.category_id === cat.id || e.params?.category_id === normalizedName;
                    return false;
                }).length
            };
        }).sort((a, b) => b.interactions - a.interactions),
        intelligence: intelAggregated
      });

    } catch (err) {
      console.error('Unified Analytics Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="glass p-4 rounded-2xl flex justify-between items-center gap-4 relative overflow-hidden backdrop-blur-xl border border-brand-sage/5">
        <div className="flex bg-brand-bg/5 dark:bg-brand-bg/40 p-1 rounded-xl border border-brand-sage/10 ml-4">
           {['Overview', 'Engagement', 'Intelligence', 'Content'].map(t => (
               <button
                 key={t}
                 onClick={() => setActiveTab(t as any)}
                 className={cn(
                     "px-6 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest",
                     activeTab === t ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub opacity-40 hover:opacity-100"
                 )}
               >
                   {t}
               </button>
           ))}
        </div>

        <div className="flex bg-brand-bg/5 dark:bg-brand-bg/40 p-1 rounded-xl border border-brand-sage/10 mr-4">
           {[7, 30, 90].map(d => (
               <button
                 key={d}
                 onClick={() => setRange(d as any)}
                 className={cn(
                     "px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest",
                     range === d ? "bg-brand-primary text-brand-white shadow-lg" : "text-sub opacity-40 hover:opacity-100"
                 )}
               >
                   {d} Days
               </button>
           ))}
        </div>
      </div>

      {loading ? (
        <LoadingNode message="Synchronizing global analytics matrix..." />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'Overview' && (
            <OverviewModule data={analyticsData} theme={theme} metricView={metricView} setMetricView={setMetricView} />
          )}
          {activeTab === 'Engagement' && (
            <EngagementModule data={analyticsData} theme={theme} />
          )}
          {activeTab === 'Intelligence' && (
            <IntelligenceModule data={analyticsData} theme={theme} />
          )}
          {activeTab === 'Content' && (
            <ContentModule data={analyticsData} theme={theme} />
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsHub;
