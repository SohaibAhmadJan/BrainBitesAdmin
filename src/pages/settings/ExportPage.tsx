import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileJson,
  FileSpreadsheet,
  Download,
  RefreshCcw,
  Database,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  Layers,
  HardDrive,
  CheckSquare,
  Square,
  Zap,
  ShieldCheck,
  FileCode,
  Archive,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import {
  fetchBites,
  fetchCategories,
  fetchCollections,
  fetchQuotes,
  fetchAchievements,
  fetchUsers,
  fetchNotifications,
  fetchAppSettings,
  fetchAuditLogs,
  fetchReports,
  fetchAdmins,
} from '../../services/firestoreService';
import {
  convertJSONToCSV,
  triggerFileDownload,
  formatByteSize,
  getExportHistory,
  saveExportHistory,
  clearExportHistory,
  ExportLogEntry,
} from '../../utils/exportHelpers';

interface CollectionDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  countEstimate: string;
  fetcher: () => Promise<any[]>;
}

const ExportPage: React.FC = () => {
  const { theme } = useTheme();
  const { isAtLeast } = useAdmin();

  // Selected collections for custom export
  const [selectedCollections, setSelectedCollections] = useState<string[]>([
    'facts',
    'categories',
    'collections',
    'quotes',
  ]);

  // Export options
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED_ONLY' | 'DRAFT_ONLY'>('ALL');
  const [dateRangeDays, setDateRangeDays] = useState<number>(0); // 0 = All Time, 1 = 1 day, 3 = 3 days, 7 = 7 days, 15 = 15 days

  // State
  const [isExportingFull, setIsExportingFull] = useState(false);
  const [isExportingCustom, setIsExportingCustom] = useState(false);
  const [currentFetchStep, setCurrentFetchStep] = useState<string>('');
  const [exportHistory, setExportHistory] = useState<ExportLogEntry[]>([]);

  // Load export history on mount
  useEffect(() => {
    setExportHistory(getExportHistory());
  }, []);

  const collectionDefinitions: CollectionDefinition[] = useMemo(
    () => [
      {
        id: 'facts',
        name: 'Facts & Bites',
        description: 'Micro-learning bites, category links, and key takeaways',
        icon: Layers,
        countEstimate: 'Primary Dataset',
        fetcher: () => fetchBites(5000),
      },
      {
        id: 'categories',
        name: 'Categories',
        description: 'Taxonomy, color themes, sort ordering',
        icon: Filter,
        countEstimate: 'Core Metadata',
        fetcher: async () => await fetchCategories(),
      },
      {
        id: 'collections',
        name: 'Collections',
        description: 'Curated playlists and fact groupings',
        icon: Archive,
        countEstimate: 'Curated Sets',
        fetcher: async () => await fetchCollections(),
      },
      {
        id: 'quotes',
        name: 'Inspirational Quotes',
        description: 'Daily quotes, authors, and category mappings',
        icon: FileCode,
        countEstimate: 'Daily Quotes',
        fetcher: async () => await fetchQuotes(),
      },
      {
        id: 'achievements',
        name: 'Achievements',
        description: 'Gamification badges, milestones, progress criteria',
        icon: Zap,
        countEstimate: 'Gamification',
        fetcher: async () => await fetchAchievements(),
      },
      {
        id: 'users',
        name: 'User Profiles',
        description: 'Accounts, reading stats, preferences, and streaks',
        icon: HardDrive,
        countEstimate: 'User Accounts',
        fetcher: async () => await fetchUsers(5000),
      },
      {
        id: 'notifications',
        name: 'Push Notifications',
        description: 'Sent broadcasts, scheduled tips, deep link parameters',
        icon: Clock,
        countEstimate: 'Broadcast Logs',
        fetcher: async () => await fetchNotifications(2000),
      },
      {
        id: 'app_settings',
        name: 'App Configuration',
        description: 'Global flags, maintenance modes, home layout config',
        icon: ShieldCheck,
        countEstimate: 'Global Config',
        fetcher: async () => {
          const res = await fetchAppSettings();
          return res ? [res] : [];
        },
      },
      {
        id: 'audit_logs',
        name: 'Audit Logs',
        description: 'Admin action audit history and security trail',
        icon: ShieldCheck,
        countEstimate: 'Audit History',
        fetcher: async () => await fetchAuditLogs(2000),
      },
      {
        id: 'reports',
        name: 'User Reports',
        description: 'User-submitted feedback and bug reports',
        icon: FileJson,
        countEstimate: 'User Feedback',
        fetcher: async () => await fetchReports(2000),
      },
      {
        id: 'admins',
        name: 'Admin Roster',
        description: 'Admin user roles and security permissions',
        icon: ShieldCheck,
        countEstimate: 'Admin Access',
        fetcher: async () => await fetchAdmins(),
      },
    ],
    []
  );

  const toggleSelectCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCollections(collectionDefinitions.map((c) => c.id));
  };

  const handleClearSelection = () => {
    setSelectedCollections([]);
  };

  /**
   * Helper to filter records by creation/update timestamp threshold
   */
  const filterByDateRange = (items: any[], days: number): any[] => {
    if (days <= 0 || !Array.isArray(items)) return items;
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

    return items.filter((item) => {
      if (!item || typeof item !== 'object') return true;
      const itemTimestamp =
        item.createdAt ||
        item.timestamp ||
        item.updatedAt ||
        item.account?.createdAt ||
        item.stats?.lastActiveAt;

      // If item has no timestamp property, keep it
      if (!itemTimestamp) return true;
      return itemTimestamp >= cutoffMs;
    });
  };

  /**
   * Full Database Export Handler
   */
  const handleFullDatabaseExport = async () => {
    if (isExportingFull || isExportingCustom) return;
    setIsExportingFull(true);
    const toastId = toast.loading('Initiating Full Database Backup...');

    try {
      const fullBackupData: Record<string, any> = {
        _metadata: {
          exportType: 'FULL_BACKUP',
          exportedAt: new Date().toISOString(),
          exportedAtTimestamp: Date.now(),
          app: 'BrainBites / Psych Admin',
          schemaVersion: '1.0.0',
        },
        collections: {},
      };

      let totalRecords = 0;

      for (const def of collectionDefinitions) {
        setCurrentFetchStep(`Fetching ${def.name}...`);
        try {
          let data = await def.fetcher();
          data = filterByDateRange(data, dateRangeDays);
          fullBackupData.collections[def.id] = data;
          totalRecords += data.length;
        } catch (err) {
          console.warn(`Failed to fetch collection ${def.id}`, err);
          fullBackupData.collections[def.id] = [];
        }
      }

      setCurrentFetchStep('Generating JSON File...');
      const jsonStr = JSON.stringify(fullBackupData, null, 2);
      const fileName = `brainbites_full_backup_${new Date().toISOString().split('T')[0]}.json`;

      triggerFileDownload(jsonStr, fileName, 'application/json');

      const byteSize = new Blob([jsonStr]).size;
      saveExportHistory({
        timestamp: Date.now(),
        type: 'FULL',
        format: 'JSON',
        collections: collectionDefinitions.map((c) => c.id),
        recordCount: totalRecords,
        fileSizeBytes: byteSize,
        fileName: fileName,
        status: 'SUCCESS',
      });

      setExportHistory(getExportHistory());
      toast.success(`Full Backup Exported (${totalRecords} records, ${formatByteSize(byteSize)})!`, { id: toastId });
    } catch (err: any) {
      console.error('Full backup export failed:', err);
      toast.error(`Full Export Failed: ${err?.message || 'Unknown error'}`, { id: toastId });
    } finally {
      setIsExportingFull(false);
      setCurrentFetchStep('');
    }
  };

  /**
   * Custom Collection Export Handler
   */
  const handleCustomExport = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection to export.');
      return;
    }

    if (isExportingFull || isExportingCustom) return;
    setIsExportingCustom(true);
    const toastId = toast.loading(`Exporting ${selectedCollections.length} Collection(s) as ${exportFormat}...`);

    try {
      const selectedDefs = collectionDefinitions.filter((d) => selectedCollections.includes(d.id));
      let totalRecords = 0;
      const exportPayload: Record<string, any> = {};

      for (const def of selectedDefs) {
        setCurrentFetchStep(`Loading ${def.name}...`);
        let data = await def.fetcher();

        // Apply publication status filter if applicable
        if (statusFilter !== 'ALL') {
          data = data.filter((item) => {
            if ('isPublished' in item) {
              return statusFilter === 'PUBLISHED_ONLY' ? item.isPublished : !item.isPublished;
            }
            if ('isActive' in item) {
              return statusFilter === 'PUBLISHED_ONLY' ? item.isActive : !item.isActive;
            }
            return true;
          });
        }

        // Apply date range filter (1 day, 3 days, 7 days, 15 days)
        data = filterByDateRange(data, dateRangeDays);

        exportPayload[def.id] = data;
        totalRecords += data.length;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      let fileContent = '';
      let fileName = '';
      let mimeType = 'application/json';

      if (exportFormat === 'JSON') {
        const fullObject = {
          _metadata: {
            exportType: 'CUSTOM',
            exportedAt: new Date().toISOString(),
            collections: selectedCollections,
            filters: { statusFilter, dateRangeDays: dateRangeDays === 0 ? 'ALL_TIME' : `${dateRangeDays}_DAYS` },
          },
          data: exportPayload,
        };
        fileContent = JSON.stringify(fullObject, null, 2);
        fileName = `brainbites_export_${selectedCollections.join('_')}_${dateStr}.json`;
        mimeType = 'application/json';
      } else {
        // CSV Export
        mimeType = 'text/csv';
        if (selectedDefs.length === 1) {
          const singleCollectionId = selectedCollections[0];
          const dataArray = exportPayload[singleCollectionId] || [];
          fileContent = convertJSONToCSV(dataArray);
          fileName = `brainbites_${singleCollectionId}_${dateStr}.csv`;
        } else {
          // Multi-collection CSV: combine into labeled sections
          const csvParts: string[] = [];
          for (const [collKey, collData] of Object.entries(exportPayload)) {
            csvParts.push(`=== COLLECTION: ${collKey.toUpperCase()} ===`);
            csvParts.push(convertJSONToCSV(collData as any[]));
            csvParts.push('\r\n');
          }
          fileContent = csvParts.join('\r\n');
          fileName = `brainbites_multi_collection_${dateStr}.csv`;
        }
      }

      triggerFileDownload(fileContent, fileName, mimeType);

      const byteSize = new Blob([fileContent]).size;
      saveExportHistory({
        timestamp: Date.now(),
        type: 'CUSTOM',
        format: exportFormat,
        collections: selectedCollections,
        recordCount: totalRecords,
        fileSizeBytes: byteSize,
        fileName: fileName,
        status: 'SUCCESS',
      });

      setExportHistory(getExportHistory());
      toast.success(`Export Complete! (${totalRecords} items, ${formatByteSize(byteSize)})`, { id: toastId });
    } catch (err: any) {
      console.error('Custom export failed:', err);
      toast.error(`Custom Export Failed: ${err?.message || 'Unknown error'}`, { id: toastId });
    } finally {
      setIsExportingCustom(false);
      setCurrentFetchStep('');
    }
  };

  const handleClearHistoryLogs = () => {
    clearExportHistory();
    setExportHistory([]);
    toast.success('Export history cleared.');
  };

  const lastExport = exportHistory.length > 0 ? exportHistory[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* High-End Header */}
      <div className="glass p-6 rounded-2xl shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
            <div className="p-2.5 bg-brand-primary/10 rounded-xl">
              <FileJson className="text-brand-primary" size={26} />
            </div>
            Export Repository
          </h2>
          <p className="text-sub text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1 opacity-60">
            System Data Backups • Custom Collection Export Studio
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl border border-brand-sage/10">
            <Database size={14} className="text-brand-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
              System State: <span className="text-brand-primary">Ready</span>
            </p>
          </div>
          <button
            onClick={handleFullDatabaseExport}
            disabled={isExportingFull || isExportingCustom}
            className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isExportingFull ? (
              <>
                <RefreshCcw size={16} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Full System Backup</span>
              </>
            )}
          </button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />
      </div>

      {/* Overview Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-brand-sage/10 relative overflow-hidden flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-brand-primary/10 rounded-2xl text-brand-primary">
            <Layers size={26} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Total Collections</p>
            <h3 className="text-2xl font-black">{collectionDefinitions.length} Available</h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-brand-sage/10 relative overflow-hidden flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-brand-primary/10 rounded-2xl text-brand-primary">
            <CheckSquare size={26} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Selected for Export</p>
            <h3 className="text-2xl font-black text-brand-primary">{selectedCollections.length} Selected</h3>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-brand-sage/10 relative overflow-hidden flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Last Successful Export</p>
            <h3 className="text-sm font-black tracking-tight">
              {lastExport ? `${new Date(lastExport.timestamp).toLocaleDateString()} (${lastExport.format})` : 'No Recent Backup'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Full-Width Custom Export Studio */}
      <div className="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-brand-sage/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-brand-sage/10">
          <div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Filter className="text-brand-primary" size={22} />
              Custom Collection Export Studio
            </h3>
            <p className="text-xs text-sub opacity-60 mt-1">
              Select target datasets, pick output format (JSON or CSV), and apply date range timeframe filters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all flex items-center gap-2"
            >
              <CheckSquare size={16} />
              Select All
            </button>
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 rounded-xl text-xs font-bold glass opacity-70 hover:opacity-100 transition-all flex items-center gap-2"
            >
              <Square size={16} />
              Clear Selection
            </button>
          </div>
        </div>

        {/* Collection Grid - 3 Columns on Large Screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collectionDefinitions.map((coll) => {
            const isSelected = selectedCollections.includes(coll.id);
            const IconComponent = coll.icon;
            return (
              <motion.div
                key={coll.id}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => toggleSelectCollection(coll.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary/40 shadow-lg'
                    : 'glass border-brand-sage/10 hover:border-brand-sage/30 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected ? 'bg-brand-primary text-white' : 'bg-brand-sage/10 text-brand-primary'
                    }`}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{coll.name}</h4>
                    <p className="text-[11px] text-sub opacity-60 line-clamp-2 mt-0.5">{coll.description}</p>
                    <span className="inline-block mt-2.5 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-brand-sage/10 text-brand-primary">
                      {coll.countEstimate}
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  {isSelected ? (
                    <CheckCircle2 size={20} className="text-brand-primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-sage/30" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Export Configuration Controls */}
        <div className="pt-6 border-t border-brand-sage/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Format Toggle */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-2">
              Export Format
            </label>
            <div className="flex rounded-xl glass p-1 border border-brand-sage/10">
              <button
                onClick={() => setExportFormat('JSON')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  exportFormat === 'JSON'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <FileJson size={16} />
                Formatted JSON
              </button>
              <button
                onClick={() => setExportFormat('CSV')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  exportFormat === 'CSV'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <FileSpreadsheet size={16} />
                Spreadsheet CSV
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-2">
              Content Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass border border-brand-sage/10 text-xs font-bold focus:outline-none focus:border-brand-primary"
            >
              <option value="ALL">All Items (Published & Draft)</option>
              <option value="PUBLISHED_ONLY">Published / Active Only</option>
              <option value="DRAFT_ONLY">Draft / Inactive Only</option>
            </select>
          </div>

          {/* Date Range / Timeframe Filter (Replaced Record Limit) */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-2 flex items-center gap-1.5">
              <Calendar size={12} className="text-brand-primary" />
              Timeframe / Date Range
            </label>
            <select
              value={dateRangeDays}
              onChange={(e: any) => setDateRangeDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl glass border border-brand-sage/10 text-xs font-bold focus:outline-none focus:border-brand-primary"
            >
              <option value={0}>All Time (No Time Filter)</option>
              <option value={1}>1 Day (Last 24 Hours)</option>
              <option value={3}>3 Days (Last 72 Hours)</option>
              <option value={7}>7 Days (Last Week)</option>
              <option value={15}>15 Days (Last 15 Days)</option>
            </select>
          </div>
        </div>

        {/* Custom Export Trigger Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-brand-sage/10">
          <div className="text-xs font-medium text-sub">
            Ready to export <span className="font-black text-brand-primary">{selectedCollections.length} Collection(s)</span> as{' '}
            <span className="font-black text-brand-primary">{exportFormat}</span>
            {dateRangeDays > 0 && (
              <>
                {' '}
                for <span className="font-black text-brand-primary">{dateRangeDays} Day(s)</span>
              </>
            )}.
          </div>

          <button
            onClick={handleCustomExport}
            disabled={isExportingFull || isExportingCustom || selectedCollections.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-brand-primary text-white shadow-xl hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isExportingCustom ? (
              <>
                <RefreshCcw size={16} className="animate-spin" />
                <span>Processing ({currentFetchStep || 'Exporting...'})</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Generate & Download Custom Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Activity & Download History Table */}
      <div className="glass rounded-2xl p-8 shadow-2xl border border-brand-sage/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <Clock className="text-brand-primary" size={20} />
              Export Activity & History Logs
            </h3>
            <p className="text-xs text-sub opacity-60 mt-1">
              Historical record of data export operations generated in this session.
            </p>
          </div>

          {exportHistory.length > 0 && (
            <button
              onClick={handleClearHistoryLogs}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
            >
              <Trash2 size={14} />
              Clear Log History
            </button>
          )}
        </div>

        {exportHistory.length === 0 ? (
          <div className="py-14 text-center text-sub border-dashed border-2 border-brand-sage/10 rounded-2xl">
            <FileJson size={40} className="mx-auto mb-3 opacity-30 text-brand-primary" />
            <p className="text-xs font-black uppercase tracking-wider opacity-60">No recent export logs recorded</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[285px] rounded-xl border border-brand-sage/10 custom-scrollbar">
            <table className="w-full text-left text-xs relative">
              <thead className="sticky top-0 bg-brand-bg/90 backdrop-blur-md z-10 border-b border-brand-sage/10">
                <tr className="text-[10px] font-black uppercase tracking-wider opacity-60">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Collections</th>
                  <th className="py-3.5 px-4">Records</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sage/5">
                {exportHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-primary/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-bold">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                          log.type === 'FULL'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black">{log.format}</td>
                    <td className="py-4 px-4 text-sub opacity-80 max-w-sm truncate">
                      {log.collections.join(', ')}
                    </td>
                    <td className="py-4 px-4 font-bold">{log.recordCount}</td>
                    <td className="py-4 px-4 font-mono">{formatByteSize(log.fileSizeBytes)}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold">
                        <CheckCircle2 size={14} />
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Processing Loader Overlay */}
      <AnimatePresence>
        {(isExportingFull || isExportingCustom) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="glass p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl border border-brand-primary/30">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto animate-bounce">
                <RefreshCcw size={32} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-black">Generating Export Payload</h3>
                <p className="text-xs text-brand-primary font-bold uppercase tracking-widest mt-2 animate-pulse">
                  {currentFetchStep || 'Fetching Firestore data...'}
                </p>
              </div>
              <div className="w-full bg-brand-sage/10 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-primary to-brand-accent h-full w-full animate-pulse" />
              </div>
              <p className="text-[10px] text-sub opacity-50 uppercase tracking-widest">
                Please wait while browser compiles data stream
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportPage;
