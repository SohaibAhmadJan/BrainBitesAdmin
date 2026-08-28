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
import ImportExportPage from '../pages/settings/ImportExportPage';
import MediaPage from '../pages/media/MediaPage';
import AnalyticsHub from '../pages/analytics/AnalyticsHub';
import AdminsPage from '../pages/admins/AdminsPage';
import QuotesPage from '../pages/quotes/QuotesPage';
import PermissionGate from '../components/ui/PermissionGate';
import { useAdmin } from '../context/AdminContext';

const Guard = ({ children, permission }: { children: React.ReactNode, permission?: string }) => {
  const { isAuthorized, hasPermission, isLoading } = useAdmin();

  if (isLoading) return null;
  if (!isAuthorized) return <Navigate to="/" replace />;
  if (permission && !hasPermission(permission)) return <PermissionGate />;

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'facts', element: <Guard permission="read.all"><FactsPage /></Guard> },
      { path: 'categories', element: <Guard permission="read.all"><CategoriesPage /></Guard> },
      { path: 'collections', element: <Guard permission="read.all"><CollectionsPage /></Guard> },
      { path: 'achievements', element: <Guard permission="read.all"><AchievementsPage /></Guard> },
      { path: 'quotes', element: <Guard permission="read.all"><QuotesPage /></Guard> },
      { path: 'users', element: <Guard permission="read.all"><UsersPage /></Guard> },
      { path: 'user-activity', element: <Guard permission="read.all"><UserActivityPage /></Guard> },
      { path: 'reports', element: <Guard permission="read.all"><ReportsPage /></Guard> },
      { path: 'notifications', element: <Guard permission="read.all"><NotificationsPage /></Guard> },
      { path: 'analytics', element: <Guard permission="read.all"><AnalyticsHub /></Guard> },
      { path: 'settings', element: <Guard permission="manage.config"><AppSettingsPage /></Guard> },
      { path: 'admins', element: <Guard permission="manage.admins"><AdminsPage /></Guard> },
      { path: 'audit-logs', element: <Guard permission="audit.view"><AuditLogsPage /></Guard> },
      { path: 'import-export', element: <Guard permission="manage.admins"><ImportExportPage /></Guard> },
      { path: '*', element: <Navigate to='/' replace /> }
    ]
  }
]);
