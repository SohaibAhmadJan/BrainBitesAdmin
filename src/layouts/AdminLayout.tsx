import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import GlobalSearch from '../components/GlobalSearch';
import { cn } from '../utils/cn';
import { fetchBites, fetchCollections, fetchNotifications } from '../services/firestoreService';
import { useTheme } from '../context/ThemeContext';

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
      "min-h-screen flex antialiased selection:bg-brand-primary/30 selection:text-brand-secondary font-sans overflow-hidden transition-colors duration-300",
      theme === 'dark' ? "bg-brand-bg text-brand-white" : "bg-[#F7FBF9] text-[#1A2B22]"
    )}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1A2B22' : '#FFFFFF',
            color: theme === 'dark' ? '#E6F4EA' : '#1A2B22',
            borderRadius: '1rem',
            border: theme === 'dark' ? '1px solid #274C3A' : '1px solid #E6F4EA'
          }
        }}
      />

      {/* Animated Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute top-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-500",
            theme === 'dark' ? "bg-brand-primary/10" : "bg-brand-primary/5"
          )}
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-500",
            theme === 'dark' ? "bg-brand-secondary/5" : "bg-brand-secondary/10"
          )}
        />
      </div>

      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} stats={stats} />
      <GlobalSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />

      <div className={cn(
        "flex-1 transition-all duration-500 ease-in-out flex flex-col min-h-screen relative z-10",
        isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <TopBar title={getPageTitle()} setIsSearchOpen={setIsSearchOpen} />

        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
