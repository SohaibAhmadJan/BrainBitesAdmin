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
  fetchAllDevices,
  fetchTotalInstallations,
  subscribeToInstallationCount,
  dispatchNotificationDirectly
} from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';
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
      .slice(0, 30);

  const maxSearchHits = searchCloud.length > 0 ? searchCloud[0].value : 1;

  const hourlyMap: Record<number, number> = {};
  for(let i=0; i<24; i++) hourlyMap[i] = 0;
  events.forEach(e => {
      const ts = safeGetTime(e.timestamp);
      const hour = new Date(ts).getUTCHours();
      hourlyMap[hour]++;
  });
  const heatmap = Object.entries(hourlyMap).map(([hour, count]) => ({ hour: parseInt(hour), count }));

  const atRiskUsers = users.filter(u => {
      // Check multiple activity signals to prevent false positives
      const lastActive = safeGetTime(u.stats?.lastActiveAt || u.account?.lastLoginAt || u.updatedAt || 0);
      const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
      return daysSinceActive > 3; // Any user inactive for more than 3 days
  });

  const achEvents = events.filter(e => e.name === 'achievement_unlocked');

  // Virality Index calculation (Shares / Reads)
  const reads = events.filter(e => e.name === 'read_fact').length;
  const shares = events.filter(e => ['share_fact', 'fact_share'].includes(e.name)).length;
  const virality = reads > 0 ? (shares / reads) * 100 : 0;

  // Identify Top Shared Fact
  const shareMap: Record<string, number> = {};
  events.filter(e => ['share_fact', 'fact_share'].includes(e.name)).forEach(e => {
      const id = e.params?.item_id || 'unknown';
      shareMap[id] = (shareMap[id] || 0) + 1;
  });
  const topSharedId = Object.entries(shareMap).sort((a,b) => b[1] - a[1])[0]?.[0];
  const topFact = facts.find(f => f.id === topSharedId)?.fact?.slice(0, 30) || 'None detected';

  return { searchCloud, maxSearchHits, heatmap, atRiskUsers, virality, readsCount: reads, sharesCount: shares, topFact };
};

/* --- Sub-Modules --- */

