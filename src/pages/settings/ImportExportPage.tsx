import React, { useState } from 'react';
import { Download, Upload, Info, CheckCircle2, AlertTriangle, FileJson } from 'lucide-react';
import { BiteItem } from '../../types';
import { bulkImportBites, fetchBites } from '../../services/firestoreService';
import ImportExport from '../../components/ImportExport';

const ImportExportPage = () => {
  const [importError, setImportError] = useState('');

  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImportError('');
    try {
      let importedFacts: any[] = [];
      let importedQuizzes: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const text = await files[i].text();
        const parsed = JSON.parse(text);
        if (parsed.facts) importedFacts = [...importedFacts, ...parsed.facts];
        else if (parsed.quizzes) importedQuizzes = [...importedQuizzes, ...parsed.quizzes];
        else if (Array.isArray(parsed)) {
           if (parsed.length > 0 && parsed[0].factId) importedQuizzes = [...importedQuizzes, ...parsed];
           else importedFacts = [...importedFacts, ...parsed];
        }
      }

      if (importedFacts.length === 0) {
        throw new Error('No valid facts found in the selected files.');
      }

      const quizMap = new Map(importedQuizzes.map(q => [q.factId, q]));

      const normalized: BiteItem[] = importedFacts.map(fact => {
        const quiz = quizMap.get(fact.id);
        return {
          id: String(fact.id),
          fact: fact.fact || '',
          category: fact.category || 'Human Behavior',
          fullFact: fact.fullFact || '',
          whyItMatters: fact.whyItMatters || '',
          quizQuestion: quiz?.question || fact.quizQuestion || null,
          quizOptions: quiz?.options || fact.quizOptions || null,
          correctAnswerIndex: quiz?.correctIndex ?? fact.correctAnswerIndex ?? null,
          teaserType: quiz?.teaserType || fact.teaserType || null,
          readTimeMinutes: fact.readTimeMinutes || 1,
          imageUrl: fact.imageUrl || null,
          keywords: fact.keywords || ''
        };
      });

      await bulkImportBites(normalized);
      alert(`Successfully merged and imported ${normalized.length} facts to Firestore!`);
    } catch (e: any) {
      setImportError(e.message || 'Invalid JSON format');
    }
  };

  const handleExport = async () => {
    try {
      const facts = await fetchBites();
      const payload = JSON.stringify(facts, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `brainbites-backup-${new Date().toISOString().split('T')[0]}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
           <FileJson className="text-emerald-500" size={32} />
           Data Bridge
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium italic uppercase tracking-widest text-[10px]">Cloud Migration & Content Backups</p>
      </div>

      <ImportExport
        onImport={handleImport}
        onExport={handleExport}
        error={importError}
      />
    </div>
  );
};

export default ImportExportPage;
