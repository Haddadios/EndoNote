import { useEffect, useMemo, useRef, useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { CopyButton } from '../common';
import { generateSOAPNote } from '../../utils/soapGenerator';

export function NoteOutput() {
  const { noteData, preferences, noteOutputDraft, setNoteOutputDraft } = useNote();

  const soapNote = useMemo(
    () => generateSOAPNote(noteData, parseFloat(preferences.defaultCarpuleVolume ?? '1.8')),
    [noteData, preferences.defaultCarpuleVolume]
  );
  const [noteText, setNoteText] = useState(noteOutputDraft ?? soapNote);
  const [isEditing, setIsEditing] = useState(false);
  const [isManual, setIsManual] = useState(Boolean(noteOutputDraft));
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const lastGeneratedRef = useRef(soapNote);
  const previousDraftRef = useRef<string | null | undefined>(noteOutputDraft);

  // Sync manual draft from storage or restore events
  useEffect(() => {
    const previousDraft = previousDraftRef.current;
    if (previousDraft === noteOutputDraft) {
      return;
    }
    previousDraftRef.current = noteOutputDraft;

    if (noteOutputDraft === null) {
      setIsManual(false);
      setHasPendingUpdate(false);
      setNoteText(soapNote);
      lastGeneratedRef.current = soapNote;
      return;
    }

    if (previousDraft === null || previousDraft === undefined) {
      setIsManual(true);
      setHasPendingUpdate(false);
    }

    setNoteText(noteOutputDraft);
  }, [noteOutputDraft, soapNote]);

  // Keep generated note in sync unless user has made manual edits
  useEffect(() => {
    if (lastGeneratedRef.current === soapNote) {
      return;
    }
    lastGeneratedRef.current = soapNote;

    if (!isManual) {
      setNoteText(soapNote);
      setHasPendingUpdate(false);
    } else {
      setHasPendingUpdate(true);
    }
  }, [soapNote, isManual]);

  const toggleEditing = () => setIsEditing((prev) => !prev);

  const resetToGenerated = () => {
    setIsManual(false);
    setIsEditing(false);
    setNoteText(soapNote);
    setHasPendingUpdate(false);
    setNoteOutputDraft(null);
  };

  const applyLatestGenerated = () => {
    setIsManual(false);
    setNoteText(soapNote);
    setHasPendingUpdate(false);
    setNoteOutputDraft(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Generated Note</h2>
          {isManual && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Manual edits applied</p>
          )}
          {hasPendingUpdate && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Form updated since last manual edit.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasPendingUpdate && (
            <button
              type="button"
              onClick={applyLatestGenerated}
              className="text-xs px-3 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/60"
            >
              Update from Form
            </button>
          )}
          {isManual && (
            <button
              type="button"
              onClick={resetToGenerated}
              className="text-xs px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset to Generated
            </button>
          )}
          <button
            type="button"
            onClick={toggleEditing}
            className="text-xs px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isEditing ? 'Done Editing' : 'Edit Note'}
          </button>
          <CopyButton text={noteText} />
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={noteText}
          onChange={(e) => {
            const updated = e.target.value;
            setNoteText(updated);
            setIsManual(true);
            setNoteOutputDraft(updated);
          }}
          rows={18}
          className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
        />
      ) : (
        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
          {noteText}
        </pre>
      )}
    </div>
  );
}
