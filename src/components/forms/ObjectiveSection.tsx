import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, Checkbox, TextInput } from '../common';
import {
  vitalityResults,
  percussionPalpationResults,
  mobilityGrades,
  swellingOptions,
  radiographicFindings,
  universalTeeth,
  fdiTeeth,
  toothTypeLabels,
} from '../../data';

export function ObjectiveSection() {
  const { noteData, preferences, updateField, updateTooth } = useNote();

  const teethOptions = preferences.toothNotation === 'universal' ? universalTeeth : fdiTeeth;
  const isFirstVisit = noteData.visitType === 'first_visit';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Objective</h2>

      <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mt-2 mb-2">Tooth Information</h3>
      <Dropdown
        label="Tooth Number"
        value={noteData.toothNumber}
        options={teethOptions}
        onChange={updateTooth}
        placeholder="Select tooth..."
        required
      />

      {noteData.toothNumber && (
        <div className="mt-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tooth Type: </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{toothTypeLabels[noteData.toothType]}</span>
        </div>
      )}

      {/* Continuing Treatment - Show only comment box */}
      {!isFirstVisit && (
        <div className="mt-4">
          <TextInput
            label="Objective Findings"
            value={noteData.continuingTreatmentObjectiveComments}
            onChange={(value) => updateField('continuingTreatmentObjectiveComments', value)}
            placeholder="Document objective findings for this continuation visit..."
            multiline
            rows={4}
          />
        </div>
      )}

      {/* First Visit - Full objective section */}
      {isFirstVisit && (
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

          <CheckboxGroup
            label="Radiographic Findings"
            options={radiographicFindings}
            selectedValues={noteData.radiographicFindings}
            onChange={(values) => updateField('radiographicFindings', values)}
            columns={2}
          />

          <TextInput
            label="Clinical Findings Comments"
            value={noteData.clinicalFindingsComments}
            onChange={(value) => updateField('clinicalFindingsComments', value)}
            placeholder="Additional clinical findings notes..."
            multiline
            rows={2}
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
      )}
    </div>
  );
}
