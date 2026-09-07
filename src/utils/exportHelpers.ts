export interface ExportLogEntry {
  id: string;
  timestamp: number;
  type: 'FULL' | 'CUSTOM';
  format: 'JSON' | 'CSV';
  collections: string[];
  recordCount: number;
  fileSizeBytes: number;
  fileName: string;
  status: 'SUCCESS' | 'FAILED';
}

/**
 * Converts an array of objects into CSV format string.
 */
export const convertJSONToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Extract all unique headers across objects
  const headers = Array.from(
    new Set(
      data.flatMap((item) =>
        typeof item === 'object' && item !== null ? Object.keys(item) : []
      )
    )
  );

  const escapeCSVValue = (val: any): string => {
    if (val === null || val === undefined) return '""';
    if (typeof val === 'object') {
      const jsonStr = JSON.stringify(val).replace(/"/g, '""');
      return `"${jsonStr}"`;
    }
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map((h) => `"${h}"`).join(',');
  const rows = data.map((item) => {
    return headers
      .map((header) => escapeCSVValue(item[header]))
      .join(',');
  });

  return [headerRow, ...rows].join('\r\n');
};

/**
 * Triggers a browser download of text content as a file.
 */
export const triggerFileDownload = (
  content: string,
  filename: string,
  mimeType: string = 'application/json'
) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formats byte size into human readable string.
 */
export const formatByteSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const STORAGE_KEY = 'brainbites_export_history_log';

export const getExportHistory = (): ExportLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse export history:', err);
    return [];
  }
};

export const saveExportHistory = (entry: Omit<ExportLogEntry, 'id'>): ExportLogEntry => {
  const history = getExportHistory();
  const newEntry: ExportLogEntry = {
    ...entry,
    id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
  };
  const updated = [newEntry, ...history].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save export history:', err);
  }
  return newEntry;
};

export const clearExportHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear export history:', err);
  }
};
