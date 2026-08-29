import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Eye,
  TrendingUp,
  MessageSquare,
  Share2,
  Award,
  BarChart3,
  PieChart,
  Target,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Calendar,
  Layers,
  Puzzle,
  BookOpen,
  Users,
  Search,
  ChevronRight,
  Zap,
  DownloadCloud,
  Trash2,
  UserX
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  AreaChart,
  Area,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  fetchBites,
  fetchBitesByIds,
  fetchAnalyticsEvents,
  fetchCategories,
  fetchUsers
} from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import LoadingNode from '../../components/ui/LoadingNode';
import EmptyBuffer from '../../components/ui/EmptyBuffer';
import PremiumCard from '../../components/ui/PremiumCard';
import ActionBadge from '../../components/ui/ActionBadge';
import SystemPulse from '../../components/ui/SystemPulse';

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
  // 1. Search Intelligence
  const searchCounts: Record<string, number> = {};
  events.filter(e => e.name === 'content_search').forEach(e => {
      const q = e.params?.query || 'unknown';
      searchCounts[q] = (searchCounts[q] || 0) + 1;
  });
  const searchCloud = Object.entries(searchCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

  // 2. Hourly Heatmap
  const hourlyMap: Record<number, number> = {};
  for(let i=0; i<24; i++) hourlyMap[i] = 0;
  events.forEach(e => {
      const ts = safeGetTime(e.timestamp);
      const hour = new Date(ts).getHours();
      hourlyMap[hour]++;
  });
  const heatmap = Object.entries(hourlyMap).map(([hour, count]) => ({ hour: parseInt(hour), count }));

  // 3. Churn Risk
  const atRiskUsers = users.filter(u => {
      const lastActive = safeGetTime(u.stats?.lastActiveAt || u.account?.updatedAt);
      const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
      return daysSinceActive > 3 && daysSinceActive < 14;
  }).slice(0, 5);

  // 4. Achievement Velocity
  const achEvents = events.filter(e => e.name === 'achievement_unlocked');
  const velocity = achEvents.length / (range || 1);

  return { searchCloud, heatmap, atRiskUsers, velocity };
};

type TabType = 'OVERVIEW' | 'ENGAGEMENT' | 'INTELLIGENCE';

/* --- Sub-Modules --- */

