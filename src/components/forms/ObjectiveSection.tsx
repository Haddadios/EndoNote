import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput, Checkbox } from '../common';
import {
  vitalityResults,
  percussionPalpationResults,
  mobilityGrades,
  swellingOptions,
  radiographicFindings,
} from '../../data';

export function ObjectiveSection() {
  const { noteData, updateField } = useNote();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Objective</h2>

      <h3 className="text-md font-medium text-gray-700 mt-2 mb-2">Vitality Tests</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dropdown
          label="Cold Test"
          value={noteData.coldTest}
          options={vitalityResults}
          onChange={(value) => updateField('coldTest', value)}
          placeholder="Select..."
        />

        <Dropdown
          label="EPT"
          value={noteData.eptTest}
          options={vitalityResults}
          onChange={(value) => updateField('eptTest', value)}
          placeholder="Select..."
        />

        <Dropdown
          label="Heat Test"
          value={noteData.heatTest}
          options={vitalityResults}
          onChange={(value) => updateField('heatTest', value)}
          placeholder="Select..."
        />
      </div>

      <h3 className="text-md font-medium text-gray-700 mt-4 mb-2">Clinical Findings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Percussion"
          value={noteData.percussion}
          options={percussionPalpationResults}
          onChange={(value) => updateField('percussion', value)}
          placeholder="Select..."
        />

        <Dropdown
          label="Palpation"
          value={noteData.palpation}
          options={percussionPalpationResults}
          onChange={(value) => updateField('palpation', value)}
          placeholder="Select..."
        />

        <TextInput
          label="Probing Depths"
          value={noteData.probingDepths}
          onChange={(value) => updateField('probingDepths', value)}
          placeholder="e.g., WNL, 3-4mm, 6mm MB"
        />

        <Dropdown
          label="Mobility"
          value={noteData.mobility}
          options={mobilityGrades}
          onChange={(value) => updateField('mobility', value)}
          placeholder="Select..."
        />
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
    </div>
  );
}
