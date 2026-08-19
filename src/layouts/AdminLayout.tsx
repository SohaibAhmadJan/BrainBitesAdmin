import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import GlobalSearch from '../components/GlobalSearch';
import LivingEmeraldBackground from '../components/ui/LivingEmeraldBackground';
import { cn } from '../utils/cn';
import { fetchBites, fetchCollections, fetchNotifications } from '../services/firestoreService';
import { useTheme } from '../context/ThemeContext';
import { PAGE_TRANSITION } from '../utils/animations';

const AdminLayout = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [stats, setStats] = React.useState([
    { label: 'Facts', value: 0 },
    { label: 'Collections', value: 0 },
    { label: 'Notifs', value: 0 },
  ]);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const [facts, collections, notifications] = await Promise.all([
          fetchBites(),
          fetchCollections(),
          fetchNotifications(),
        ]);
        setStats([
          { label: 'Facts', value: facts.length },
          { label: 'Collections', value: collections.length },
          { label: 'Notifs', value: notifications.length },
        ]);
      } catch (err) {
        console.error('Layout stats load failed:', err);
      }
    };
    loadStats();
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path.replace(/-/g, ' ');
  };

  return (
    <div className={cn(
      "min-h-screen flex antialiased selection:bg-brand-primary/30 selection:text-brand-secondary font-sans overflow-hidden transition-colors duration-1000",
      theme === 'dark' ? "bg-brand-bg text-brand-white" : "bg-[#F7FBF9] text-[#1A2B22]"
    )}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? 'rgba(26, 43, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: theme === 'dark' ? '#E6F4EA' : '#1A2B22',
            borderRadius: '1.5rem',
            border: theme === 'dark' ? '1px solid rgba(39, 76, 58, 0.2)' : '1px solid rgba(45, 106, 79, 0.1)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '10px',
            letterSpacing: '0.1em'
          }
        }}
      />

      {/* High-Fidelity Living Background */}
      <LivingEmeraldBackground />

      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} stats={stats} />
      <GlobalSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />

      <div className={cn(
        "flex-1 transition-all duration-700 cubic-bezier(0.22, 1, 0.36, 1) flex flex-col min-h-screen relative z-10",
        isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <TopBar title={getPageTitle()} setIsSearchOpen={setIsSearchOpen} />

        <main className="flex-1 p-10 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...PAGE_TRANSITION}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