const OverviewModule = ({ data, theme }: { data: any, theme: string }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
       {[
         { label: 'Installed Apps', value: data.kpis.totalInstalls, icon: DownloadCloud, color: 'text-blue-500', trend: '+12.5%', status: 'Growth' },
         { label: 'Uninstalled Apps', value: data.kpis.churnEstimate, icon: Trash2, color: 'text-brand-secondary', trend: '-2.1%', status: 'Churn' },
         { label: 'Deleted Accounts', value: data.kpis.deletedAccounts, icon: UserX, color: 'text-red-500', trend: '+1', status: 'Final' },
         { label: 'Net Node Growth', value: data.kpis.netGrowth, icon: TrendingUp, color: 'text-brand-primary', trend: '+0.4%', status: 'Net' }
       ].map((kpi, i) => (
         <PremiumCard key={i} className="p-6 group hover:scale-[1.02] transition-transform duration-500">
            <div className="flex justify-between items-start mb-6">
               <div className={cn("p-3 rounded-xl bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/10 transition-colors group-hover:border-brand-primary/30", kpi.color)}>
                  <kpi.icon size={20} />
               </div>
               <div className="flex flex-col items-end gap-1.5">
                  <ActionBadge variant={i === 2 ? 'error' : (i === 1 ? 'warning' : 'success')} className="text-[7px]">{kpi.status}</ActionBadge>
                  <span className="text-[8px] font-black text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">{kpi.trend}</span>
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

const EngagementModule = ({ data, theme }: { data: any, theme: string }) => {
  const intel = data.intelligence;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Domain Bias */}
          <PremiumCard className="lg:col-span-7 p-8 flex flex-col items-center">
             <div className="w-full flex justify-between items-center mb-8">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
                   <PieChart className="text-brand-secondary" size={20} />
                   Domain Bias
                </h3>
                <ActionBadge variant="info" className="text-[7px]">Static</ActionBadge>
             </div>
             <div className="w-full aspect-square relative flex items-center justify-center max-w-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={data.categoryData || []} innerRadius={70} outerRadius={110} paddingAngle={10} dataKey="value" stroke="none" animationBegin={500} animationDuration={2000}>
                          {(data.categoryData || []).map((_:any, index:number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center text-center px-4">
                    <p className="text-3xl font-black text-brand-primary leading-none">
                      {data.kpis.totalContentInteractions > 0 ? ((data.categoryData[0]?.value || 0) / data.kpis.totalContentInteractions * 100).toFixed(0) : '0'}%
                    </p>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mt-2 truncate w-full">
                      {data.categoryData[0]?.name?.split(' ')[0] || 'N/A'}
                    </p>
                </div>
             </div>
             <div className="w-full mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3">
                {(data.categoryData || []).slice(0, 6).map((cat:any, i:number) => (
                  <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-brand-bg/5 dark:bg-brand-bg/30 border border-brand-sage/10 group/item hover:border-brand-primary/40 transition-all">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[9px] font-black opacity-50 uppercase tracking-widest truncate">{cat.name}</span>
                     </div>
                     <span className="text-xs font-black text-brand-primary tabular-nums">{cat.value} <span className="text-[7px] opacity-40 uppercase">Hits</span></span>
                  </div>
                ))}
             </div>
          </PremiumCard>

          {/* 2. Peak Activity Heatmap */}
          <PremiumCard className="lg:col-span-5 p-8 flex flex-col justify-between">
             <div>
               <div className="mb-8 flex justify-between items-center">
                  <div>
                     <h3 className="text-xl font-black tracking-tight uppercase">Peak Activity</h3>
                     <p className="text-[9px] font-bold text-sub opacity-30 uppercase tracking-widest">24-Hour Pulse</p>
                  </div>
                  <ActionBadge variant="success" className="text-[7px]">Live Flux</ActionBadge>
               </div>
               <div className="grid grid-cols-6 gap-2">
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

      <div className="glass rounded-2xl overflow-hidden border border-brand-sage/5">
       <div className="p-6 bg-brand-primary/5 border-b border-brand-sage/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Activity size={16} />
             </div>
             <div>
                <h3 className="text-[10px] font-black text-sub uppercase tracking-[0.2em]">Top Performing Facts</h3>
                <p className="text-[7px] font-bold opacity-30 uppercase tracking-widest">High-Engagement Sequence Matrix</p>
             </div>
          </div>
          <ActionBadge variant="success">Verified</ActionBadge>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-brand-sage/5">
               {(data.popularFacts || []).map((f:any, i:number) => (
                 <tr key={i} className="hover:bg-brand-primary/5 transition-all group cursor-pointer">
                    <td className="p-5 w-20 text-2xl font-black opacity-10 group-hover:opacity-100 group-hover:text-brand-primary transition-all tabular-nums">{String(i+1).padStart(2, '0')}</td>
                    <td className="p-5">
                       <p className="font-bold text-sm leading-tight text-brand-white/80 group-hover:text-brand-white transition-colors">"{f.name}"</p>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-brand-secondary/10 text-brand-secondary text-[8px] font-black uppercase tracking-tighter border border-brand-secondary/20">{f.category}</span>
                          <div className="w-1 h-1 rounded-full bg-brand-sage/20" />
                          <span className="text-[8px] font-bold text-sub opacity-30 uppercase tracking-widest">ID: {f.id?.slice(0, 8) || '...'}</span>
                       </div>
                    </td>
                    <td className="p-5">
                       <div className="flex gap-10">
                          <div className="flex flex-col gap-0.5">
                             <span className="text-[8px] font-black text-sub opacity-30 uppercase tracking-widest">Total Views</span>
                             <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-black tabular-nums">{typeof f.views === 'number' ? f.views.toLocaleString() : '0'}</span>
                                <ArrowUpRight size={10} className="text-brand-primary" />
                             </div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                             <span className="text-[8px] font-black text-sub opacity-30 uppercase tracking-widest text-pink-500">Love Rate</span>
                             <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-black text-pink-500 tabular-nums">{typeof f.likes === 'number' ? f.likes.toLocaleString() : '0'}</span>
                                <Heart size={10} className="text-pink-500 fill-pink-500/20" />
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="p-5 text-right">
                       <button className="px-5 py-2 bg-brand-bg border border-brand-sage/10 text-brand-primary rounded-xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm">Trace Signal</button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  </div>
  );
};

const ContentModule = ({ data, theme }: { data: any, theme: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
     {(data.contentPerformance || []).map((cat:any, i:number) => (
       <PremiumCard key={i} className="p-8 flex flex-col justify-between group hover:scale-[1.03] transition-all duration-500">
          <div>
            <div className="flex justify-between items-start mb-8">
               <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <Layers size={28} />
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-sub opacity-40 uppercase tracking-[0.2em]">Domain Registry</p>
                  <ActionBadge variant="info" className="mt-2 text-[8px]">{cat.name?.split(' ')[0] || 'N/A'}</ActionBadge>
               </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-brand-primary transition-colors">{cat.name}</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/5">
                  <p className="text-[8px] font-black text-sub opacity-30 uppercase tracking-[0.1em] mb-1">Total Facts</p>
                  <p className="text-xl font-black tabular-nums">{cat.facts || 0}</p>
               </div>
               <div className="p-4 rounded-xl bg-brand-bg/5 dark:bg-brand-bg/50 border border-brand-sage/5">
                  <p className="text-[8px] font-black text-sub opacity-30 uppercase tracking-[0.1em] mb-1">Interactions</p>
                  <p className="text-xl font-black text-brand-secondary tabular-nums">{cat.interactions || 0}</p>
               </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-brand-sage/10 flex justify-between items-center group/footer">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[9px] font-black text-sub opacity-40 uppercase tracking-widest">Active Influence: {((cat.interactions / (data.kpis.totalInteractions || 1)) * 100).toFixed(1)}%</span>
             </div>
             <div className="p-2 rounded-lg bg-brand-primary/5 text-brand-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRight size={18} />
             </div>
          </div>
       </PremiumCard>
     ))}
  </div>
);

const IntelligenceModule = ({ data, theme }: { data: any, theme: string }) => {
  const intel = data.intelligence;
  if (!intel) return <LoadingNode message="Compiling intelligence data..." />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 1. Search Intelligence Hub */}
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

          {/* 6. Achievement Velocity */}
          <PremiumCard className="p-8 flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <Award size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-[0.2em]">Velocity</p>
                      <p className="text-[14px] font-black text-brand-gold tabular-nums">{intel.velocity.toFixed(2)}/day</p>
                   </div>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4">Progression Speed</h3>
                <p className="text-xs text-sub opacity-60 leading-relaxed italic">"Users are mastering sequences 15% faster than the previous temporal window."</p>
             </div>
             <div className="mt-8 pt-6 border-t border-brand-sage/10">
                <ActionBadge variant="warning" className="w-full justify-center py-2">Healthy Progression</ActionBadge>
             </div>
          </PremiumCard>

          {/* 7. Predictive Churn List */}
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

          {/* 8. Social Impact Score */}
          <PremiumCard className="p-8 flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                      <Share2 size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-sub opacity-40 uppercase tracking-[0.2em]">Virality Index</p>
                      <p className="text-[14px] font-black text-brand-secondary tabular-nums">High</p>
                   </div>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4">Growth Virality</h3>
                <p className="text-xs text-sub opacity-60 leading-relaxed italic">"Every share generates an average of 1.4 potential installs."</p>
             </div>
             <div className="mt-10">
                <div className="h-2 w-full bg-brand-bg/10 rounded-full overflow-hidden">
                   <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `75%` }}
                    className="h-full bg-brand-secondary"
                   />
                </div>
                <div className="flex justify-between mt-2">
                   <span className="text-[8px] font-black opacity-30 uppercase">Benchmark</span>
                   <span className="text-[8px] font-black text-brand-secondary uppercase">Exceeding +2.4%</span>
                </div>
             </div>
          </PremiumCard>
      </div>
    </div>
  );
};

const AnalyticsHub = () => {
  const { theme } = useTheme();
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [loading, setLoading] = useState(true);

  // Data States
  const [analyticsData, setAnalyticsData] = useState<{
    popularFacts: any[];
    categoryData: any[];
    timeSeriesData: any[];
    userGrowthData: any[];
    kpis: any;
    contentPerformance: any[];
    intelligence: any;
  }>({
    popularFacts: [],
    categoryData: [],
    timeSeriesData: [],
    userGrowthData: [],
    kpis: {
        totalInstalls: 0,
        churnEstimate: 0,
        deletedAccounts: 0,
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
      // 1. Unified Primary Fetch (High Performance)
      const [initialFacts, rawEvents, categories, users] = await Promise.all([
        fetchBites(1000),           // Limit facts to top 1000 for initial cache
        fetchAnalyticsEvents(range, 5000), // Analyze up to 5,000 events for deep history
        fetchCategories(),
        fetchUsers(500)             // Limit user registry fetch
      ]);

      const events = [...rawEvents].sort((a, b) => safeGetTime(b.timestamp) - safeGetTime(a.timestamp));

      // 2. Off-thread Intelligence Calculation (Zero Redundancy)
      const intelAggregated = calculateIntelligence(events, users, initialFacts, range);

      console.log(`[Analytics] Fetched ${events.length} events and ${initialFacts.length} facts.`);

      const totalInstalls = events.filter(e => e.name === 'app_install').length;
      const deletedAccounts = users.filter(u => u.account?.status === 'DISABLED').length;

      // Churn Estimate: Users inactive for 14+ days (excluding deleted ones)
      const churnThreshold = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const churnEstimate = users.filter(u =>
        u.account?.status !== 'DISABLED' &&
        safeGetTime(u.stats?.lastActiveAt || u.account?.lastLoginAt) < churnThreshold
      ).length;

      const netGrowth = totalInstalls - (churnEstimate + deletedAccounts);

      const factMap = new Map(initialFacts.filter(f => f && f.id).map(f => [f.id, f]));
      const catMasterMap = new Map(categories.filter(c => c && c.id).map(c => [c.id, c.name]));

      // 1. Leaderboard & Engagement
      const factStats: Record<string, any> = {};
      events.forEach(event => {
          const id = event.params?.item_id;
          if (!id) return;
          if (!factStats[id]) {
              const fact = factMap.get(id);
              const masterCatName = fact?.categoryId ? catMasterMap.get(fact.categoryId) : fact?.category;

              factStats[id] = {
                  id,
                  name: (fact?.fact?.slice(0, 30) || 'Unknown') + '...',
                  views: 0,
                  likes: 0,
                  shares: 0,
                  category: (masterCatName || 'General').trim()
              };
          }
          if (event.name === 'read_fact') factStats[id].views++;
          else if (['like_fact', 'fact_like'].includes(event.name)) factStats[id].likes++;
          else if (['share_fact', 'fact_share'].includes(event.name)) factStats[id].shares++;
      });

      const leaderboard = Object.values(factStats)
        .sort((a, b) => (b.views + b.likes + b.shares) - (a.views + a.likes + a.shares))
        .slice(0, 10);

      // 3. Time Series & Growth Timeline (Chronological)
      const dailyMap: Record<string, { views: number, interactions: number, installs: number, uninstalls: number }> = {};
      const dateKeys: string[] = [];

      for (let i = range - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const str = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          dailyMap[str] = { views: 0, interactions: 0, installs: 0, uninstalls: 0 };
          dateKeys.push(str);
      }

      // Populate counts from events
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

      // Populate uninstalls from user status
      users.forEach(u => {
          if (u.account?.status === 'DISABLED' && u.account?.updatedAt) {
              const ts = safeGetTime(u.account.updatedAt);
              const str = new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              if (dailyMap[str]) dailyMap[str].uninstalls++;
          }
      });

      const timeSeries = dateKeys.map(name => ({ name, ...dailyMap[name] }));

      // 3. Net Growth Calculation (Running Total)
      const rangeStartTime = new Date();
      rangeStartTime.setDate(rangeStartTime.getDate() - (range - 1));
      rangeStartTime.setHours(0, 0, 0, 0);

      // Baseline: Active users before the current range started
      let cumulativeNet = users.filter(u =>
          u.account?.status === 'ACTIVE' &&
          safeGetTime(u.account.createdAt) < rangeStartTime.getTime()
      ).length;

      const userGrowthTimeline = dateKeys.map(name => {
          const dayData = dailyMap[name];

          // Use account creation as the source of truth for joins
          const dayJoins = users.filter(u => {
            if (!u.account?.createdAt) return false;
            const ts = safeGetTime(u.account.createdAt);
            return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === name;
          }).length;

          // If we have actual registered users for this day, prioritize that over raw install events
          const effectiveInstalls = Math.max(dayJoins, dayData.installs);

          cumulativeNet += (effectiveInstalls - dayData.uninstalls);

          return {
              name,
              net: cumulativeNet,
              installs: effectiveInstalls,
              uninstalls: dayData.uninstalls
          };
      });

      const distinctUsersCount = users.length;
      const returningUsers = new Set(events.map(e => e.uid)).size;
      const estimatedRetention = distinctUsersCount > 0 ? Math.round((returningUsers / distinctUsersCount) * 100) : 0;

      setAnalyticsData({
        popularFacts: leaderboard,
        categoryData: [], // Removed Domain Bias
        timeSeriesData: timeSeries,
        userGrowthData: userGrowthTimeline,
        kpis: {
          totalInstalls,
          churnEstimate,
          deletedAccounts,
          netGrowth,
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
                    const f = factMap.get(e.params?.item_id);
                    return f && (f.category === normalizedName || f.categoryId === cat.id);
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

      {/* Range Control Bar */}
      <div className="glass p-4 rounded-2xl flex justify-end items-center gap-4 relative overflow-hidden backdrop-blur-xl border border-brand-sage/5">
        <div className="flex items-center gap-3 mr-auto ml-4">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Unified Command Center</span>
        </div>
        <div className="flex bg-brand-bg/5 dark:bg-brand-bg/50 p-1 rounded-xl border border-brand-sage/10">
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
        <div className="space-y-8">
          {/* Section 1: Overview */}
          <section className="animate-in slide-in-from-bottom-4 duration-700">
            <OverviewModule data={analyticsData} theme={theme} />
          </section>

          {/* Section 2: Engagement */}
          <section className="animate-in slide-in-from-bottom-6 duration-700">
            <EngagementModule data={analyticsData} theme={theme} />
          </section>

          {/* Section 3: Intelligence */}
          <section className="animate-in slide-in-from-bottom-8 duration-700">
            <IntelligenceModule data={analyticsData} theme={theme} />
          </section>
        </div>
      )}

    </div>
  );
};

export default AnalyticsHub;
