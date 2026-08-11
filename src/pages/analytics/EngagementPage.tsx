import React, { useState, useEffect } from 'react';
import {
  Heart,
  Eye,
  TrendingUp,
  MessageSquare,
  Share2,
  Award,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { fetchBites } from '../../services/firestoreService';
import { cn } from '../../utils/cn';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const EngagementPage = () => {
  const [popularFacts, setPopularFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const facts = await fetchBites();
      // Use real data from Firestore. If engagement stats aren't available, they will be 0.
      const data = facts.map((f) => ({
        name: f.fact.slice(0, 20) + '...',
        likes: (f as any).likes || 0,
        views: (f as any).views || 0,
        shares: (f as any).shares || 0,
        category: f.category
      })).sort((a, b) => b.likes - a.likes).slice(0, 8);

      setPopularFacts(data);
    } catch (err) {
      console.error('Load engagement data failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Heart className="text-pink-500" size={32} />
             Content Popularity
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Viral psychology insights & engagement leaderboard</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest">Last 30 Days</button>
           <button className="px-4 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-pink-500/20">All Time</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Most Liked Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                 <BarChart3 className="text-emerald-500" size={20} />
                 Top 8 Liked Facts
              </h3>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Live Firestore Sync</p>
           </div>

           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularFacts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, width: 100}} />
                  <Tooltip
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  />
                  <Bar dataKey="likes" radius={[0, 8, 8, 0]} barSize={20}>
                    {popularFacts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Categories Pie */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
           <h3 className="text-xl font-black text-white tracking-tight self-start mb-10 flex items-center gap-2">
              <PieChart className="text-blue-400" size={20} />
              Interests
           </h3>
           <div className="w-full aspect-square relative flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-[16px] border-slate-800 border-t-emerald-500 border-l-blue-500"></div>
              <div className="absolute flex flex-col items-center">
                 <p className="text-3xl font-black text-white">42%</p>
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Social Psych</p>
              </div>
           </div>
           <div className="w-full mt-10 space-y-4">
              <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Social Psychology</span>
                 <span className="font-bold text-white">1,240 clicks</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Human Behavior</span>
                 <span className="font-bold text-white">890 clicks</span>
              </div>
           </div>
        </div>

      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="p-6 bg-slate-800/30 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Engagement Leaderboard</div>
         <table className="w-full text-left border-collapse text-sm">
            <tbody className="divide-y divide-slate-800/50">
               {popularFacts.map((f, i) => (
                 <tr key={i} className="hover:bg-slate-800/20 transition-all group">
                    <td className="p-6 w-16">
                       <span className="text-lg font-black text-slate-700 group-hover:text-emerald-500 transition-colors">#{i+1}</span>
                    </td>
                    <td className="p-6">
                       <p className="font-bold text-white">{f.name}</p>
                       <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{f.category}</p>
                    </td>
                    <td className="p-6">
                       <div className="flex gap-8">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-700 uppercase flex items-center gap-1"><Eye size={10} /> Views</span>
                             <span className="font-bold text-slate-300">{f.views.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-700 uppercase flex items-center gap-1"><Heart size={10} /> Likes</span>
                             <span className="font-bold text-pink-500">{f.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-700 uppercase flex items-center gap-1"><Share2 size={10} /> Shares</span>
                             <span className="font-bold text-blue-400">{f.shares.toLocaleString()}</span>
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">View Heatmap</button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default EngagementPage;
