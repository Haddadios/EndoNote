import { useEffect } from 'react';
import { useNote } from '../../context/NoteContext';
import { Dropdown, Odontogram } from '../common';
import {
  universalTeeth,
  fdiTeeth,
  pulpalDiagnoses,
  periapicalDiagnoses,
  prognosisOptions,
  treatmentTypes,
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

  const teethOptions = preferences.toothNotation === 'universal' ? universalTeeth : fdiTeeth;

  // Get list of teeth that have diagnoses
  const selectedTeeth = noteData.toothDiagnoses
    .filter(d => d.toothNumber)
    .map(d => d.toothNumber);

  // Handle tooth selection from odontogram
  const handleToothSelect = (toothNumber: string) => {
    const existingDiagnosis = noteData.toothDiagnoses.find(d => d.toothNumber === toothNumber);
    
    if (existingDiagnosis) {
      // Clicking same tooth again - deselect it (toggle off)
      if (noteData.toothDiagnoses.length > 1) {
        removeToothDiagnosis(existingDiagnosis.id);
        const remaining = noteData.toothDiagnoses.find((d) => d.toothNumber && d.id !== existingDiagnosis.id);
        updateTooth(remaining?.toothNumber || '');
      } else {
        // If it's the only diagnosis, just clear the tooth number instead of removing
        updateToothDiagnosis(existingDiagnosis.id, 'toothNumber', '');
        updateTooth('');
      }
    } else {
      // Clicking a different tooth - add it to selection
      const emptyDiagnosis = noteData.toothDiagnoses.find(d => !d.toothNumber);
      
      if (emptyDiagnosis) {
        // Use the first empty slot
        updateToothDiagnosis(emptyDiagnosis.id, 'toothNumber', toothNumber);
      } else {
        // No empty slots, add a new diagnosis entry with the tooth number
        addToothDiagnosis(toothNumber);
      }

      updateTooth(toothNumber);
    }
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
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Assessment</h2>

      {/* Odontogram */}
      <div className="mb-6">
        <Odontogram
          selectedTeeth={selectedTeeth}
          onToothSelect={handleToothSelect}
          notation={preferences.toothNotation}
        />
      </div>

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
