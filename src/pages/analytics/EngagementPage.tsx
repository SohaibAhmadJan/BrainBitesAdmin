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
  Activity
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
  Pie
} from 'recharts';
import { fetchBites } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#2D6A4F', '#95D5B2', '#E9C46A', '#3b82f6', '#ec4899'];

const EngagementPage = () => {
  const { theme } = useTheme();
  const [popularFacts, setPopularFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const facts = await fetchBites();
      const data = facts.map((f) => ({
        name: f.fact.slice(0, 20) + '...',
        likes: (f as any).likes || Math.floor(Math.random() * 100),
        views: (f as any).views || Math.floor(Math.random() * 500),
        shares: (f as any).shares || Math.floor(Math.random() * 50),
        category: f.category
      })).sort((a, b) => b.likes - a.likes).slice(0, 8);

      setPopularFacts(data);
    } catch (err) {
      console.error('Load engagement data failed', err);
    } finally {
      setLoading(false);
    }
  };

  const dummyPieData = [
    { name: 'Social', value: 400 },
    { name: 'Behavior', value: 300 },
    { name: 'Brain', value: 300 },
    { name: 'Habits', value: 200 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* High-End Header */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-end gap-10 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Heart className="text-pink-500" size={32} />
             </div>
             Engagement Analysis
          </h2>
          <p className="text-sub text-xs font-black uppercase tracking-[0.4em] mt-2 ml-1">Behavioral Dynamics • Content Viral Coefficients</p>
        </div>

        <div className="flex gap-4 relative z-10">
           <div className="flex bg-brand-bg/5 dark:bg-brand-bg/50 p-1.5 rounded-2xl border border-brand-sage/10">
              <button className="px-6 py-2.5 text-[10px] font-black text-brand-white bg-brand-primary rounded-xl shadow-lg uppercase tracking-widest transition-all">All History</button>
              <button className="px-6 py-2.5 text-[10px] font-black text-sub opacity-40 hover:opacity-100 uppercase tracking-widest transition-all">Periodic</button>
           </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Most Liked Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 glass p-10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] space-y-10 relative overflow-hidden"
        >
           <div className="flex items-center justify-between relative z-10">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-4">
                 <BarChart3 className="text-brand-primary" size={24} />
                 Engagement Leaderboard
              </h3>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest">
                 Live Intelligence
              </div>
           </div>

           <div className="h-[450px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularFacts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="5 5" horizontal={true} vertical={false} stroke={theme === 'dark' ? '#274C3A' : '#E6F4EA'} opacity={0.3} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#95D5B2', fontSize: 11, fontWeight: 700}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#95D5B2', fontSize: 11, fontWeight: 700, width: 120}} width={120} />
                  <Tooltip
                    cursor={{fill: theme === 'dark' ? '#1e293b' : '#f8fafc', opacity: 0.1}}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1A2B22' : '#FFFFFF',
                      borderColor: 'rgba(45,106,79,0.3)',
                      borderRadius: '20px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(45,106,79,0.1)'
                    }}
                  />
                  <Bar dataKey="likes" radius={[0, 12, 12, 0]} barSize={24} animationDuration={2000}>
                    {popularFacts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>

        {/* Categories Pie */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 glass p-10 rounded-[3rem] shadow-2xl flex flex-col items-center relative overflow-hidden"
        >
           <h3 className="text-2xl font-black tracking-tight self-start mb-12 flex items-center gap-4">
              <PieChart className="text-brand-secondary" size={24} />
              Interests
           </h3>

           <div className="w-full aspect-square relative flex items-center justify-center scale-110">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={dummyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {dummyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center animate-in zoom-in duration-1000">
                 <p className="text-5xl font-black">42<span className="text-2xl text-brand-primary">%</span></p>
                 <p className="text-[10px] font-black text-sub uppercase tracking-[0.3em]">Social Psych</p>
              </div>
           </div>

           <div className="w-full mt-12 space-y-6">
              {[
                { name: 'Social Psychology', val: '1,240 clicks', color: 'bg-brand-primary' },
                { name: 'Human Behavior', val: '890 clicks', color: 'bg-brand-secondary' },
                { name: 'Brain Science', val: '640 clicks', color: 'bg-brand-gold' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-brand-bg/5 dark:bg-brand-bg/30 p-4 rounded-2xl border border-brand-sage/5 hover:border-brand-primary/20 transition-all group">
                   <span className="flex items-center gap-3 text-xs font-bold opacity-70">
                      <div className={cn("w-2.5 h-2.5 rounded-full shadow-lg transition-transform group-hover:scale-125", item.color)}></div>
                      {item.name}
                   </span>
                   <span className="font-black text-brand-primary text-xs uppercase tracking-tighter">{item.val}</span>
                </div>
              ))}
           </div>

           <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-brand-secondary/5 blur-[80px] rounded-full pointer-events-none" />
        </motion.div>

      </div>

      {/* Modern Leaderboard Table */}
      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl relative overflow-hidden">
         <div className="p-8 bg-brand-primary/5 border-b border-brand-sage/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity size={18} className="text-brand-primary" />
               <h3 className="text-[11px] font-black text-sub uppercase tracking-[0.3em]">Sequence Performance Matrix</h3>
            </div>
            <span className="text-[9px] font-mono text-brand-primary/60 bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">v1.2.0-ENGAGEMENT</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-brand-sage/5">
                 {popularFacts.map((f, i) => (
                   <tr key={i} className="hover:bg-brand-white/5 transition-all group cursor-pointer">
                      <td className="p-8 w-24">
                         <span className={cn(
                           "text-2xl font-black transition-colors duration-500",
                           i === 0 ? "text-brand-gold drop-shadow-[0_0_10px_rgba(233,196,106,0.3)]" :
                           i === 1 ? "text-brand-secondary" :
                           i === 2 ? "text-brand-primary" : "opacity-20"
                         )}>#{i+1}</span>
                      </td>
                      <td className="p-8">
                         <p className="font-black text-lg tracking-tight line-clamp-1 italic">"{f.name}"</p>
                         <div className="flex items-center gap-3 mt-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                            <p className="text-[10px] font-black text-sub uppercase tracking-[0.2em]">{f.category}</p>
                         </div>
                      </td>
                      <td className="p-8">
                         <div className="flex gap-12">
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[9px] font-black text-sub uppercase flex items-center gap-2 opacity-50"><Eye size={12} /> Sequence Views</span>
                               <span className="text-lg font-black tabular-nums">{f.views.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[9px] font-black text-sub uppercase flex items-center gap-2 opacity-50"><Heart size={12} className="text-pink-500" /> Appreciation</span>
                               <span className="text-lg font-black text-pink-500 tabular-nums">{f.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[9px] font-black text-sub uppercase flex items-center gap-2 opacity-50"><Share2 size={12} className="text-brand-primary" /> Viral Chain</span>
                               <span className="text-lg font-black text-brand-primary tabular-nums">{f.shares.toLocaleString()}</span>
                            </div>
                         </div>
                      </td>
                      <td className="p-8 text-right">
                         <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="px-6 py-2.5 bg-brand-bg/5 dark:bg-brand-bg border border-brand-sage/20 text-sub hover:text-brand-primary hover:border-brand-primary rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl"
                         >
                            Analyze Heatmap
                         </motion.button>
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

export default EngagementPage;
