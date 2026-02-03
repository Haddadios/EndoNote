import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import {
  chiefComplaints,
  painCharacteristics,
  painCharacteristicGroups,
  medicalHistoryAlerts,
  genderOptions,
} from '../../data';

export function SubjectiveSection() {
  const { noteData, updateField } = useNote();

  const isFirstVisit = noteData.visitType === 'first_visit';

  // Split medical history alerts into main and more options
  const mainMedicalHistoryItems = [
    'none',
    'hypertension',
    'diabetes',
    'pregnancy',
    'allergy_latex',
    'hiv',
    'anxiety',
    'other',
  ];

  const medicalHistoryMainOptions = medicalHistoryAlerts.filter((opt) =>
    mainMedicalHistoryItems.includes(opt.value)
  );

  const medicalHistoryMoreOptions = medicalHistoryAlerts.filter(
    (opt) => !mainMedicalHistoryItems.includes(opt.value)
  );

  // Chief complaint options split (keep core items visible)
  const mainChiefComplaintItems = ['pain', 'swelling', 'sensitivity_bite', 'trauma', 'recall', 'other'];
  const chiefComplaintMainOptions = chiefComplaints.filter((opt) => mainChiefComplaintItems.includes(opt.value));
  const chiefComplaintMoreOptions = chiefComplaints.filter((opt) => !mainChiefComplaintItems.includes(opt.value));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Subjective</h2>

      {/* Visit Type Toggle */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visit Type</span>
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${isFirstVisit ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              First Visit
            </span>
            <button
              type="button"
              onClick={() => updateField('visitType', isFirstVisit ? 'continuing_treatment' : 'first_visit')}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isFirstVisit ? 'bg-blue-600' : 'bg-green-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isFirstVisit ? 'translate-x-1' : 'translate-x-8'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${!isFirstVisit ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Continuing Treatment
            </span>
          </div>
        </div>
      </div>

      {/* Age and Gender Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TextInput
          label="Age"
          value={noteData.age}
          onChange={(value) => updateField('age', value)}
          placeholder="e.g., 45"
        />

        <Dropdown
          label="Gender"
          value={noteData.gender}
          options={genderOptions}
          onChange={(value) => updateField('gender', value)}
          placeholder="Select gender..."
        />
      </div>

      {/* Vitals Section - Always shown */}
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

      {/* Continuing Treatment Comments - Only shown for continuing treatment */}
      {!isFirstVisit && (
        <div className="mt-4">
          <TextInput
            label="Changes Since Last Visit"
            value={noteData.continuingTreatmentComments}
            onChange={(value) => updateField('continuingTreatmentComments', value)}
            placeholder="Note any changes, symptoms, or concerns since the last visit..."
            multiline
            rows={3}
          />
        </div>
      )}

      {/* First Visit Content - Only shown for first visit */}
      {isFirstVisit && (
        <>
          <CheckboxGroup
            label="Medical History Alerts"
            mainOptions={medicalHistoryMainOptions}
            moreOptions={medicalHistoryMoreOptions}
            selectedValues={noteData.medicalHistoryAlerts}
            onChange={(values) => updateField('medicalHistoryAlerts', values)}
            columns={2}
          />

          <TextInput
            label="Medical History Comments"
            value={noteData.medicalHistoryComments}
            onChange={(value) => updateField('medicalHistoryComments', value)}
            placeholder="Additional medical history notes..."
            multiline
            rows={2}
          />

          <CheckboxGroup
            label="Chief Complaint(s)"
            mainOptions={chiefComplaintMainOptions}
            moreOptions={chiefComplaintMoreOptions}
            selectedValues={noteData.chiefComplaints}
            onChange={(values) => updateField('chiefComplaints', values)}
            columns={2}
          />

          <TextInput
            label="Chief Complaint Details"
            value={noteData.chiefComplaintCustom}
            onChange={(value) => updateField('chiefComplaintCustom', value)}
            placeholder="Enter chief complaint details..."
          />
          <CheckboxGroup
            label="Pain Characteristics"
            options={painCharacteristics}
            groups={painCharacteristicGroups}
            selectedValues={noteData.painCharacteristics}
            onChange={(values) => updateField('painCharacteristics', values)}
            columns={3}
          />

          {noteData.painCharacteristics.includes('history_other') && (
            <TextInput
              label="Specify Pain History"
              value={noteData.painHistoryOther}
              onChange={(value) => updateField('painHistoryOther', value)}
              placeholder="Enter pain history details..."
            />
          )}
        </>
      )}
    </div>
  );
}