function OverviewModule({ data, theme }: { data: any, theme: string }) {
  const kpis = [
     {
       label: 'Lifetime Installs',
       value: data.kpis.deviceInstalls,
       icon: DownloadCloud,
       color: 'text-blue-500'
     },
     { label: 'Deleted Accounts', value: data.kpis.deletedAccounts, icon: UserX, color: 'text-red-500' },
     { label: 'Registered Accounts', value: data.kpis.registeredUsers, icon: UserCheck, color: 'text-brand-primary' },
     { label: 'Unregistered Accounts', value: data.kpis.unregisteredUsers, icon: Users, color: 'text-sub' },
     { label: 'Net Node Growth', value: data.kpis.netGrowth, icon: TrendingUp, color: 'text-brand-primary' }
  ];

  return (
    <div className="space-y-6">
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
  const [utcOffset, setUtcOffset] = useState(0);

  const shiftedHeatmap = Array.from({ length: 24 }, (_, i) => {
      // Find the UTC hour that corresponds to this local display hour 'i'
      const utcHour = (i - utcOffset + 24) % 24;
      const dataPoint = intel?.heatmap?.find((h: any) => h.hour === utcHour);
      return { displayHour: i, count: dataPoint?.count || 0 };
  });

  return (
    <div className="grid grid-cols-1 gap-6">
          <PremiumCard className="p-8 flex flex-col justify-between h-[450px]" disableHover={true}>
             <div>
               <div className="mb-8 flex justify-between items-center">
                  <div>
                     <h3 className="text-xl font-black tracking-tight uppercase">Peak Activity</h3>
                     <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">24-Hour Pulse (UTC {utcOffset >= 0 ? `+${utcOffset}` : utcOffset})</p>
                  </div>
                  <ActionBadge variant="success" className="text-[7px]">Live Flux</ActionBadge>
               </div>
               <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-2">
                  {shiftedHeatmap.map((h) => (
                     <div
                      key={h.displayHour}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center border border-brand-sage/30 transition-colors relative shadow-sm"
                      style={{
                          backgroundColor: `rgba(45, 106, 79, ${Math.min(h.count / (Math.max(...shiftedHeatmap.map((x:any)=>x.count)) || 1), 0.9)})`,
                      }}
                     >
                        <span className="text-[12px] font-black text-white mix-blend-difference">{h.displayHour}h</span>
                     </div>
                  ))}
               </div>
             </div>
             <div className="mt-8 pt-6 border-t border-brand-sage/10">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-sub opacity-40 uppercase tracking-widest">Less</span>
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
                         <div
                           key={i}
                           className="w-3 h-3 rounded-sm border border-brand-sage/20"
                           style={{ backgroundColor: `rgba(45, 106, 79, ${op})` }}
                         />
                      ))}
                      <span className="text-[10px] font-black text-sub opacity-40 uppercase tracking-widest">More</span>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="flex flex-col items-start mr-2">
                         <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-widest leading-none mb-1">Active Slot</p>
                         <span className="text-[10px] font-black text-brand-primary pt-0.5">
                            {(() => {
                               const curUtc = new Date().getUTCHours();
                               const curDisplay = (curUtc + utcOffset + 24) % 24;
                               return `${curDisplay}-${(curDisplay + 1) % 24}h`;
                            })()}
                         </span>
                      </div>
                      <div className="h-8 w-[1px] bg-brand-sage/10 mx-2" />
                      <div className="flex flex-col items-start">
                         <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-widest leading-none mb-1">Region Focus</p>
                         <select
                           value={utcOffset}
                           onChange={(e) => setUtcOffset(parseInt(e.target.value))}
                           className="bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 rounded-lg px-2 py-0.5 text-[10px] font-black text-brand-primary outline-none focus:border-brand-primary/40 transition-all"
                         >
                            {Array.from({ length: 27 }, (_, i) => i - 12).map(offset => (
                               <option key={offset} value={offset}>
                                  UTC {offset >= 0 ? `+${offset}` : offset}
                               </option>
                            ))}
                         </select>
                      </div>
                   </div>
                </div>
             </div>
          </PremiumCard>
      </div>
  );
}

