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
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  stats: { label: string, value: number }[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, stats }) => {
  const { theme } = useTheme();
  const { adminUser, hasPermission } = useAdmin();

  const sections = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/", permission: 'read.all' },
      ]
    },
    {
      title: "Content",
      items: [
        { name: "Facts", icon: FileText, path: "/facts", permission: 'read.all' },
        { name: "Categories", icon: Layers, path: "/categories", permission: 'read.all' },
        { name: "Collections", icon: Library, path: "/collections", permission: 'read.all' },
        { name: "Quizzes", icon: Lightbulb, path: "/quizzes", permission: 'read.all' },
        { name: "Achievements", icon: Trophy, path: "/achievements", permission: 'read.all' },
      ]
    },
    {
      title: "Users",
      items: [
        { name: "Users", icon: Users, path: "/users", permission: 'read.all' },
        { name: "Reports", icon: AlertCircle, path: "/reports", permission: 'read.all' },
      ]
    },
    {
      title: "Communication",
      items: [
        { name: "Notifications", icon: Bell, path: "/notifications", permission: 'read.all' },
        { name: "Broadcasts", icon: Radio, path: "/broadcasts", permission: 'manage.content' },
        { name: "Announcements", icon: Megaphone, path: "/announcements", permission: 'manage.content' },
      ]
    },
    {
      title: "Analytics",
      items: [
        { name: "Overview", icon: BarChart3, path: "/analytics", permission: 'read.all' },
        { name: "Engagement", icon: TrendingUp, path: "/analytics/engagement", permission: 'read.all' },
        { name: "Content Stats", icon: PieChart, path: "/analytics/content", permission: 'read.all' },
      ]
    },
    {
      title: "System",
      items: [
        { name: "App Settings", icon: Settings, path: "/settings", permission: 'manage.config' },
        { name: "Admins & Roles", icon: ShieldCheck, path: "/admins", permission: 'manage.admins' },
        { name: "Audit Logs", icon: HistoryIcon, path: "/audit-logs", permission: 'read.all' },
        { name: "Import / Export", icon: Download, path: "/import-export", permission: 'manage.admins' },
      ]
    }
  ];

  // Filter sections and items based on permissions
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => hasPermission(item.permission))
  })).filter(section => section.items.length > 0);

  return (
    <aside
      className={cn(
        "glass border-r flex flex-col h-screen fixed left-0 top-0 transition-all duration-500 ease-out z-30 backdrop-blur-3xl shadow-2xl",
        isCollapsed ? "w-20" : "w-64",
        theme === 'dark' ? "border-brand-sage/20 shadow-[10px_0_40px_rgba(0,0,0,0.4)]" : "bg-white/80 border-brand-primary/10 shadow-[10px_0_40px_rgba(45,106,79,0.05)]"
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
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em] block ml-4 opacity-50">
              {adminUser?.role.replace('_', ' ') || 'Identity Loading'}
            </span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-xl transition-all duration-300 mx-auto border backdrop-blur-md hover:scale-110 active:scale-90",
            theme === 'dark' ? "bg-brand-bg/50 text-brand-secondary border-brand-sage/20" : "bg-brand-primary/5 text-brand-primary border-brand-primary/10"
          )}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            {!isCollapsed && (
              <h3 className={cn(
                "px-4 text-[9px] font-black uppercase tracking-[0.4em]",
                theme === 'dark' ? "text-brand-secondary/30" : "text-brand-primary/40"
              )}>{section.title}</h3>
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
                      : theme === 'dark'
                        ? "text-brand-white/40 hover:bg-brand-white/5 hover:text-brand-white"
                        : "text-brand-surface/40 hover:bg-brand-primary/5 hover:text-brand-primary"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon size={isCollapsed ? 22 : 18} className={cn(
                    "shrink-0 transition-transform duration-300 group-hover:scale-110",
                    isCollapsed && "mx-auto"
                  )} />
                  {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{item.name}</span>}

                  {isCollapsed && (
                    <div className={cn(
                      "absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl",
                      theme === 'dark' ? "glass text-brand-white" : "bg-white text-brand-primary border border-brand-primary/10 shadow-lg"
                    )}>
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
        <div className={cn(
          "p-6 border-t bg-brand-bg/20",
          theme === 'dark' ? "border-brand-sage/10" : "border-brand-primary/5"
        )}>
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
