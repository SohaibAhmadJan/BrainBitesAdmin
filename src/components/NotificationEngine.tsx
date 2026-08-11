import React, { useState } from 'react';
import { AppNotification, NotificationType } from '../types';

interface NotificationEngineProps {
  notifications: AppNotification[];
  onSend: (notif: { title: string; message: string; type: NotificationType }) => void;
}

const NotificationEngine: React.FC<NotificationEngineProps> = ({ notifications, onSend }) => {
  const [form, setForm] = useState<{ title: string; message: string; type: NotificationType }>({
    title: '',
    message: '',
    type: 'NEW_FACT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    onSend(form);
    setForm({ title: '', message: '', type: 'NEW_FACT' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl space-y-6 h-fit">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
          Compose Message
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Headline</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="E.g. New Psychology Fact Added!"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Body Message</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              rows={4}
              placeholder="What do you want to tell your users?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intent Type</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}
            >
              <option value="NEW_FACT">New Fact Alert</option>
              <option value="ACHIEVEMENT">Achievement Milestone</option>
              <option value="SYSTEM">System Broadcast</option>
              <option value="GENERAL">General Update</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            Push to All Devices
          </button>
        </form>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 scrollbar-hide">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Recent Broadcasts</h3>
        {notifications.map((n) => (
          <div key={n.id} className="bg-slate-800/20 border border-slate-700/50 p-5 rounded-2xl space-y-2 group hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-300">{n.title}</h4>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                n.type === 'NEW_FACT' ? 'bg-emerald-500/10 text-emerald-500' :
                n.type === 'ACHIEVEMENT' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {n.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
            <p className="text-[10px] text-slate-600 font-mono mt-3">Sent: {new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationEngine;
