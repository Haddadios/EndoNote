import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { CheckboxGroup, Checkbox, TextInput, Odontogram } from '../common';
import {
  vitalityResults,
  percussionPalpationResults,
  mobilityGrades,
  swellingOptions,
  radiographicFindings,
  toothTypeLabels,
} from '../../data';

export function ObjectiveSection() {
  const { noteData, preferences, updateField, updateTooth, addToothDiagnosis, updateToothDiagnosis, removeToothDiagnosis } = useNote();
  const [clearedState, setClearedState] = useState<{
    toothNumber: string;
    coldTest: string[];
    eptTest: string[];
    heatTest: string[];
    vitalityTestComments: string;
    percussion: string[];
    palpation: string[];
    probingDepths: typeof noteData.probingDepths;
    mobility: string[];
    swelling: string[];
    sinusTract: boolean;
    radiographicFindings: string[];
    clinicalFindingsComments: string;
    objectiveNotes: string;
    continuingTreatmentObjectiveComments: string;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const isFirstVisit = noteData.visitType === 'first_visit';

  // Get list of teeth that have diagnoses (for multi-selection)
  const selectedTeeth = noteData.toothDiagnoses
    .filter(d => d.toothNumber)
    .map(d => d.toothNumber);

  // Handle tooth selection from odontogram (supports multiple teeth)
  const handleToothSelect = (toothNumber: string) => {
    const existingDiagnosis = noteData.toothDiagnoses.find(d => d.toothNumber === toothNumber);

    if (existingDiagnosis) {
      // Clicking same tooth again - deselect it (toggle off)
      if (noteData.toothDiagnoses.length > 1) {
        removeToothDiagnosis(existingDiagnosis.id);
        // Update primary tooth to the first remaining tooth
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

      // Update primary tooth if none is set
      if (!noteData.toothNumber) {
        updateTooth(toothNumber);
      }
    }
  };

  if (!isFirstVisit) {
    return null;
  }

  const emptyProbingDepths = { MB: '', B: '', DB: '', DL: '', L: '', ML: '' };

  const handleClearSection = () => {
    setClearedState({
      toothNumber: noteData.toothNumber,
      coldTest: noteData.coldTest,
      eptTest: noteData.eptTest,
      heatTest: noteData.heatTest,
      vitalityTestComments: noteData.vitalityTestComments,
      percussion: noteData.percussion,
      palpation: noteData.palpation,
      probingDepths: noteData.probingDepths,
      mobility: noteData.mobility,
      swelling: noteData.swelling,
      sinusTract: noteData.sinusTract,
      radiographicFindings: noteData.radiographicFindings,
      clinicalFindingsComments: noteData.clinicalFindingsComments,
      objectiveNotes: noteData.objectiveNotes,
      continuingTreatmentObjectiveComments: noteData.continuingTreatmentObjectiveComments,
    });

    updateTooth('');
    updateField('coldTest', []);
    updateField('eptTest', []);
    updateField('heatTest', []);
    updateField('vitalityTestComments', '');
    updateField('percussion', []);
    updateField('palpation', []);
    updateField('probingDepths', emptyProbingDepths);
    updateField('mobility', []);
    updateField('swelling', []);
    updateField('sinusTract', false);
    updateField('radiographicFindings', []);
    updateField('clinicalFindingsComments', '');
    updateField('objectiveNotes', '');
    updateField('continuingTreatmentObjectiveComments', '');
    setShowUndo(true);
  };

  const handleUndoClear = () => {
    if (!clearedState) {
      setShowUndo(false);
      return;
    }
    updateTooth(clearedState.toothNumber);
    updateField('coldTest', clearedState.coldTest);
    updateField('eptTest', clearedState.eptTest);
    updateField('heatTest', clearedState.heatTest);
    updateField('vitalityTestComments', clearedState.vitalityTestComments);
    updateField('percussion', clearedState.percussion);
    updateField('palpation', clearedState.palpation);
    updateField('probingDepths', clearedState.probingDepths);
    updateField('mobility', clearedState.mobility);
    updateField('swelling', clearedState.swelling);
    updateField('sinusTract', clearedState.sinusTract);
    updateField('radiographicFindings', clearedState.radiographicFindings);
    updateField('clinicalFindingsComments', clearedState.clinicalFindingsComments);
    updateField('objectiveNotes', clearedState.objectiveNotes);
    updateField('continuingTreatmentObjectiveComments', clearedState.continuingTreatmentObjectiveComments);
    setShowUndo(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Objective</h2>
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
          <span>Objective section cleared.</span>
          <button
            type="button"
            onClick={handleUndoClear}
            className="text-xs font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* Odontogram for tooth selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">Select Teeth (click to select/deselect)</h3>
        <Odontogram
          selectedTeeth={selectedTeeth}
          onToothSelect={handleToothSelect}
          notation={preferences.toothNotation}
        />
        {selectedTeeth.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-sm border border-blue-200 dark:border-blue-800">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              Selected {selectedTeeth.length === 1 ? 'Tooth' : 'Teeth'}:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTeeth.map((tooth) => {
                const toothType = noteData.toothDiagnoses.find(d => d.toothNumber === tooth)?.toothType;
                return (
                  <span
                    key={tooth}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-full text-xs font-medium"
                  >
                    #{tooth}
                    {toothType && (
                      <span className="text-blue-200 dark:text-blue-300">({toothTypeLabels[toothType]})</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToothSelect(tooth)}
                      className="ml-1 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-full p-0.5"
                      title="Remove tooth"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mt-4 mb-2">Vitality Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CheckboxGroup
              label="Cold Test"
              options={vitalityResults}
              selectedValues={noteData.coldTest}
              onChange={(values) => updateField('coldTest', values)}
              columns={1}
            />

            <CheckboxGroup
              label="EPT"
              options={vitalityResults}
              selectedValues={noteData.eptTest}
              onChange={(values) => updateField('eptTest', values)}
              columns={1}
            />

            <CheckboxGroup
              label="Heat Test"
              options={vitalityResults}
              selectedValues={noteData.heatTest}
              onChange={(values) => updateField('heatTest', values)}
              columns={1}
            />
          </div>

          <TextInput
            label="Vitality Test Comments"
            value={noteData.vitalityTestComments}
            onChange={(value) => updateField('vitalityTestComments', value)}
            placeholder="Additional vitality test notes..."
            multiline
            rows={2}
          />

          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mt-4 mb-2">Clinical Findings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckboxGroup
              label="Percussion"
              options={percussionPalpationResults}
              selectedValues={noteData.percussion}
              onChange={(values) => updateField('percussion', values)}
              columns={1}
            />

            <CheckboxGroup
              label="Palpation"
              options={percussionPalpationResults}
              selectedValues={noteData.palpation}
              onChange={(values) => updateField('palpation', values)}
              columns={1}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Probing Depths (mm)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {(['MB', 'B', 'DB', 'DL', 'L', 'ML'] as const).map((surface) => (
                  <div key={surface} className="flex flex-col items-center">
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{surface}</label>
                    <input
                      type="text"
                      value={noteData.probingDepths[surface]}
                      onChange={(e) => updateField('probingDepths', {
                        ...noteData.probingDepths,
                        [surface]: e.target.value
                      })}
                      className="w-full px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="-"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <CheckboxGroup
                label="Mobility"
                options={mobilityGrades}
                selectedValues={noteData.mobility}
                onChange={(values) => updateField('mobility', values)}
                columns={4}
              />
            </div>
          </div>

          <CheckboxGroup
            label="Swelling"
            options={swellingOptions}
            selectedValues={noteData.swelling}
            onChange={(values) => updateField('swelling', values)}
            columns={2}
          />

          <div className="mb-4 pl-2">
            <Checkbox
              label="Sinus tract present"
              checked={noteData.sinusTract}
              onChange={(checked) => updateField('sinusTract', checked)}
            />
          </div>

          <TextInput
            label="Clinical Findings Comments"
            value={noteData.clinicalFindingsComments}
            onChange={(value) => updateField('clinicalFindingsComments', value)}
            placeholder="Additional clinical findings notes..."
            multiline
            rows={2}
          />

          <CheckboxGroup
            label="Radiographic Findings"
            options={radiographicFindings}
            selectedValues={noteData.radiographicFindings}
            onChange={(values) => updateField('radiographicFindings', values)}
            columns={2}
          />

          {/* Additional Comments */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Comments
            </label>
            <textarea
              value={noteData.objectiveNotes}
              onChange={(e) => updateField('objectiveNotes', e.target.value)}
              rows={3}
              placeholder="Enter additional objective findings, CBCT findings, etc..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
      </>
    </div>
  );
}
