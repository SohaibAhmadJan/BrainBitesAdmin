interface ImportExportProps {
  onImport: (files: FileList | null) => void;
  onExport: () => void;
  error?: string;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport, onExport, error }) => {
  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold text-white">Bulk Data Operations</h2>

        <div className="p-6 bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl text-center space-y-4 group hover:border-emerald-500/50 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Import JSON Database</p>
            <p className="text-xs text-slate-500 mt-1">Select a `facts.json` file to batch-upload to Firestore.</p>
          </div>
          <input
            type="file"
            accept="application/json"
            multiple
            onChange={(e) => onImport(e.target.files)}
            className="hidden"
            id="json-upload"
          />
          <label
            htmlFor="json-upload"
            className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Choose File
          </label>
          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
        </div>

        <div className="pt-6 border-t border-slate-700 flex justify-between items-center">
          <div>
            <h4 className="text-white font-medium">Backup Content</h4>
            <p className="text-xs text-slate-500 mt-0.5">Download current Firestore state as a JSON file.</p>
          </div>
          <button
            onClick={onExport}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all"
          >
            Export to JSON
          </button>
        </div>
      </div>

      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4">
        <div className="text-blue-400 pt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-400">JSON Structure Note</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ensure your JSON contains an array of objects matching the `BiteItem` specification. Missing fields will be populated with default values upon import.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
