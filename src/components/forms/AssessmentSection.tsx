import { useNote } from '../../context/NoteContext';
import { Dropdown } from '../common';
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
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-700">Tooth #{index + 1}</h4>
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
  const { noteData, preferences, addToothDiagnosis, updateToothDiagnosis, removeToothDiagnosis } =
    useNote();

  const teethOptions = preferences.toothNotation === 'universal' ? universalTeeth : fdiTeeth;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Assessment</h2>

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

      <button
        onClick={addToothDiagnosis}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
      >
        + Add Another Tooth
      </button>
    </div>
  );
}
