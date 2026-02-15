import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { DraftHistory } from './DraftHistory';
import { TemplateDropdown } from './TemplateDropdown';
import { SettingsPanel } from './SettingsPanel';
import { convertToothNumber } from '../../data';
import type { ToothNotation } from '../../types';

export function Header() {
  const { noteData, preferences, updatePreferences, hasSavedDraft, clearSavedDraft, clearDraftAndReset, saveDraftToHistory, resetForm, updateTooth, updateToothDiagnosis } = useNote();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNotationChange = (newNotation: ToothNotation) => {
    const oldNotation = preferences.toothNotation;

    // Update preference
    updatePreferences({ toothNotation: newNotation });

    // Convert primary tooth number
    if (noteData.toothNumber) {
      const convertedTooth = convertToothNumber(noteData.toothNumber, oldNotation, newNotation);
      updateTooth(convertedTooth);
    }

    // Convert all tooth diagnoses
    noteData.toothDiagnoses.forEach((diagnosis) => {
      if (diagnosis.toothNumber) {
        const convertedTooth = convertToothNumber(diagnosis.toothNumber, oldNotation, newNotation);
        updateToothDiagnosis(diagnosis.id, 'toothNumber', convertedTooth);
      }
    });
  };

  return (
    <>
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EN</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">EndoNote</h1>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Tooth Notation:</span>
              <select
                value={preferences.toothNotation}
                onChange={(e) => handleNotationChange(e.target.value as ToothNotation)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="universal">Universal (1-32)</option>
                <option value="fdi">FDI (11-48)</option>
              </select>
            </label>

            {hasSavedDraft && (
              <>
                <button
                  type="button"
                  onClick={clearSavedDraft}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Clear Draft
                </button>
                <button
                  type="button"
                  onClick={clearDraftAndReset}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                >
                  Clear Draft &amp; Reset
                </button>
              </>
            )}

            <button
              type="button"
              onClick={saveDraftToHistory}
              className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              title="Save current state to draft history"
            >
              Save Draft
            </button>

            <DraftHistory />

            <TemplateDropdown />

            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 text-sm font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="Reset form to defaults"
            >
              Reset Form
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={() => updatePreferences({ darkMode: !preferences.darkMode })}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={preferences.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {preferences.darkMode ? (
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>

    <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
