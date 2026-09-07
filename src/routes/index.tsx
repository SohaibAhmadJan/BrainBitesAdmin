import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import FactsPage from '../pages/facts/FactsPage';
import CategoriesPage from '../pages/categories/CategoriesPage';
import CollectionsPage from '../pages/collections/CollectionsPage';
import AchievementsPage from '../pages/achievements/AchievementsPage';
import UsersPage from '../pages/users/UsersPage';
import UserActivityPage from '../pages/users/UserActivityPage';
import ReportsPage from '../pages/users/ReportsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import AppSettingsPage from '../pages/settings/AppSettingsPage';
import AuditLogsPage from '../pages/settings/AuditLogsPage';
import ExportPage from '../pages/settings/ExportPage';
import MediaPage from '../pages/media/MediaPage';
import AnalyticsHub from '../pages/analytics/AnalyticsHub';
import AdminsPage from '../pages/admins/AdminsPage';
import QuotesPage from '../pages/quotes/QuotesPage';
import PermissionGate from '../components/ui/PermissionGate';
import { useAdmin } from '../context/AdminContext';
import { AdminRole } from '../types';

const Guard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthorized, isLoading } = useAdmin();

  if (isLoading) return null;
  if (!isAuthorized) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'facts', element: <Guard><FactsPage /></Guard> },
      { path: 'categories', element: <Guard><CategoriesPage /></Guard> },
      { path: 'collections', element: <Guard><CollectionsPage /></Guard> },
      { path: 'achievements', element: <Guard><AchievementsPage /></Guard> },
      { path: 'quotes', element: <Guard><QuotesPage /></Guard> },
      { path: 'users', element: <Guard><UsersPage /></Guard> },
      { path: 'user-activity', element: <Guard><UserActivityPage /></Guard> },
      { path: 'reports', element: <Guard><ReportsPage /></Guard> },
      { path: 'notifications', element: <Guard><NotificationsPage /></Guard> },
      { path: 'analytics', element: <Guard><AnalyticsHub /></Guard> },
      { path: 'settings', element: <Guard><AppSettingsPage /></Guard> },
      { path: 'admins', element: <Guard><AdminsPage /></Guard> },
      { path: 'audit-logs', element: <Guard><AuditLogsPage /></Guard> },
      { path: 'export', element: <Guard><ExportPage /></Guard> },
      { path: '*', element: <Navigate to='/' replace /> }
    ]
  }
]);
