import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  SearchX
} from 'lucide-react';
import { UserProfile, Achievement } from '../../types';
import { fetchUsers, fetchAchievements } from '../../services/firestoreService';
import { cn } from '../../utils/cn';
import UserSiteDrawer from './UserSiteDrawer';

const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, achData] = await Promise.all([
        fetchUsers(),
        fetchAchievements()
      ]);
      setUsers(userData);
      setAchievements(achData);
    } catch (err) {
      console.error('Load data failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'All' || user.status === statusFilter)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-brand-white tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-brand-primary/10 rounded-[1.5rem] shadow-lg">
                <Users className="text-brand-primary" size={32} />
             </div>
             User Directory
          </h2>
          <p className="text-brand-secondary/40 text-xs font-black uppercase tracking-[0.3em] mt-2 ml-1">Identity Management • Engagement Intelligence</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
          <div className="relative flex-1 md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/30 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Query by identity identifier..."
              className="w-full bg-brand-bg/50 border border-brand-sage/20 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm text-brand-white focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner backdrop-blur-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-white rounded-2xl border border-brand-primary/20 transition-all shadow-lg"
          >
            <Filter size={20} />
          </motion.button>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Users Table */}
      <div className="glass rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 border-b border-brand-sage/10 text-[10px] font-black text-brand-secondary/30 uppercase tracking-[0.3em]">
                <th className="p-8">Participant Identity</th>
                <th className="p-8">Security Status</th>
                <th className="p-8">Engagement Profile</th>
                <th className="p-8">Last Sequence</th>
                <th className="p-8 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-8"><div className="h-12 bg-brand-sage/10 rounded-2xl w-full" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                       <SearchX size={64} className="text-brand-secondary" />
                       <p className="text-lg font-black tracking-widest uppercase">Zero matches in current subset</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-brand-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-3xl bg-brand-bg/80 border border-brand-sage/30 flex items-center justify-center text-brand-primary font-black text-xl shadow-xl group-hover:scale-110 group-hover:border-brand-primary/40 transition-all duration-500 overflow-hidden relative">
                            {user.email[0].toUpperCase()}
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-brand-white group-hover:text-brand-primary transition-colors">{user.email}</p>
                            <p className="text-[10px] text-brand-secondary/30 font-mono mt-1 uppercase tracking-[0.2em]">UID: {user.id.slice(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg",
                          user.status === 'Active' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-brand-primary/5" :
                          user.status === 'Suspended' ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/5" :
                          "bg-brand-surface border-brand-sage/20 text-brand-secondary/40 shadow-inner"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? 'bg-brand-primary animate-pulse' : 'bg-red-500')} />
                          {user.status}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-brand-secondary/20 uppercase tracking-widest">Read Facts</span>
                            <span className="text-sm font-black text-brand-white/80">{user.factsViewed}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-brand-secondary/20 uppercase tracking-widest">BB Score</span>
                            <span className="text-sm font-black text-brand-gold">{user.quizScore}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-brand-secondary/20 uppercase tracking-widest">Shelf</span>
                            <span className="text-sm font-black text-brand-primary">{user.achievementsCount} 🏆</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                           <span className="text-sm font-bold text-brand-secondary/60">{user.lastActive}</span>
                           <span className="text-[9px] text-brand-secondary/20 uppercase font-black tracking-widest flex items-center gap-1">
                             <Calendar size={10} /> Joined {new Date(user.registrationDate).toLocaleDateString()}
                           </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                              className="p-3 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-white rounded-2xl transition-all shadow-xl"
                              title="Inspect Identity"
                            >
                              <TrendingUp size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-brand-white rounded-2xl transition-all shadow-xl"
                              title="Restrict Access"
                            >
                              <ShieldAlert size={18} />
                            </motion.button>
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-brand-secondary/40 px-10 font-bold uppercase tracking-[0.2em] text-[10px]">
         <p>Global Audience Index: {filteredUsers.length} Active Profiles</p>
         <div className="flex gap-4">
            <motion.button whileHover={{ x: -2 }} className="p-3 rounded-2xl glass hover:text-brand-white transition-all"><ChevronLeft size={20} /></motion.button>
            <motion.button whileHover={{ x: 2 }} className="p-3 rounded-2xl glass hover:text-brand-white transition-all"><ChevronRight size={20} /></motion.button>
         </div>
      </div>

      {selectedUser && (
        <UserSiteDrawer
          user={selectedUser}
          allAchievements={achievements}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
