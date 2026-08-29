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

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    if (path === 'notifications') return 'Broadcast Hub';
    return path.replace(/-/g, ' ');
  };

  return (
    <div className={cn(
      "h-screen w-full flex antialiased selection:bg-brand-primary/30 selection:text-brand-secondary font-sans overflow-hidden transition-colors duration-1000",
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

      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-hidden">
        <TopBar
          title={getPageTitle()}
          setIsSearchOpen={setIsSearchOpen}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto scrollbar-hide p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...PAGE_TRANSITION}
              className="max-w-[1600px] mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GlobalSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </div>
  );
};

export default AdminLayout;
