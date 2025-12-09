import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import {
  chiefComplaints,
  painCharacteristics,
  painDurations,
  medicalHistoryAlerts,
} from '../../data';

export function SubjectiveSection() {
  const { noteData, updateField } = useNote();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Subjective</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Blood Pressure"
          value={noteData.bloodPressure}
          onChange={(value) => updateField('bloodPressure', value)}
          placeholder="e.g., 120/80 mmHg"
        />

        <TextInput
          label="Pulse"
          value={noteData.pulse}
          onChange={(value) => updateField('pulse', value)}
          placeholder="e.g., 72 bpm"
        />

        <TextInput
          label="Respiratory Rate"
          value={noteData.respiratoryRate}
          onChange={(value) => updateField('respiratoryRate', value)}
          placeholder="e.g., 16/min"
        />
      </div>

      <CheckboxGroup
        label="Medical History Alerts"
        options={medicalHistoryAlerts}
        selectedValues={noteData.medicalHistoryAlerts}
        onChange={(values) => updateField('medicalHistoryAlerts', values)}
        columns={2}
      />

      <CheckboxGroup
        label="Chief Complaint(s)"
        options={chiefComplaints}
        selectedValues={noteData.chiefComplaints}
        onChange={(values) => updateField('chiefComplaints', values)}
        columns={2}
      />

      {noteData.chiefComplaints.includes('other') && (
        <TextInput
          label="Specify Chief Complaint"
          value={noteData.chiefComplaintCustom}
          onChange={(value) => updateField('chiefComplaintCustom', value)}
          placeholder="Enter chief complaint..."
        />
      )}

      <Dropdown
        label="Duration"
        value={noteData.painDuration}
        options={painDurations}
        onChange={(value) => updateField('painDuration', value)}
        placeholder="Select duration..."
      />

      <CheckboxGroup
        label="Pain Characteristics"
        options={painCharacteristics}
        selectedValues={noteData.painCharacteristics}
        onChange={(values) => updateField('painCharacteristics', values)}
        columns={2}
      />
    </div>
  );
}
