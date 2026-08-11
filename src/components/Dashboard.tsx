import React from 'react';

interface DashboardProps {
  stats: { label: string; value: number }[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl hover:border-emerald-500/50 transition-colors group">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            <h2 className="text-4xl font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to Master Control</h2>
        <p className="text-slate-400 leading-relaxed max-w-2xl">
          Use this dashboard to manage the BrainBites content ecosystem. Changes made here are pushed to Firestore in real-time and will be visible to your Android users instantly via the reactive repository architecture.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <h4 className="font-semibold text-emerald-400">Fact Editor</h4>
            <p className="text-xs text-slate-500 mt-1">Full CRUD support for psychology insights and quizzes.</p>
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <h4 className="font-semibold text-blue-400">Notification Engine</h4>
            <p className="text-xs text-slate-500 mt-1">Broadcast high-priority messages to all mobile devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
