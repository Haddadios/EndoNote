import { useNote } from '../../context/NoteContext';
import { Dropdown } from '../common';
import { universalTeeth, fdiTeeth, toothTypeLabels } from '../../data';

export function PatientInfo() {
  const { noteData, preferences, updateTooth } = useNote();

  const teethOptions = preferences.toothNotation === 'universal' ? universalTeeth : fdiTeeth;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tooth Information</h2>

      <Dropdown
        label="Tooth Number"
        value={noteData.toothNumber}
        options={teethOptions}
        onChange={updateTooth}
        placeholder="Select tooth..."
        required
      />

      {noteData.toothNumber && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tooth Type: </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{toothTypeLabels[noteData.toothType]}</span>
        </div>
      )}
    </div>
  );
}
