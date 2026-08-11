import React from 'react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: any) => void;
  stats: { label: string; value: number }[];
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, stats }) => {
  const menuItems = ['Dashboard', 'Facts', 'Collections', 'Notifications', 'Import'];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-slate-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-500 tracking-tight">BrainBites <span className="text-xs uppercase text-slate-500 block">Admin Master</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center group ${
              activePage === item
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-3 transition-all ${activePage === item ? 'bg-emerald-400 scale-100' : 'bg-slate-600 scale-0 group-hover:scale-100'}`}></span>
            {item}
          </button>
        ))}
      </nav>

      <div className="p-4 m-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Quick Stats</h3>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex justify-between items-center px-2">
              <span className="text-sm">{stat.label}</span>
              <span className="text-xs font-mono bg-slate-700 text-emerald-400 px-2 py-0.5 rounded-full">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
