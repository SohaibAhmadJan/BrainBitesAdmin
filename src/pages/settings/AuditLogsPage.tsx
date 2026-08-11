import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Terminal,
  User,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { AuditLog } from '../../types';
import { fetchAuditLogs } from '../../services/firestoreService';
import { cn } from '../../utils/cn';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error('Load logs failed', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Terminal className="text-blue-400" size={32} />
             Administrative Audit
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium italic uppercase tracking-widest text-[10px]">Secure Log of Every Control Action</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-800/20 border-b border-slate-800 flex items-center gap-4">
           <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
             <ShieldCheck size={16} />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Hash: <span className="text-slate-300 font-mono">BBS-882-993-X</span></p>
        </div>

        <div className="divide-y divide-slate-800/50">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-slate-600 uppercase font-black tracking-widest text-xs">Decrypting Records...</div>
          ) : filteredLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-800/20 transition-all group flex gap-6">
              <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                <Clock size={20} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-white tracking-tight">{log.action}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-tighter">{log.adminEmail}</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                   {log.details}
                </p>
                {log.targetId && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 uppercase">
                     <AlertCircle size={10} /> Target Trace: <span className="text-slate-500">#{log.targetId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-800/10 border-t border-slate-800 flex justify-center gap-2">
           <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-600 hover:text-white transition-all"><ChevronLeft size={16} /></button>
           <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-600 hover:text-white transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
