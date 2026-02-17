import { useEffect, useMemo, useRef, useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { CopyButton } from '../common';
import { generateReferralLetter } from '../../utils/referralLetterGenerator';
import { buildReferralDocx } from '../../utils/referralDocx';
import { saveAs } from 'file-saver';

export function ReferralLetterOutput() {
  const { noteData, referralTemplate, referralOutputDraft, setReferralOutputDraft } = useNote();

  const letter = useMemo(
    () => generateReferralLetter(noteData, referralTemplate.includePostOpInstructions),
    [noteData, referralTemplate.includePostOpInstructions]
  );
  const [letterText, setLetterText] = useState(referralOutputDraft ?? letter);
  const [isEditing, setIsEditing] = useState(false);
  const [isManual, setIsManual] = useState(Boolean(referralOutputDraft));
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const lastGeneratedRef = useRef(letter);
  const previousDraftRef = useRef<string | null | undefined>(referralOutputDraft);

  useEffect(() => {
    const previousDraft = previousDraftRef.current;
    if (previousDraft === referralOutputDraft) {
      return;
    }
    previousDraftRef.current = referralOutputDraft;

    if (referralOutputDraft === null) {
      setIsManual(false);
      setHasPendingUpdate(false);
      setLetterText(letter);
      lastGeneratedRef.current = letter;
      return;
    }

    if (previousDraft === null || previousDraft === undefined) {
      setIsManual(true);
      setHasPendingUpdate(false);
    }

    setLetterText(referralOutputDraft);
  }, [referralOutputDraft, letter]);

  useEffect(() => {
    if (lastGeneratedRef.current === letter) {
      return;
    }
    lastGeneratedRef.current = letter;

    if (!isManual) {
      setLetterText(letter);
      setHasPendingUpdate(false);
    } else {
      setHasPendingUpdate(true);
    }
  }, [letter, isManual]);

  const resetToGenerated = () => {
    setIsManual(false);
    setIsEditing(false);
    setLetterText(letter);
    setHasPendingUpdate(false);
    setReferralOutputDraft(null);
  };

  const applyLatestGenerated = () => {
    setIsManual(false);
    setLetterText(letter);
    setHasPendingUpdate(false);
    setReferralOutputDraft(null);
  };

  const handleDownloadDocx = async () => {
    try {
      const blob = await buildReferralDocx(noteData, referralTemplate);
      const patientName = noteData.patientName ? noteData.patientName.replace(/\s+/g, '_') : 'referral';
      saveAs(blob, `${patientName}_referral_letter.docx`);
    } catch (err) {
      console.error('Failed to generate referral .docx', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Referral Letter</h2>
          {isManual && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Manual edits applied</p>}
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
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-xs px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isEditing ? 'Done Editing' : 'Edit Letter'}
          </button>
          <button
            type="button"
            onClick={handleDownloadDocx}
            className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Download .docx
          </button>
          <CopyButton text={letterText} />
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={letterText}
          onChange={(e) => {
            const updated = e.target.value;
            setLetterText(updated);
            setIsManual(true);
            setReferralOutputDraft(updated);
          }}
          rows={22}
          className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
        />
      ) : (
        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
          {letterText}
        </pre>
      )}
    </div>
  );
}
