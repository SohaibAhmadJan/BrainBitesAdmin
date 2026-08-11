import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Clock,
  Filter,
  Eye,
  Heart,
  CheckCircle2,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { UserActivity } from '../../types';
import { fetchRecentActivity } from '../../services/firestoreService';
import { cn } from '../../utils/cn';

const UserActivityPage = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentActivity();
      setActivities(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error('Load activity failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Activity className="text-blue-500" size={32} />
             Live Activity Radar
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic uppercase tracking-widest text-[10px]">Real-Time Behavioral Stream</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Pulse</span>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
           <div className="relative w-full md:w-96 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={16} />
             <input
               type="text"
               placeholder="Search activity stream..."
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex gap-2">
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><Filter size={18} /></button>
              <button onClick={loadActivity} className="p-2 text-slate-500 hover:text-white transition-colors"><Clock size={18} /></button>
           </div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {activities.map((act) => (
            <div key={act.id} className="p-6 hover:bg-slate-800/20 transition-all group flex gap-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner border",
                act.type === 'READ_FACT' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                act.type === 'LIKE_FACT' ? "bg-pink-500/10 text-pink-500 border-pink-500/20" :
                act.type === 'COMPLETE_QUIZ' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}>
                {act.type === 'READ_FACT' && <Eye size={20} />}
                {act.type === 'LIKE_FACT' && <Heart size={20} />}
                {act.type === 'COMPLETE_QUIZ' && <CheckCircle2 size={20} />}
                {act.type === 'APP_OPEN' && <Smartphone size={20} />}
              </div>

              <div className="flex-1 space-y-1">
                 <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-200">
                       User <span className="text-white font-black">#{act.userId}</span> {
                         act.type === 'READ_FACT' ? 'viewed' :
                         act.type === 'LIKE_FACT' ? 'favorited' :
                         act.type === 'COMPLETE_QUIZ' ? 'completed' : 'opened'
                       } {act.targetName && <span className="text-blue-400">"{act.targetName}"</span>}
                    </p>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{new Date(act.timestamp).toLocaleTimeString()}</span>
                 </div>
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><Zap size={10} /> Latency: 45ms</span>
                    <span>Event Trace: {act.id}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-800/10 border-t border-slate-800 flex justify-center gap-2">
           <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-600 hover:text-white transition-all font-bold text-[10px] uppercase px-4">Previous Events</button>
           <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-600 hover:text-white transition-all font-bold text-[10px] uppercase px-4">Next Page</button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage;
