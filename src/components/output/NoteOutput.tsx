import { useMemo } from 'react';
import { useNote } from '../../context/NoteContext';
import { CopyButton } from '../common';
import { generateSOAPNote } from '../../utils/soapGenerator';

export function NoteOutput() {
  const { noteData } = useNote();

  const soapNote = useMemo(() => generateSOAPNote(noteData), [noteData]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Generated Note</h2>
        <CopyButton text={soapNote} />
      </div>

      <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
        {soapNote}
      </pre>
    </div>
  );
}
