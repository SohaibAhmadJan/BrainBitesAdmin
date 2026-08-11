import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import FactsPage from '../pages/facts/FactsPage';
import CategoriesPage from '../pages/categories/CategoriesPage';
import CollectionsPage from '../pages/collections/CollectionsPage';
import QuizzesPage from '../pages/quizzes/QuizzesPage';
import AchievementsPage from '../pages/achievements/AchievementsPage';
import UsersPage from '../pages/users/UsersPage';
import UserActivityPage from '../pages/users/UserActivityPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import AppSettingsPage from '../pages/settings/AppSettingsPage';
import AuditLogsPage from '../pages/settings/AuditLogsPage';
import ImportExportPage from '../pages/settings/ImportExportPage';
import MediaPage from '../pages/media/MediaPage';
import EngagementPage from '../pages/analytics/EngagementPage';
import AdminsPage from '../pages/admins/AdminsPage';
import QuotesPage from '../pages/quotes/QuotesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'facts', element: <FactsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'quizzes', element: <QuizzesPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'media', element: <MediaPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'user-activity', element: <UserActivityPage /> },
      { path: 'favorites', element: <EngagementPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'broadcasts', element: <NotificationsPage /> },
      { path: 'announcements', element: <NotificationsPage /> },
      { path: 'settings', element: <AppSettingsPage /> },
      { path: 'admins', element: <AdminsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'import-export', element: <ImportExportPage /> },
      { path: '*', element: <Navigate to='/' replace /> }
    ]
  }
]);
