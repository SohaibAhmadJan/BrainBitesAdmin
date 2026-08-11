import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Lightbulb,
  Trophy,
  MessageSquare,
  Image as ImageIcon,
  Users,
  Activity,
  Heart,
  AlertCircle,
  Bell,
  Radio,
  Megaphone,
  BarChart3,
  TrendingUp,
  PieChart,
  Settings,
  ShieldCheck,
  History as HistoryIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  Library
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  stats: { label: string, value: number }[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, stats }) => {
  const sections = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/" },
      ]
    },
    {
      title: "Content",
      items: [
        { name: "Facts", icon: FileText, path: "/facts" },
        { name: "Categories", icon: Layers, path: "/categories" },
        { name: "Collections", icon: Library, path: "/collections" },
        { name: "Quizzes", icon: Lightbulb, path: "/quizzes" },
        { name: "Achievements", icon: Trophy, path: "/achievements" },
        { name: "Quotes", icon: MessageSquare, path: "/quotes" },
        { name: "Media", icon: ImageIcon, path: "/media" },
      ]
    },
    {
      title: "Users",
      items: [
        { name: "Users", icon: Users, path: "/users" },
        { name: "Activity", icon: Activity, path: "/user-activity" },
        { name: "Favorites", icon: Heart, path: "/favorites" },
        { name: "Reports", icon: AlertCircle, path: "/reports" },
      ]
    },
    {
      title: "Communication",
      items: [
        { name: "Notifications", icon: Bell, path: "/notifications" },
        { name: "Broadcasts", icon: Radio, path: "/broadcasts" },
        { name: "Announcements", icon: Megaphone, path: "/announcements" },
      ]
    },
    {
      title: "Analytics",
      items: [
        { name: "Overview", icon: BarChart3, path: "/analytics" },
        { name: "Engagement", icon: TrendingUp, path: "/analytics/engagement" },
        { name: "Content Stats", icon: PieChart, path: "/analytics/content" },
      ]
    },
    {
      title: "System",
      items: [
        { name: "App Settings", icon: Settings, path: "/settings" },
        { name: "Admins & Roles", icon: ShieldCheck, path: "/admins" },
        { name: "Audit Logs", icon: HistoryIcon, path: "/audit-logs" },
        { name: "Import / Export", icon: Download, path: "/import-export" },
      ]
    }
  ];

  return (
    <aside
      className={cn(
        "glass border-r border-brand-sage/20 flex flex-col h-screen fixed left-0 top-0 transition-all duration-500 ease-out z-30 shadow-[10px_0_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="animate-in fade-in duration-500"
          >
            <h1 className="text-xl font-black text-brand-primary tracking-tighter flex items-center gap-2">
               <div className="w-2 h-6 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(45,106,79,0.6)]" />
               BrainBites
            </h1>
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em] block ml-4 opacity-50">Admin Master</span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl bg-brand-bg/50 text-brand-secondary hover:text-brand-primary hover:scale-110 active:scale-90 transition-all duration-300 mx-auto border border-brand-sage/20 backdrop-blur-md"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            {!isCollapsed && (
              <h3 className="px-4 text-[9px] font-black text-brand-secondary/30 uppercase tracking-[0.4em]">{section.title}</h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-brand-primary shadow-[0_10px_25px_rgba(45,106,79,0.3)] text-brand-white"
                      : "text-brand-white/40 hover:bg-brand-white/5 hover:text-brand-white"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon size={isCollapsed ? 22 : 18} className={cn(
                    "shrink-0 transition-transform duration-300 group-hover:scale-110",
                    isCollapsed && "mx-auto"
                  )} />
                  {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{item.name}</span>}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 glass rounded-xl text-brand-white text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Mini Stats Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-brand-sage/10 bg-brand-bg/20">
           <div className="grid grid-cols-3 gap-2">
              {stats.slice(0, 3).map((s, i) => (
                <div key={i} className="text-center">
                   <p className="text-[8px] font-black text-brand-secondary/40 uppercase tracking-tighter">{s.label}</p>
                   <p className="text-xs font-black text-brand-primary">{s.value}</p>
                </div>
              ))}
           </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
