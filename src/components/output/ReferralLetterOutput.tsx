import { useEffect, useMemo, useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { CopyButton } from '../common';
import { generateReferralLetter } from '../../utils/referralLetterGenerator';

export function ReferralLetterOutput() {
  const { noteData } = useNote();

  const letter = useMemo(() => generateReferralLetter(noteData), [noteData]);
  const [letterText, setLetterText] = useState(letter);
  const [isEditing, setIsEditing] = useState(false);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (!isManual) {
      setLetterText(letter);
    }
  }, [letter, isManual]);

  const resetToGenerated = () => {
    setIsManual(false);
    setIsEditing(false);
    setLetterText(letter);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Referral Letter</h2>
          {isManual && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Manual edits applied</p>}
        </div>
        <div className="flex items-center gap-2">
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
          <CopyButton text={letterText} />
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={letterText}
          onChange={(e) => {
            setLetterText(e.target.value);
            setIsManual(true);
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
