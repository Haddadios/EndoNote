import { useEffect, useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { Dropdown, Odontogram } from '../common';
import {
  universalTeeth,
  fdiTeeth,
  pulpalDiagnoses,
  periapicalDiagnoses,
  prognosisOptions,
  treatmentTypes,
  getToothType,
} from '../../data';
import type { ToothDiagnosis } from '../../types';

interface ToothDiagnosisEntryProps {
  diagnosis: ToothDiagnosis;
  index: number;
  teethOptions: typeof universalTeeth;
  onUpdate: (id: string, field: keyof ToothDiagnosis, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function ToothDiagnosisEntry({
  diagnosis,
  index,
  teethOptions,
  onUpdate,
  onRemove,
  canRemove,
}: ToothDiagnosisEntryProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-700 dark:text-gray-200">Tooth #{index + 1}</h4>
        {canRemove && (
          <button
            onClick={() => onRemove(diagnosis.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Tooth Number"
          value={diagnosis.toothNumber}
          options={teethOptions}
          onChange={(value) => onUpdate(diagnosis.id, 'toothNumber', value)}
          placeholder="Select tooth..."
        />

        <Dropdown
          label="Pulpal Diagnosis"
          value={diagnosis.pulpalDiagnosis}
          options={pulpalDiagnoses}
          onChange={(value) => onUpdate(diagnosis.id, 'pulpalDiagnosis', value)}
          placeholder="Select diagnosis..."
        />

        <Dropdown
          label="Periapical Diagnosis"
          value={diagnosis.periapicalDiagnosis}
          options={periapicalDiagnoses}
          onChange={(value) => onUpdate(diagnosis.id, 'periapicalDiagnosis', value)}
          placeholder="Select diagnosis..."
        />

        <Dropdown
          label="Prognosis"
          value={diagnosis.prognosis}
          options={prognosisOptions}
          onChange={(value) => onUpdate(diagnosis.id, 'prognosis', value)}
          placeholder="Select prognosis..."
        />

        <div className="md:col-span-2">
          <Dropdown
            label="Recommended Treatment"
            value={diagnosis.recommendedTreatment}
            options={treatmentTypes}
            onChange={(value) => onUpdate(diagnosis.id, 'recommendedTreatment', value)}
            placeholder="Select treatment..."
          />
        </div>
      </div>
    </div>
  );
}

export function AssessmentSection() {
  const {
    noteData,
    preferences,
    updateField,
    addToothDiagnosis,
    updateToothDiagnosis,
    removeToothDiagnosis,
    updateTooth,
  } = useNote();

  const isContinuingTreatment = noteData.visitType === 'continuing_treatment';

  const handleToothSelect = (toothNumber: string) => {
    const existingDiagnosis = noteData.toothDiagnoses.find((d) => d.toothNumber === toothNumber);
    if (existingDiagnosis) {
      if (noteData.toothDiagnoses.length > 1) {
        removeToothDiagnosis(existingDiagnosis.id);
        const remaining = noteData.toothDiagnoses.find((d) => d.toothNumber && d.id !== existingDiagnosis.id);
        updateTooth(remaining?.toothNumber || '');
      } else {
        updateToothDiagnosis(existingDiagnosis.id, 'toothNumber', '');
        updateTooth('');
      }
    } else {
      const emptyDiagnosis = noteData.toothDiagnoses.find((d) => !d.toothNumber);
      if (emptyDiagnosis) {
        updateToothDiagnosis(emptyDiagnosis.id, 'toothNumber', toothNumber);
      } else {
        addToothDiagnosis(toothNumber);
      }
      if (!noteData.toothNumber) updateTooth(toothNumber);
    }
  };
  const [clearedState, setClearedState] = useState<{
    toothDiagnoses: ToothDiagnosis[];
    assessmentNotes: string;
    toothNumber: string;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const teethOptions = preferences.toothNotation === 'universal' ? universalTeeth : fdiTeeth;

  const createEmptyDiagnosis = (): ToothDiagnosis => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    toothNumber: '',
    toothType: getToothType(''),
    pulpalDiagnosis: '',
    periapicalDiagnosis: '',
    prognosis: '',
    recommendedTreatment: '',
  });

  const handleClearSection = () => {
    setClearedState({
      toothDiagnoses: noteData.toothDiagnoses,
      assessmentNotes: noteData.assessmentNotes,
      toothNumber: noteData.toothNumber,
    });
    updateField('toothDiagnoses', [createEmptyDiagnosis()]);
    updateField('assessmentNotes', '');
    updateTooth('');
    setShowUndo(true);
  };

  const handleUndoClear = () => {
    if (!clearedState) {
      setShowUndo(false);
      return;
    }
    updateField('toothDiagnoses', clearedState.toothDiagnoses);
    updateField('assessmentNotes', clearedState.assessmentNotes);
    updateTooth(clearedState.toothNumber);
    setShowUndo(false);
  };

  // If no primary tooth is set, mirror from first diagnosis so outputs stay consistent
  useEffect(() => {
    const firstTooth = noteData.toothDiagnoses.find((d) => d.toothNumber)?.toothNumber || '';
    if (firstTooth && noteData.toothNumber !== firstTooth) {
      updateTooth(firstTooth);
    }
  }, [noteData.toothDiagnoses, noteData.toothNumber, updateTooth]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Assessment</h2>
        <button
          type="button"
          onClick={handleClearSection}
          className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Clear Section
        </button>
      </div>

      {showUndo && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
          <span>Assessment section cleared.</span>
          <button
            type="button"
            onClick={handleUndoClear}
            className="text-xs font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* Odontogram for continuing treatment */}
      {isContinuingTreatment && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">Select Teeth (click to select/deselect)</h3>
          <Odontogram
            selectedTeeth={noteData.toothDiagnoses.filter((d) => d.toothNumber).map((d) => d.toothNumber)}
            onToothSelect={handleToothSelect}
            notation={preferences.toothNotation}
          />
          {noteData.toothDiagnoses.some((d) => d.toothNumber) && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-sm border border-blue-200 dark:border-blue-800">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                Selected {noteData.toothDiagnoses.filter((d) => d.toothNumber).length === 1 ? 'Tooth' : 'Teeth'}:
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {noteData.toothDiagnoses.filter((d) => d.toothNumber).map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-full text-xs font-medium"
                  >
                    #{d.toothNumber}
                    <button
                      type="button"
                      onClick={() => handleToothSelect(d.toothNumber)}
                      className="ml-1 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooth Diagnoses */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Tooth Diagnoses</h3>
        {noteData.toothDiagnoses.map((diagnosis, index) => (
          <ToothDiagnosisEntry
            key={diagnosis.id}
            diagnosis={diagnosis}
            index={index}
            teethOptions={teethOptions}
            onUpdate={updateToothDiagnosis}
            onRemove={removeToothDiagnosis}
            canRemove={noteData.toothDiagnoses.length > 1}
          />
        ))}
      </div>

      <button
        onClick={() => addToothDiagnosis()}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
      >
        + Add Another Tooth
      </button>

      {/* Additional Comments */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Comments
        </label>
        <textarea
          value={noteData.assessmentNotes}
          onChange={(e) => updateField('assessmentNotes', e.target.value)}
          rows={3}
          placeholder="Enter any additional assessment notes or observations..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>
    </div>
  );
}