function IntelligenceModule({ data, theme }: { data: any, theme: string }) {
  const intel = data.intelligence;
  const [churnSearch, setChurnSearch] = useState('');
  const [churnFilter, setChurnFilter] = useState<number>(3); // Min days inactive
  const [isRecovering, setIsRecovering] = useState(false);

  if (!intel) return <LoadingNode message="Compiling intelligence data..." />;

  const filteredChurn = (intel.atRiskUsers || []).filter((u: any) => {
      const name = (u.profile?.displayName || u.id).toLowerCase();
      const matchesSearch = name.includes(churnSearch.toLowerCase());

      const lastActive = safeGetTime(u.stats?.lastActiveAt || u.account?.lastLoginAt || u.updatedAt || 0);
      const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
      const matchesFilter = daysSinceActive >= churnFilter;

      return matchesSearch && matchesFilter;
  }).sort((a: any, b: any) => {
      const laA = safeGetTime(a.stats?.lastActiveAt || a.account?.lastLoginAt || a.updatedAt || 0);
      const laB = safeGetTime(b.stats?.lastActiveAt || b.account?.lastLoginAt || b.updatedAt || 0);
      return laA - laB; // Show most "stale" users first
  });

  const handleRecovery = async () => {
    if (filteredChurn.length === 0 || isRecovering) return;
    setIsRecovering(true);

    let message = "We miss you! Come back for a new insight. ✨";
    if (churnFilter === 3) message = "Your daily insight is waiting for you! 🧠";
    else if (churnFilter === 7) message = "You've been away for a while. Discover something new today! ✨";
    else if (churnFilter === 14) message = "We miss you! Come back for a special psychological breakthrough. 🌟";
    else if (churnFilter >= 30) message = "It's been a long time! We have many new facts for you to explore. 🚀";

    try {
        const batch = filteredChurn.map(user =>
            dispatchNotificationDirectly({
                title: "BrainBites Recovery",
                message,
                type: "GENERAL",
                audience: `${churnFilter}+ DAYS`,
                isGlobal: false,
                targetUserId: user.id,
                timestamp: Date.now()
            })
        );
        await Promise.all(batch);
        toast.success(`Successfully dispatched recovery signals to ${filteredChurn.length} users!`);
    } catch (err) {
        console.error("Recovery Protocol Failed:", err);
        toast.error("Failed to execute recovery protocol.");
    } finally {
        setIsRecovering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PremiumCard className="p-8 group h-[450px] flex flex-col" disableHover={true}>
             <div className="flex items-center gap-3 mb-8 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                   <Search size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-black tracking-tight uppercase leading-none">Intent Analysis</h3>
                   <p className="text-[8px] font-bold text-sub opacity-30 uppercase tracking-widest mt-1">High-Density Search Vectors</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-primary/20 scrollbar-track-transparent">
                <div className="flex flex-wrap gap-2">
                   {intel.searchCloud.length > 0 ? intel.searchCloud.map((s: any, i: number) => {
                      const weight = s.value / (intel.maxSearchHits || 1);
                      const fontSize = 10 + (weight * 14); // Scale between 10px and 24px
                      const opacity = 0.3 + (weight * 0.7); // Scale between 30% and 100% opacity

                      return (
                         <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 font-black uppercase tracking-tight hover:border-brand-primary/40 transition-all cursor-default"
                          style={{
                             fontSize: `${fontSize}px`,
                             opacity: opacity,
                             color: weight > 0.5 ? 'var(--color-brand-primary)' : 'inherit'
                          }}
                         >
                            {s.text}
                         </span>
                      );
                   }) : (
                      <div className="w-full py-10 text-center opacity-20 italic text-[10px] uppercase font-black">No Search Vectors Detected</div>
                   )}
                </div>
             </div>
          </PremiumCard>

          <PremiumCard className="p-8 h-[450px] flex flex-col" disableHover={true}>
             <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                   <h3 className="text-lg font-black tracking-tight uppercase leading-none">Churn Risks</h3>
                   <p className="text-[8px] font-bold text-sub opacity-30 uppercase tracking-widest mt-1">
                      Showing {filteredChurn.length} of {intel.atRiskUsers.length} Nodes
                   </p>
                </div>
                <ActionBadge variant="error" className="text-[7px]">Critical</ActionBadge>
             </div>

             <div className="flex gap-2 mb-6 flex-shrink-0">
                <div className="relative flex-1">
                   <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub opacity-40" />
                   <input
                     type="text"
                     placeholder="Search node..."
                     value={churnSearch}
                     onChange={(e) => setChurnSearch(e.target.value)}
                     className="w-full bg-brand-bg/5 dark:bg-brand-bg/40 border border-brand-sage/10 rounded-xl pl-8 pr-4 py-2 text-[10px] font-black tracking-wider outline-none focus:border-brand-primary/40 transition-all"
                   />
                </div>
                <select
                   value={churnFilter}
                   onChange={(e) => setChurnFilter(parseInt(e.target.value))}
                   className="bg-brand-bg/5 dark:bg-brand-bg/40 border border-brand-sage/10 rounded-xl px-3 py-2 text-[10px] font-black tracking-wider outline-none focus:border-brand-primary/40 transition-all"
                >
                   <option value={3}>3+ Days</option>
                   <option value={7}>7+ Days</option>
                   <option value={14}>14+ Days</option>
                   <option value={30}>30+ Days</option>
                   <option value={90}>90+ Days</option>
                </select>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-brand-primary/20">
                <div className="space-y-3">
                   {filteredChurn.length > 0 ? filteredChurn.map((u: any, i: number) => {
                      const lastActive = safeGetTime(u.stats?.lastActiveAt || u.account?.updatedAt);
                      const days = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));

                      return (
                         <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-red-500/5 border border-red-500/10 group/item hover:border-red-500/30 transition-all">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black truncate max-w-[120px]">{u.profile?.displayName || u.id.slice(0,8)}</span>
                               <span className="text-[8px] font-bold text-red-500 opacity-60 uppercase">Inactive {days} Days</span>
                            </div>
                            <button className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                               <Zap size={14} />
                            </button>
                         </div>
                      );
                   }) : (
                      <div className="w-full py-10 text-center opacity-20 italic text-[10px] uppercase font-black">No matches in current segment</div>
                   )}
                </div>
             </div>

             <div className="pt-4 border-t border-brand-sage/10 flex-shrink-0">
                <button
                  onClick={handleRecovery}
                  disabled={isRecovering || filteredChurn.length === 0}
                  className={cn(
                    "w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    isRecovering ? "bg-brand-sage/10 text-sub" : "bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary"
                  )}
                >
                  {isRecovering ? `Sending ${filteredChurn.length} Signals...` : 'Execute Recovery Protocol'}
                </button>
             </div>
          </PremiumCard>

          <PremiumCard className="p-8 h-[450px] flex flex-col justify-between" disableHover={true}>
             <div>
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                      <Activity size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-[0.2em]">Virality Index</p>
                      <p className="text-[18px] font-black text-brand-secondary tabular-nums">{intel.virality.toFixed(1)}%</p>
                   </div>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-4">Growth Virality</h3>
                <p className="text-xs text-sub opacity-60 leading-relaxed italic">
                  "{intel.virality > 5 ? 'Virality is exceptionally high.' : intel.virality > 2 ? 'Steady organic growth detected.' : 'Low sharing activity detected.'}"
                </p>
             </div>

             <div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-brand-bg/5 dark:bg-brand-bg/40 p-4 rounded-xl border border-brand-sage/10">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-widest mb-1">Total Reads</p>
                      <p className="text-lg font-black tabular-nums">{intel.readsCount.toLocaleString()}</p>
                   </div>
                   <div className="bg-brand-bg/5 dark:bg-brand-bg/40 p-4 rounded-xl border border-brand-sage/10 relative overflow-hidden">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-widest mb-1">Total Shares</p>
                      <p className="text-lg font-black tabular-nums text-brand-secondary">{intel.sharesCount.toLocaleString()}</p>
                      {intel.sharesCount > 0 && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-secondary animate-ping" />}
                   </div>
                </div>

                <div className="relative h-2 w-full bg-brand-bg/10 rounded-full mb-4">
                   {/* Progress Bar */}
                   <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (intel.virality / Math.max(15, intel.virality + 5)) * 100)}%` }}
                    className="h-full bg-brand-secondary rounded-full"
                   />

                   {/* Dynamic Red Benchmark Line (10%) */}
                   <div
                      className="absolute top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20"
                      style={{
                          left: `${(10 / Math.max(15, intel.virality + 5)) * 100}%`
                      }}
                   />
                </div>

                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[11px] font-black text-red-500/80 uppercase tracking-widest">Benchmark (10%)</span>
                   </div>
                   <span className="text-[11px] font-black text-brand-secondary uppercase tracking-widest">
                     {intel.virality > 10 ? 'Exceeding' : 'Targeting'} {Math.abs(intel.virality - 10).toFixed(1)}%
                   </span>
                </div>
             </div>
          </PremiumCard>
      </div>
  );
}

const AnalyticsHub = () => {
  const { theme } = useTheme();
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [loading, setLoading] = useState(true);
  const [liveInstallCount, setLiveInstallCount] = useState<number>(0);

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

    // Real-time listener for Lifetime Installs (Updates existing state)
    const unsubscribe = subscribeToInstallationCount((count) => {
        setAnalyticsData(prev => ({
            ...prev,
            kpis: {
                ...prev.kpis,
                deviceInstalls: count
            }
        }));
    });
    return () => unsubscribe();
  }, [range]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Core Data Fetch (Guaranteed success or throw)
      const [initialFacts, rawEvents, categories, allUsers, admins, lifetimeInstalls] = await Promise.all([
        fetchBites(1000),
        fetchAnalyticsEvents(range, 5000),
        fetchCategories(),
        fetchUsers(500),
        fetchAdmins(),
        fetchTotalInstallations()
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
      const devices = allDevices;

      const events = [...rawEvents].sort((a, b) => safeGetTime(b.timestamp) - safeGetTime(a.timestamp));
      const intelAggregated = calculateIntelligence(events, users, initialFacts, range);

      // Option 1: Activity Logic
      const totalInstalls = events.filter(e => e.name === 'app_install').length;
      const uniqueDevicesWithInstallEvent = new Set(events.filter(e => e.name === 'app_install').map(e => e.params?.device_id)).size;
      // Formula: Installs - Unique Devices = Uninstalls (Proxy for reinstalls)
      const totalUninstalls = Math.max(0, totalInstalls - uniqueDevicesWithInstallEvent);

      const churnThreshold = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const deletedAccounts = users.filter(u => u.account?.status === 'DISABLED').length;
      const churnEstimate = users.filter(u =>
        u.account?.status !== 'DISABLED' &&
        safeGetTime(u.stats?.lastActiveAt || u.account?.lastLoginAt) < churnThreshold
      ).length;

      const registeredUsersCount = users.filter(u => u.profile?.email).length;
      const unregisteredUsersCount = users.filter(u => !u.profile?.email).length;
      const totalUserNodes = registeredUsersCount + unregisteredUsersCount;

      const dailyMap: Record<string, { views: number, interactions: number, installs: number, unregistered: number, registered: number }> = {};
      const dateKeys: string[] = [];

      for (let i = range - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const str = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          dailyMap[str] = { views: 0, interactions: 0, installs: 0, unregistered: 0, registered: 0 };
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

      // Daily User Breakdown for Growth Chart
      users.forEach(u => {
          if (!u.account?.createdAt) return;
          const str = new Date(safeGetTime(u.account.createdAt)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (dailyMap[str]) {
              if (u.profile?.email) dailyMap[str].registered++;
              else dailyMap[str].unregistered++;
          }
      });

      const timeSeries = dateKeys.map(name => ({ name, ...dailyMap[name] }));

      const rangeStartTime = new Date();
      rangeStartTime.setDate(rangeStartTime.getDate() - (range - 1));
      rangeStartTime.setHours(0, 0, 0, 0);

      // Start with users created BEFORE the current range
      let cumulativeTotal = users.filter(u =>
          safeGetTime(u.account?.createdAt || 0) < rangeStartTime.getTime()
      ).length;

      const userGrowthTimeline = dateKeys.map(name => {
          const dayData = dailyMap[name];
          const newUsersToday = dayData.registered + dayData.unregistered;
          cumulativeTotal += newUsersToday;

          return {
              name,
              net: cumulativeTotal,
              registered: dayData.registered,
              unregistered: dayData.unregistered
          };
      });

      const distinctUsersCount = users.length;
      const returningUsers = new Set(events.map(e => e.uid)).size;
      const estimatedRetention = distinctUsersCount > 0 ? Math.round((returningUsers / distinctUsersCount) * 100) : 0;

      // Ensure the lifetimeInstalls value is actually a number and present
      const finalLifetimeCount = typeof lifetimeInstalls === 'number' ? lifetimeInstalls : 0;

      setAnalyticsData({
        timeSeriesData: timeSeries,
        userGrowthData: userGrowthTimeline,
        kpis: {
          totalInstalls,
          totalUninstalls: Math.max(0, totalInstalls - uniqueDevicesWithInstallEvent),
          deviceInstalls: finalLifetimeCount,
          deviceUninstalls: devices.filter(d => safeGetTime(d.lastSeenAt) < churnThreshold).length,
          churnEstimate,
          deletedAccounts,
          registeredUsers: registeredUsersCount,
          unregisteredUsers: unregisteredUsersCount,
          netGrowth: totalUserNodes,
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
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="glass p-4 rounded-2xl flex justify-end items-center gap-4 relative overflow-hidden backdrop-blur-xl border border-brand-sage/5">
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
          <OverviewModule data={analyticsData} theme={theme} />
          <EngagementModule data={analyticsData} theme={theme} />
          <IntelligenceModule data={analyticsData} theme={theme} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsHub;
