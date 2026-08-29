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
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
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
        { name: "Broadcast Hub", icon: Radio, path: "/notifications", permission: 'read.all' },
      ]
    },
    {
      title: "Analytics",
      items: [
        { name: "Analytics Hub", icon: BarChart3, path: "/analytics", permission: 'read.all' },
      ]
    },
    {
      title: "System",
      items: [
        { name: "App Settings", icon: Settings, path: "/settings", permission: 'manage.config' },
        { name: "Admins & Roles", icon: ShieldCheck, path: "/admins", permission: 'manage.admins' },
        { name: "Audit Logs", icon: HistoryIcon, path: "/audit-logs", permission: 'audit.view' },
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
        "glass border-r flex flex-col h-full transition-all duration-300 ease-out z-30 backdrop-blur-3xl shadow-xl shrink-0",
        isCollapsed ? "w-16" : "w-60",
        theme === 'dark' ? "border-brand-sage/20" : "bg-white/80 border-brand-primary/10"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-lg font-bold text-brand-primary tracking-tight flex items-center gap-2">
               <div className="w-1.5 h-5 bg-brand-primary rounded-full" />
               BrainBites
            </h1>
            <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest block ml-3.5 opacity-50">
              {adminUser?.role.replace('_', ' ') || 'Admin'}
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

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            {!isCollapsed && (
              <h3 className={cn(
                "px-3 text-[8px] font-bold uppercase tracking-widest",
                theme === 'dark' ? "text-brand-secondary/40" : "text-brand-primary/50"
              )}>{section.title}</h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-brand-primary text-brand-white"
                      : theme === 'dark'
                        ? "text-brand-white/40 hover:bg-brand-white/5 hover:text-brand-white"
                        : "text-brand-surface/40 hover:bg-brand-primary/5 hover:text-brand-primary"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon size={isCollapsed ? 20 : 16} className={cn(
                    "shrink-0 transition-transform duration-200",
                    isCollapsed && "mx-auto"
                  )} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}

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

    </aside>
  );
};

export default Sidebar;
